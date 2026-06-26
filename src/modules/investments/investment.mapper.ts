import type { Investment as PrismaInvestment } from '@prisma/client'
import type { Investment } from './investment.types'

export const mapInvestment = (investment: PrismaInvestment): Investment => ({
  ...investment,
  amount_usd: Number(investment.amount_usd),
})

export const mapInvestments = (investments: PrismaInvestment[]): Investment[] =>
  investments.map(mapInvestment)
