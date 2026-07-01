import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../src/app'
import { prisma } from '../src/shared/prisma.client'

beforeEach(async () => {
  await prisma.fund.deleteMany()
})

afterAll(async () => {
  await prisma.fund.deleteMany()
  await prisma.$disconnect()
})

describe('POST /funds', () => {
  it('creates a fund and returns 201', async () => {
    const res = await request(app)
      .post('/funds')
      .send({
        name: 'Titanbay Growth Fund I',
        vintage_year: 2024,
        target_size_usd: 250000000,
        status: 'Fundraising',
      })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Titanbay Growth Fund I')
    expect(res.body.status).toBe('Fundraising')
  })

  it('defaults status to Fundraising if not provided', async () => {
    const res = await request(app)
      .post('/funds')
      .send({
        name: 'Titanbay Growth Fund II',
        vintage_year: 2025,
        target_size_usd: 500000000,
      })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('Fundraising')
  })

  it('returns 400 if name is missing', async () => {
    const res = await request(app)
      .post('/funds')
      .send({
        vintage_year: 2024,
        target_size_usd: 250000000,
      })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if target_size_usd is negative', async () => {
    const res = await request(app)
      .post('/funds')
      .send({
        name: 'Bad Fund',
        vintage_year: 2024,
        target_size_usd: -100,
      })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if vintage_year is not a number', async () => {
    const res = await request(app)
      .post('/funds')
      .send({
        name: 'Bad Fund',
        vintage_year: 'hello',
        target_size_usd: 250000000,
      })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /funds', () => {
  it('returns empty array when no funds exist', async () => {
    const res = await request(app).get('/funds')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns all funds', async () => {
    await request(app).post('/funds').send({
      name: 'Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000,
    })

    const res = await request(app).get('/funds')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('does not paginate by default when page and limit are omitted', async () => {
    for (let i = 1; i <= 25; i++) {
      await request(app).post('/funds').send({
        name: `Unpaginated Fund ${i}`,
        vintage_year: 2024,
        target_size_usd: 250000000,
      })
    }

    const res = await request(app).get('/funds')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(25)
  })

  it('applies page and limit query params', async () => {
    for (let i = 1; i <= 15; i++) {
      await request(app).post('/funds').send({
        name: `Fund Meta ${i}`,
        vintage_year: 2022,
        target_size_usd: 100000000,
      })
    }

    const page1 = await request(app).get('/funds?page=1&limit=10')
    const page2 = await request(app).get('/funds?page=2&limit=10')

    expect(page1.status).toBe(200)
    expect(page1.body).toHaveLength(10)
    const page1Names = page1.body.map((fund: { name: string }) => fund.name)

    expect(page2.status).toBe(200)
    expect(page2.body).toHaveLength(5)
    const page2Names = page2.body.map((fund: { name: string }) => fund.name)

    const combined = [...page1Names, ...page2Names]
    expect(new Set(combined).size).toBe(15)
    expect(page1Names.some((n: string) => page2Names.includes(n))).toBe(false)
    expect(combined.sort()).toEqual(Array.from({ length: 15 }, (_, i) => `Fund Meta ${i + 1}`).sort())
  })

  it('filters by status', async () => {
    await request(app).post('/funds').send({
      name: 'Fundraising Fund',
      vintage_year: 2022,
      target_size_usd: 100000000,
      status: 'Fundraising',
    })
    await request(app).post('/funds').send({
      name: 'Investing Fund',
      vintage_year: 2022,
      target_size_usd: 200000000,
      status: 'Investing',
    })

    const res = await request(app).get('/funds?status=Investing')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].status).toBe('Investing')
  })

  it('filters by vintage_year', async () => {
    await request(app).post('/funds').send({
      name: 'Fund 2020',
      vintage_year: 2020,
      target_size_usd: 100000000,
    })
    await request(app).post('/funds').send({
      name: 'Fund 2023',
      vintage_year: 2023,
      target_size_usd: 200000000,
    })

    const res = await request(app).get('/funds?vintage_year=2020')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].vintage_year).toBe(2020)
  })

  it('filters by search (partial name match)', async () => {
    await request(app).post('/funds').send({
      name: 'Alpha Growth Fund',
      vintage_year: 2021,
      target_size_usd: 100000000,
    })
    await request(app).post('/funds').send({
      name: 'Beta Income Fund',
      vintage_year: 2021,
      target_size_usd: 200000000,
    })

    const res = await request(app).get('/funds?search=alpha')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('Alpha Growth Fund')
  })

  it('allows short search terms as an optional extension', async () => {
    await request(app).post('/funds').send({
      name: 'AB Growth',
      vintage_year: 2021,
      target_size_usd: 100000000,
    })

    const res = await request(app).get('/funds?search=ab')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('paginates results with page and limit', async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app).post('/funds').send({
        name: `Paginated Fund ${i}`,
        vintage_year: 2020,
        target_size_usd: 100000000,
      })
    }

    const page1 = await request(app).get('/funds?page=1&limit=1')
    expect(page1.status).toBe(200)
    expect(page1.body).toHaveLength(1)

    const page2 = await request(app).get('/funds?page=2&limit=1')
    expect(page2.status).toBe(200)
    expect(page2.body).toHaveLength(1)
    expect(page2.body[0].id).not.toBe(page1.body[0].id)
  })

  it('returns 400 when page exceeds maximum boundary of 1000', async () => {
    const res = await request(app).get('/funds?page=1001')

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 when limit exceeds maximum of 100', async () => {
    const res = await request(app).get('/funds?limit=101')

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /funds/:id', () => {
  it('returns a fund by id', async () => {
    const created = await request(app).post('/funds').send({
      name: 'Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000,
    })

    const res = await request(app).get(`/funds/${created.body.id}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(created.body.id)
  })

  it('returns 404 if fund does not exist', async () => {
    const res = await request(app).get('/funds/00000000-0000-0000-0000-000000000000')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})

describe('PUT /funds', () => {
  it('updates a fund and returns 200', async () => {
    const created = await request(app).post('/funds').send({
      name: 'Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000,
    })

    const res = await request(app)
      .put('/funds')
      .send({ id: created.body.id, status: 'Investing' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('Investing')
  })

  it('returns 404 if fund does not exist', async () => {
    const res = await request(app)
      .put('/funds')
      .send({ id: '00000000-0000-0000-0000-000000000000', status: 'Investing' })

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if status is invalid', async () => {
    const created = await request(app).post('/funds').send({
      name: 'Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000,
    })

    const res = await request(app)
      .put('/funds')
      .send({ id: created.body.id, status: 'InvalidStatus' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 when no update fields are provided', async () => {
    const created = await request(app).post('/funds').send({
      name: 'Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000,
    })

    const res = await request(app)
      .put('/funds')
      .send({ id: created.body.id })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
