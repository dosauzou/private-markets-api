import { Prisma } from '@prisma/client'
import { prisma } from '../../shared/prisma.client'
import { AppError } from '../../shared/middleware/error'
import { CreateFundDto, FundListQueryDto, UpdateFundDataDto } from './fund.schema'

export class FundService {
  async findAll(query: FundListQueryDto) {
    const where: Prisma.FundWhereInput = {}
    const shouldPaginate = query.page !== undefined || query.limit !== undefined
    const page = query.page ?? 1
    const limit = query.limit ?? 20

    if (query.status) {
      where.status = query.status
    }

    if (query.vintage_year) {
      where.vintage_year = query.vintage_year
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' }
    }

    return prisma.fund.findMany({
      where,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      skip: shouldPaginate ? (page - 1) * limit : undefined,
      take: shouldPaginate ? limit : undefined,
    })
  }

  async findById(id: string) {
    const fund = await prisma.fund.findUnique({ where: { id } })
    if (!fund) throw new AppError(`Fund ${id} not found`, 404)
    return fund
  }

  async create(dto: CreateFundDto) {
    return prisma.fund.create({ data: dto })
  }

  async update(id: string, dto: UpdateFundDataDto) {
    await this.findById(id)
    return prisma.fund.update({ where: { id }, data: dto })
  }
}
