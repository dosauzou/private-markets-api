import 'dotenv/config';
import app from './app';
import { prisma } from './shared/prisma.client';

async function main() {
  const { env } = await import('./config/env');
  const PORT = env.PORT;

  await prisma.$connect();
  console.log(`Database connected (${env.NODE_ENV})`);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
}

main().catch(async (err) => {
  console.error('Fatal startup error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
