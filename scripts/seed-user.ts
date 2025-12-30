import "dotenv/config";
import { prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'user@vura.pro';
  const password = '12345678';
  const firstName = 'Test';
  const lastName = 'User';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        role: 'TRADER',
      },
    });
    console.log('Existing user updated to TRADER');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'TRADER',
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