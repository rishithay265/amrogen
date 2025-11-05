import { Pool } from 'pg'
import { createClient } from 'redis'

const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/amrogen',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

let redisConnected = false

export async function connectRedis() {
  if (!redisConnected) {
    await redisClient.connect()
    redisConnected = true
    console.log('✓ Redis connected')
  }
  return redisClient
}

export async function getDb() {
  return dbPool
}

export async function getRedis() {
  if (!redisConnected) {
    await connectRedis()
  }
  return redisClient
}

export { dbPool, redisClient }
