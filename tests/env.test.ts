import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

const ORIGINAL_ENV = process.env

describe('Environment validation', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('loads valid environment variables successfully', async () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/appdb'
    process.env.PORT = '4000'
    process.env.NODE_ENV = 'production'

    const { env } = await import('../src/config/env')

    expect(env.DATABASE_URL).toBe('postgresql://postgres:postgres@localhost:5432/appdb')
    expect(env.PORT).toBe(4000)
    expect(env.NODE_ENV).toBe('production')
  })

  it('fails startup when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL
    process.env.PORT = '3000'
    process.env.NODE_ENV = 'development'

    await expect(import('../src/config/env')).rejects.toThrow(/DATABASE_URL is required/)
  })

  it('fails startup when DATABASE_URL is not a postgres connection string', async () => {
    process.env.DATABASE_URL = 'mysql://user:pass@localhost:3306/db'
    process.env.PORT = '3000'
    process.env.NODE_ENV = 'development'

    await expect(import('../src/config/env')).rejects.toThrow(/DATABASE_URL must be a PostgreSQL connection string/)
  })
})
