import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const fund = await prisma.fund.upsert({
    where: { name: 'Seed Fund' },
    update: {},
    create: {
      name: 'Seed Fund',
      vintage_year: 2024,
      target_size_usd: new Prisma.Decimal('10000000.00'),
      status: 'Fundraising',
    },
  })

  const investor = await prisma.investor.upsert({
    where: { email: 'seed-investor@example.com' },
    update: {},
    create: {
      name: 'Seed Investor',
      email: 'seed-investor@example.com',
      investor_type: 'Institution',
    },
  })

  await prisma.investment.upsert({
    where: { fund_id_investor_id: { fund_id: fund.id, investor_id: investor.id } },
    update: {},
    create: {
      fund_id: fund.id,
      investor_id: investor.id,
      amount_usd: new Prisma.Decimal('5000000.00'),
      investment_date: new Date('2024-06-15'),
    },
  })

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
