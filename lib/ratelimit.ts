import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

const redis = createRedis()

export const uploadRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '10 m'), prefix: 'rl:upload' })
  : null

export const authRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '15 m'), prefix: 'rl:auth' })
  : null

export const apiRateLimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m'), prefix: 'rl:api' })
  : null

export async function checkRateLimit(limiter: Ratelimit | null, identifier: string) {
  if (!limiter) return { success: true, limit: 0, remaining: 0, reset: 0 }
  return limiter.limit(identifier)
}
