import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const funds = await Promise.all([
    prisma.fund.upsert({
      where: { name: 'Alpha Growth Fund' },
      update: {},
      create: {
        name: 'Alpha Growth Fund',
        vintage_year: 2023,
        target_size_usd: new Prisma.Decimal('15000000.00'),
        status: 'Investing',
      },
    }),
    prisma.fund.upsert({
      where: { name: 'Horizon Value Partners' },
      update: {},
      create: {
        name: 'Horizon Value Partners',
        vintage_year: 2025,
        target_size_usd: new Prisma.Decimal('25000000.00'),
        status: 'Fundraising',
      },
    }),
    prisma.fund.upsert({
      where: { name: 'Evergreen Opportunities' },
      update: {},
      create: {
        name: 'Evergreen Opportunities',
        vintage_year: 2021,
        target_size_usd: new Prisma.Decimal('8000000.00'),
        status: 'Closed',
      },
    }),
  ])

  const investors = await Promise.all([
    prisma.investor.upsert({
      where: { email: 'lakeside.capital@example.com' },
      update: {},
      create: {
        name: 'Lakeside Capital',
        email: 'lakeside.capital@example.com',
        investor_type: 'Institution',
      },
    }),
    prisma.investor.upsert({
      where: { email: 'mira.ventures@example.com' },
      update: {},
      create: {
        name: 'Mira Ventures',
        email: 'mira.ventures@example.com',
        investor_type: 'FamilyOffice',
      },
    }),
    prisma.investor.upsert({
      where: { email: 'olivia.hart@example.com' },
      update: {},
      create: {
        name: 'Olivia Hart',
        email: 'olivia.hart@example.com',
        investor_type: 'Individual',
      },
    }),
  ])

  await Promise.all([
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: funds[0].id,
          investor_id: investors[0].id,
        },
      },
      update: {},
      create: {
        fund_id: funds[0].id,
        investor_id: investors[0].id,
        amount_usd: new Prisma.Decimal('10000000.00'),
        investment_date: new Date('2024-01-22'),
      },
    }),
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: funds[1].id,
          investor_id: investors[1].id,
        },
      },
      update: {},
      create: {
        fund_id: funds[1].id,
        investor_id: investors[1].id,
        amount_usd: new Prisma.Decimal('5500000.00'),
        investment_date: new Date('2025-02-10'),
      },
    }),
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: funds[2].id,
          investor_id: investors[2].id,
        },
      },
      update: {},
      create: {
        fund_id: funds[2].id,
        investor_id: investors[2].id,
        amount_usd: new Prisma.Decimal('1250000.00'),
        investment_date: new Date('2022-11-01'),
      },
    }),
    prisma.investment.upsert({
      where: {
        fund_id_investor_id: {
          fund_id: funds[2].id,
          investor_id: investors[0].id,
        },
      },
      update: {},
      create: {
        fund_id: funds[2].id,
        investor_id: investors[0].id,
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
