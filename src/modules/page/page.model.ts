import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { modelOptions, prop } from '@typegoose/typegoose'
import { Transform } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { WriteBaseModel } from '~/shared/model/base.model'
import { IsNilOrString } from '~/utils/validator/isNilOrString'
export enum PageType {
  'md' = 'md',
  'html' = 'html',
  'json' = 'json',
}

@modelOptions({
  options: {
    customName: 'Page',
  },
})
export class PageModel extends WriteBaseModel {
  @ApiProperty({ description: 'Slug', required: true })
  @prop({ trim: 1, index: true, required: true, unique: true })
  @IsString()
  @IsNotEmpty()
  slug!: string

  @ApiProperty({ description: 'SubTitle', required: false })
  @prop({ trim: true })
  @IsString()
  @IsOptional()
  @IsNilOrString()
  subtitle?: string | null

  @ApiProperty({ description: 'Order', required: false })
  @prop({ default: 1 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  order!: number

  @ApiProperty({
    enum: PageType,
    required: false,
  })
  @prop({ default: 'md' })
  @IsEnum(PageType)
  @IsOptional()
  type?: string
}

export class PartialPageModel extends PartialType(PageModel) {}
