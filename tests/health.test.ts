import { describe, it, expect, jest, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../src/app'
import { prisma } from '../src/shared/prisma.client'

afterAll(async () => {
  await prisma.$disconnect()
})

describe('GET /api/health', () => {
  it('returns 200 with health payload when database is reachable', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe('ok')
    expect(typeof res.body.data.environment).toBe('string')
    expect(typeof res.body.data.uptime_seconds).toBe('number')
    expect(res.body.data.db).toEqual({ status: 'connected' })
    expect(typeof res.body.data.server_time).toBe('string')
  })

  it('returns 503 when database is unreachable', async () => {
    const { prisma } = await import('../src/shared/prisma.client')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = jest.spyOn(prisma, '$queryRaw' as any).mockRejectedValueOnce(new Error('Connection refused'))

    try {
      const res = await request(app).get('/api/health')

      expect(res.status).toBe(503)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Database unreachable')
    } finally {
      spy.mockRestore()
    }
  })
})
