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
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Titanbay Growth Fund I')
    expect(res.body.data.status).toBe('Fundraising')
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
    expect(res.body.data.status).toBe('Fundraising')
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
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual([])
    expect(res.body.meta.total).toBe(0)
    expect(res.body.meta.page).toBe(1)
    expect(res.body.meta.limit).toBe(20)
    expect(res.body.meta.total_pages).toBe(0)
    expect(res.body.meta.has_next).toBe(false)
    expect(res.body.meta.has_previous).toBe(false)
  })

  it('returns all funds', async () => {
    await request(app).post('/funds').send({
      name: 'Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000,
    })

    const res = await request(app).get('/funds')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta.total).toBe(1)
    expect(res.body.meta.total_pages).toBe(1)
    expect(res.body.meta.has_next).toBe(false)
    expect(res.body.meta.has_previous).toBe(false)
  })

  it('returns meta with total, page, and limit', async () => {
    await request(app).post('/funds').send({
      name: 'Fund Meta',
      vintage_year: 2022,
      target_size_usd: 100000000,
    })

    const res = await request(app).get('/funds?page=1&limit=10')

    expect(res.status).toBe(200)
    expect(res.body.meta).toBeDefined()
    expect(res.body.meta.total).toBe(1)
    expect(res.body.meta.page).toBe(1)
    expect(res.body.meta.limit).toBe(10)
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
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].status).toBe('Investing')
    expect(res.body.meta.total).toBe(1)
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
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].vintage_year).toBe(2020)
    expect(res.body.meta.total).toBe(1)
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
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].name).toBe('Alpha Growth Fund')
  })

  it('rejects search terms shorter than 3 characters', async () => {
    const res = await request(app).get('/funds?search=ab')
    expect(res.status).toBe(400)
  })

  it('paginates results with page and limit', async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app).post('/funds').send({
        name: `Paginated Fund ${i}`,
        vintage_year: 2020,
        target_size_usd: 100000000,
      })
    }

    const page1 = await request(app).get('/funds?page=1&limit=2')
    expect(page1.status).toBe(200)
    expect(page1.body.data).toHaveLength(2)
    expect(page1.body.meta.total).toBe(5)
    expect(page1.body.meta.page).toBe(1)
    expect(page1.body.meta.limit).toBe(2)

    const page2 = await request(app).get('/funds?page=2&limit=2')
    expect(page2.status).toBe(200)
    expect(page2.body.data).toHaveLength(2)
    expect(page2.body.meta.page).toBe(2)
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

    const res = await request(app).get(`/funds/${created.body.data.id}`)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(created.body.data.id)
  })

  it('returns 404 if fund does not exist', async () => {
    const res = await request(app).get('/funds/00000000-0000-0000-0000-000000000000')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})

describe('PUT /funds/:id', () => {
  it('updates a fund and returns 200', async () => {
    const created = await request(app).post('/funds').send({
      name: 'Fund I',
      vintage_year: 2024,
      target_size_usd: 250000000,
    })

    const res = await request(app)
      .put(`/funds/${created.body.data.id}`)
      .send({ status: 'Investing' })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('Investing')
  })

  it('returns 404 if fund does not exist', async () => {
    const res = await request(app)
      .put('/funds/00000000-0000-0000-0000-000000000000')
      .send({ status: 'Investing' })

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
      .put(`/funds/${created.body.data.id}`)
      .send({ status: 'InvalidStatus' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
