import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function getOrCreateFund(name: string, data: Omit<Prisma.FundCreateInput, 'name'>) {
  const existing = await prisma.fund.findFirst({ where: { name } })
  if (existing) return existing
  return prisma.fund.create({ data: { name, ...data } })
}

async function main() {
  const alphaGrowthFund = await getOrCreateFund('Alpha Growth Fund', {
    vintage_year: 2023,
    target_size_usd: new Prisma.Decimal('15000000.00'),
    status: 'Investing',
  })

  const horizonValuePartners = await getOrCreateFund('Horizon Value Partners', {
    vintage_year: 2025,
    target_size_usd: new Prisma.Decimal('25000000.00'),
    status: 'Fundraising',
  })

  const evergreenOpportunities = await getOrCreateFund('Evergreen Opportunities', {
    vintage_year: 2021,
    target_size_usd: new Prisma.Decimal('8000000.00'),
    status: 'Closed',
  })

  const lakesideCapital = await prisma.investor.upsert({
    where: { email: 'lakeside.capital@example.com' },
    update: {},
    create: {
      name: 'Lakeside Capital',
      email: 'lakeside.capital@example.com',
      investor_type: 'Institution',
    },
  })

  const miraVentures = await prisma.investor.upsert({
    where: { email: 'mira.ventures@example.com' },
    update: {},
    create: {
      name: 'Mira Ventures',
      email: 'mira.ventures@example.com',
      investor_type: 'FamilyOffice',
    },
  })

  const oliviaHart = await prisma.investor.upsert({
    where: { email: 'olivia.hart@example.com' },
    update: {},
    create: {
      name: 'Olivia Hart',
      email: 'olivia.hart@example.com',
      investor_type: 'Individual',
    },
  })

  await Promise.all([
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: alphaGrowthFund.id,
          investor_id: lakesideCapital.id,
        },
      },
      update: {},
      create: {
        fund_id: alphaGrowthFund.id,
        investor_id: lakesideCapital.id,
        amount_usd: new Prisma.Decimal('10000000.00'),
        investment_date: new Date('2024-01-22'),
      },
    }),
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: horizonValuePartners.id,
          investor_id: miraVentures.id,
        },
      },
      update: {},
      create: {
        fund_id: horizonValuePartners.id,
        investor_id: miraVentures.id,
        amount_usd: new Prisma.Decimal('5500000.00'),
        investment_date: new Date('2025-02-10'),
      },
    }),
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: evergreenOpportunities.id,
          investor_id: oliviaHart.id,
        },
      },
      update: {},
      create: {
        fund_id: evergreenOpportunities.id,
        investor_id: oliviaHart.id,
        amount_usd: new Prisma.Decimal('1250000.00'),
        investment_date: new Date('2022-11-01'),
      },
    }),
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: evergreenOpportunities.id,
          investor_id: lakesideCapital.id,
        },
      },
      update: {},
      create: {
        fund_id: evergreenOpportunities.id,
        investor_id: lakesideCapital.id,
        amount_usd: new Prisma.Decimal('2000000.00'),
        investment_date: new Date('2023-09-14'),
      },
    }),
  ])

  console.log('Seed data inserted or already exists.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
