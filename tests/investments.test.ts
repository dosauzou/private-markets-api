import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../src/app'
import { prisma } from '../src/shared/prisma.client'

let fundId: string
let investorId: string

beforeEach(async () => {
  await prisma.investment.deleteMany()
  await prisma.fund.deleteMany()
  await prisma.investor.deleteMany()

  // Create a fund for testing
  const fundRes = await request(app).post('/funds').send({
    name: 'Test Fund',
    vintage_year: 2024,
    target_size_usd: 500000000,
  })
  fundId = fundRes.body.data.id

  // Create an investor for testing
  const investorRes = await request(app).post('/investors').send({
    name: 'Test Investor',
    email: 'test@investor.com',
    investor_type: 'Institution',
  })
  investorId = investorRes.body.data.id
})

afterAll(async () => {
  await prisma.investment.deleteMany()
  await prisma.fund.deleteMany()
  await prisma.investor.deleteMany()
  await prisma.$disconnect()
})

describe('POST /funds/:fund_id/investments', () => {
  it('creates an investment and returns 201', async () => {
    const res = await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: investorId,
        amount_usd: 10000000,
        investment_date: '2024-06-15',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.amount_usd).toBe(10000000)
    expect(res.body.data.investor_id).toBe(investorId)
    expect(res.body.data.fund_id).toBe(fundId)
  })

  it('returns 404 if fund does not exist', async () => {
    const fakeFundId = '00000000-0000-0000-0000-000000000000'
    const res = await request(app)
      .post(`/funds/${fakeFundId}/investments`)
      .send({
        investor_id: investorId,
        amount_usd: 10000000,
        investment_date: '2024-06-15',
      })

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('returns 404 if investor does not exist', async () => {
    const fakeInvestorId = '00000000-0000-0000-0000-000000000000'
    const res = await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: fakeInvestorId,
        amount_usd: 10000000,
        investment_date: '2024-06-15',
      })

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('returns 409 if investor has already committed to the fund', async () => {
    await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: investorId,
        amount_usd: 10000000,
        investment_date: '2024-06-15',
      })

    const res = await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: investorId,
        amount_usd: 5000000,
        investment_date: '2024-06-20',
      })

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if investor_id is not a valid UUID', async () => {
    const res = await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: 'not-a-uuid',
        amount_usd: 10000000,
        investment_date: '2024-06-15',
      })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if amount_usd is not positive', async () => {
    const invalidAmounts = [-1000000, 0]
    for (const amount of invalidAmounts) {
      const res = await request(app)
        .post(`/funds/${fundId}/investments`)
        .send({
          investor_id: investorId,
          amount_usd: amount,
          investment_date: '2024-06-15',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    }
  })

  it('returns 400 if investment_date is not in YYYY-MM-DD format', async () => {
    const res = await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: investorId,
        amount_usd: 10000000,
        investment_date: '06/15/2024',
      })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if required fields are missing', async () => {
    const res = await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        amount_usd: 10000000,
      })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /funds/:fund_id/investments', () => {
  it('returns empty array when no investments exist', async () => {
    const res = await request(app).get(`/funds/${fundId}/investments`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual([])
  })

  it('returns all investments for a fund', async () => {
    await request(app)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: investorId,
        amount_usd: 10000000,
        investment_date: '2024-06-15',
      })

    const res = await request(app).get(`/funds/${fundId}/investments`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].amount_usd).toBe(10000000)
  })

  it('returns 404 if fund does not exist', async () => {
    const fakeFundId = '00000000-0000-0000-0000-000000000000'
    const res = await request(app).get(`/funds/${fakeFundId}/investments`)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
