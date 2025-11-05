import { dbPool } from './client'
import { SQL_SCHEMA } from './schema'
import dotenv from 'dotenv'

dotenv.config()

async function migrate() {
  try {
    console.log('Running database migrations...')
    await dbPool.query(SQL_SCHEMA)
    console.log('✓ Migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('✗ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
