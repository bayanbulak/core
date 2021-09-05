import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Scope,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsDate,
  isMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { Auth } from '~/common/decorator/auth.decorator'
import { ApiName } from '~/common/decorator/openapi.decorator'
import { IsMaster as Master } from '~/common/decorator/role.decorator'
import { MongoIdDto } from '~/shared/dto/id.dto'
import { AdminEventsGateway } from '../../processors/gateway/admin/events.gateway'
import { AuthService } from './auth.service'
import { RolesGuard } from './roles.guard'

export class TokenDto {
  @IsDate()
  @IsOptional()
  @Transform(({ value: v }) => new Date(v))
  expired?: Date

  @IsString()
  @IsNotEmpty()
  name: string
}

@Controller({
  path: 'auth',
  scope: Scope.REQUEST,
})
@ApiName
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminGateway: AdminEventsGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: '判断当前 Token 是否有效 ' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  checkLogged(@Master() isMaster: boolean) {
    return { ok: ~~isMaster, isGuest: !isMaster }
  }

  @Get('token')
  @Auth()
  async getOrVerifyToken(
    @Query('token') token?: string,
    @Query('id') id?: string,
  ) {
    if (typeof token === 'string') {
      return await this.authService.verifyCustomToken(token)
    }
    if (id && typeof id === 'string' && isMongoId(id)) {
      return await this.authService.getTokenSecret(id)
    }
    return await this.authService.getAllAccessToken()
  }

  @Post('token')
  @Auth()
  async generateToken(@Body() body: TokenDto) {
    const { expired, name } = body
    const token = await this.authService.generateAccessToken()
    const model = {
      expired,
      token,
      name,
    }
    await this.authService.saveToken(model)
    return model
  }
  @Delete('token')
  @Auth()
  async deleteToken(@Query() query: MongoIdDto) {
    const { id } = query
    await this.authService.deleteToken(id)
    this.adminGateway.handleTokenExpired(id)
    return 'OK'
  }
}
