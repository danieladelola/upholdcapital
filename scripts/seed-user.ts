import "dotenv/config";
import { prisma } from '../src/lib/db.js';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'user@vura.pro';
  const password = '12345678';
  const firstName = 'Test';
  const lastName = 'User';
  const username = 'user_vura';
  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        role: 'TRADER',
        username,
        fullName,
        initials,
        balance: 0,
        currency: 'USD',
        verified: false,
        status: 'active',
        followers: 0,
        winRate: 0,
        wins: 0,
        losses: 0,
        traderTrades: 0,
        minStartup: 1000,
        wallets: [],
        assets: [],
      },
    });
    console.log('Existing user updated to TRADER with all fields');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      firstName,
      lastName,
      fullName,
      initials,
      balance: 0,
      currency: 'USD',
      verified: false,
      role: 'TRADER',
      status: 'active',
      followers: 0,
      winRate: 0,
      wins: 0,
      losses: 0,
      traderTrades: 0,
      minStartup: 1000,
      wallets: [],
      assets: [],
    },
  });

  console.log('User created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });