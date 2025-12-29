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
    await prisma.user.delete({
      where: { email },
    });
    console.log('Existing user deleted');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'USER',
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