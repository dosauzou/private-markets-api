import 'dotenv/config';
import app from './app';
import { prisma } from './shared/prisma.client';

const PORT = process.env.PORT ?? 3000;

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch(async (err) => {
  console.error('Fatal startup error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
