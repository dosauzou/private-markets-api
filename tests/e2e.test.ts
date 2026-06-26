import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../src/app'
import { prisma } from '../src/shared/prisma.client'

beforeEach(async () => {
  await prisma.investment.deleteMany()
  await prisma.investor.deleteMany()
  await prisma.fund.deleteMany()
  
  await new Promise(resolve => setTimeout(resolve, 20))
})

afterAll(async () => {
  await prisma.investment.deleteMany()
  await prisma.investor.deleteMany()
  await prisma.fund.deleteMany()
  
  await new Promise(resolve => setTimeout(resolve, 10))
  await prisma.$disconnect()
})

describe('End-to-end investment flow', () => {
  it('completes full flow: create fund → create investor → create investment → retrieve', async () => {
    // Step 1: Create a fund
    const fundRes = await request(app).post('/funds').send({
      name: `E2E Test Fund ${Date.now()}`,
      vintage_year: 2024,
      target_size_usd: 1000000000,
      status: 'Fundraising',
    })

    if (fundRes.status !== 201 || !fundRes.body.data?.id) throw new Error(`Fund creation failed`)
    const createdFundId = fundRes.body.data.id

    // Step 2: Create an investor
    const investorRes = await request(app).post('/investors').send({
      name: 'E2E Test Investor',
      email: `e2e-${Date.now()}-${Math.random()}@test.com`,
      investor_type: 'Institution',
    })

    if (investorRes.status !== 201 || !investorRes.body.data?.id) throw new Error(`Investor creation failed`)
    const createdInvestorId = investorRes.body.data.id

    // Step 3: Create an investment linking fund and investor
    const investmentRes = await request(app)
      .post(`/funds/${createdFundId}/investments`)
      .send({
        investor_id: createdInvestorId,
        amount_usd: 50000000,
        investment_date: '2024-06-15',
      })

    expect(investmentRes.status).toBe(201)
    expect(investmentRes.body.data.fund_id).toBe(createdFundId)
    expect(investmentRes.body.data.investor_id).toBe(createdInvestorId)
    expect(investmentRes.body.data.amount_usd).toBe('50000000')

    // Step 4: Retrieve the investment
    const getRes = await request(app).get(`/funds/${createdFundId}/investments`)

    expect(getRes.status).toBe(200)
    expect(getRes.body.data).toHaveLength(1)
    expect(getRes.body.data[0].fund_id).toBe(createdFundId)
    expect(getRes.body.data[0].investor_id).toBe(createdInvestorId)
    expect(getRes.body.data[0].amount_usd).toBe('50000000')
  })
})
