import { NOTE_COLLECTION_NAME } from '~/constants/db.constant'

import { defineMigration } from '../helper'

export default defineMigration('v5.0.0-1', async (db, connection) => {
  try {
    await Promise.all([
      db.collection(NOTE_COLLECTION_NAME).updateMany(
        {
          secret: { $exists: true },
        },
        { $rename: { secret: 'publicAt' } },
      ),
      db.collection(NOTE_COLLECTION_NAME).updateMany(
        {
          hasMemory: { $exists: true },
        },
        { $rename: { secret: 'bookmark' } },
      ),
    ])
  } catch (err) {
    console.error('v5.0.0-1 migration failed')
    throw err
  }
})
