import { prisma } from '../../shared/prisma.client'
import { AppError } from '../../shared/middleware/error'
import { CreateInvestorDto } from './investor.schema'

export class InvestorService {
  async findAll() {
    return prisma.investor.findMany({ orderBy: { created_at: 'desc' } })
  }

  async create(dto: CreateInvestorDto) {
    const existing = await prisma.investor.findUnique({ where: { email: dto.email } })
    if (existing) throw new AppError('An investor with this email already exists', 409)
    return prisma.investor.create({ data: dto })
  }
}
