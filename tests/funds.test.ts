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
