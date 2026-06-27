import { Prisma } from '@prisma/client'
import { prisma } from '../../shared/prisma.client'
import { AppError } from '../../shared/middleware/error'
import { CreateFundDto, FundListQueryDto, UpdateFundDto } from './fund.schema'

export class FundService {
  async findAll(query: FundListQueryDto) {
    const where: Prisma.FundWhereInput = {}

    if (query.status) {
      where.status = query.status
    }

    if (query.vintage_year) {
      where.vintage_year = query.vintage_year
    }

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' }
    }

    const [items, total] = await prisma.$transaction([
      prisma.fund.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.fund.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        total_pages: totalPages,
        has_next: query.page < totalPages,
        has_previous: query.page > 1,
      },
    }
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
