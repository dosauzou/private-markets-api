import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../src/app'
import { prisma } from '../src/shared/prisma.client'

beforeEach(async () => {
  await prisma.investment.deleteMany()
  await prisma.investor.deleteMany()
})

afterAll(async () => {
  await prisma.investment.deleteMany()
  await prisma.investor.deleteMany()
  await prisma.$disconnect()
})

describe('POST /investors', () => {
  it('creates an investor and returns 201', async () => {
    const res = await request(app)
      .post('/investors')
      .send({
        name: 'Goldman Sachs Asset Management',
        email: 'investments@gsam.com',
        investor_type: 'Institution',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Goldman Sachs Asset Management')
    expect(res.body.data.email).toBe('investments@gsam.com')
    expect(res.body.data.investor_type).toBe('Institution')
  })

  it('returns 409 if email already exists', async () => {
    await request(app).post('/investors').send({
      name: 'Goldman Sachs Asset Management',
      email: 'investments@gsam.com',
      investor_type: 'Institution',
    })

    const res = await request(app).post('/investors').send({
      name: 'Goldman Sachs Duplicate',
      email: 'investments@gsam.com',
      investor_type: 'Institution',
    })

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if email is invalid', async () => {
    const res = await request(app).post('/investors').send({
      name: 'Bad Investor',
      email: 'not-an-email',
      investor_type: 'Institution',
    })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if name is missing', async () => {
    const res = await request(app).post('/investors').send({
      email: 'test@test.com',
      investor_type: 'Institution',
    })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 400 if investor_type is invalid', async () => {
    const res = await request(app).post('/investors').send({
      name: 'Bad Investor',
      email: 'test@test.com',
      investor_type: 'InvalidType',
    })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /investors', () => {
  it('returns empty array when no investors exist', async () => {
    const res = await request(app).get('/investors')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual([])
  })

  it('returns all investors', async () => {
    await request(app).post('/investors').send({
      name: 'Goldman Sachs Asset Management',
      email: 'investments@gsam.com',
      investor_type: 'Institution',
    })

    const res = await request(app).get('/investors')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })
})
