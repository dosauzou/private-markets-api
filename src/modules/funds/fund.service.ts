import { prisma } from '../../shared/prisma.client'
import { AppError } from '../../shared/middleware/error'
import { CreateFundDto, UpdateFundDto } from './fund.schema'

export class FundService {
  async findAll() {
    return prisma.fund.findMany({ orderBy: { created_at: 'desc' } })
  }

  async findById(id: string) {
    const fund = await prisma.fund.findUnique({ where: { id } })
    if (!fund) throw new AppError(`Fund ${id} not found`, 404)
    return fund
  }

  async create(dto: CreateFundDto) {
    return prisma.fund.create({ data: dto })
  }

  async update(id: string, dto: UpdateFundDto) {
    await this.findById(id)
    return prisma.fund.update({ where: { id }, data: dto })
  }
}
