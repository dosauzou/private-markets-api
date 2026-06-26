import { prisma } from '../../shared/prisma.client'
import { AppError } from '../../shared/middleware/error'
import { CreateInvestmentDto } from './investment.schema'

export class InvestmentService {
  async findAllByFund(fund_id: string) {
    const fund = await prisma.fund.findUnique({ where: { id: fund_id } })
    if (!fund) throw new AppError(`Fund ${fund_id} not found`, 404)

    const investments = await prisma.investment.findMany({
      where: { fund_id },
      orderBy: { created_at: 'desc' },
    })

    return investments.map(i => ({ ...i, amount_usd: Number(i.amount_usd) }))
  }

  async create(fund_id: string, dto: CreateInvestmentDto) {
    const fund = await prisma.fund.findUnique({ where: { id: fund_id } })
    if (!fund) throw new AppError(`Fund ${fund_id} not found`, 404)

    const investor = await prisma.investor.findUnique({ where: { id: dto.investor_id } })
    if (!investor) throw new AppError(`Investor ${dto.investor_id} not found`, 404)

    const existing = await prisma.investment.findUnique({
      where: { fund_id_investor_id: { fund_id, investor_id: dto.investor_id } },
    })
    if (existing) throw new AppError('This investor has already committed to this fund', 409)

    const investment = await prisma.investment.create({
      data: {
        fund_id,
        investor_id: dto.investor_id,
        amount_usd: dto.amount_usd,
        investment_date: new Date(dto.investment_date),
      },
    })

    return { ...investment, amount_usd: Number(investment.amount_usd) }
  }
}
