import "dotenv/config";
import { prisma } from '../src/lib/db.js';
import bcrypt from 'bcryptjs';

const names = [
  { first: 'Ahmed', last: 'Hassan' },
  { first: 'Maria', last: 'Garcia' },
  { first: 'Jean', last: 'Dubois' },
  { first: 'Li', last: 'Wei' },
  { first: 'Carlos', last: 'Rodriguez' },
  { first: 'Anna', last: 'Ivanova' },
  { first: 'Mohammed', last: 'Ali' },
  { first: 'Sofia', last: 'Martinez' },
  { first: 'Pierre', last: 'Lefebvre' },
  { first: 'Yuki', last: 'Tanaka' },
  { first: 'Diego', last: 'Lopez' },
  { first: 'Elena', last: 'Petrova' },
  { first: 'Hassan', last: 'Khan' },
  { first: 'Isabella', last: 'Fernandez' },
  { first: 'Louis', last: 'Moreau' },
  { first: 'Mei', last: 'Chen' },
  { first: 'Antonio', last: 'Silva' },
  { first: 'Olga', last: 'Smirnova' },
  { first: 'Ali', last: 'Ahmed' },
  { first: 'Carmen', last: 'Gonzalez' },
  { first: 'Jacques', last: 'Rousseau' },
  { first: 'Hiroshi', last: 'Sato' },
  { first: 'Miguel', last: 'Hernandez' },
  { first: 'Tatiana', last: 'Volkova' },
  { first: 'Omar', last: 'Al-Farsi' },
  { first: 'Lucia', last: 'Romero' },
  { first: 'Henri', last: 'Girard' },
  { first: 'Ling', last: 'Wang' },
  { first: 'Ricardo', last: 'Perez' },
  { first: 'Natalia', last: 'Kuznetsova' },
  { first: 'Fatima', last: 'Zahra' },
  { first: 'Pablo', last: 'Torres' },
  { first: 'Emile', last: 'Bonnet' },
  { first: 'Jun', last: 'Kim' },
  { first: 'Fernando', last: 'Morales' },
  { first: 'Irina', last: 'Popova' },
  { first: 'Youssef', last: 'Mahmoud' },
  { first: 'Rosa', last: 'Diaz' },
  { first: 'Antoine', last: 'Fournier' },
  { first: 'Min', last: 'Park' },
  { first: 'Jose', last: 'Gomez' },
  { first: 'Svetlana', last: 'Ivanova' },
  { first: 'Mustafa', last: 'Yilmaz' },
  { first: 'Ana', last: 'Santos' },
  { first: 'Georges', last: 'Martin' },
  { first: 'Ji', last: 'Zhang' },
  { first: 'Manuel', last: 'Ruiz' },
  { first: 'Marina', last: 'Sokolova' },
  { first: 'Ahmed', last: 'El-Sayed' },
  { first: 'Laura', last: 'Alvarez' },
  { first: 'François', last: 'Dubois' },
  { first: 'Na', last: 'Lee' },
];

async function main() {
  const password = '12345678';
  const passwordHash = await bcrypt.hash(password, 12);

  for (let i = 0; i < 50; i++) {
    const { first, last } = names[i % names.length]; // cycle if more than names
    const fullName = `${first} ${last}`;
    const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100 to 999
    const username = `${first.toLowerCase()}${last.toLowerCase()}${randomNum}`;
    const email = `${username}@vura.pro`;

    // Generate trader stats
    const followers = Math.floor(Math.random() * 40000) + 10000; // 10k to 50k
    const wins = Math.floor(Math.random() * 500) + 50; // 50 to 550
    const losses = Math.floor(Math.random() * 200) + 10; // 10 to 210
    const traderTrades = wins + losses;
    const winRate = (wins / traderTrades) * 100;
    const minStartup = Math.floor(Math.random() * 9000) + 1000; // 1k to 10k
    const profitShare = Math.random() * 20 + 5; // 5% to 25%

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
          followers,
          winRate,
          wins,
          losses,
          traderTrades,
          minStartup,
          profitShare,
          wallets: [],
          assets: [],
        },
      });
      console.log(`Existing user updated: ${email}`);
    } else {
      await prisma.user.create({
        data: {
          email,
          username,
          passwordHash,
          firstName: first,
          lastName: last,
          fullName,
          initials,
          balance: 0,
          currency: 'USD',
          verified: false,
          role: 'TRADER',
          status: 'active',
          followers,
          winRate,
          wins,
          losses,
          traderTrades,
          minStartup,
          profitShare,
          wallets: [],
          assets: [],
        },
      });
      console.log(`User created: ${email}`);
    }
  }

  // Also update the original user to USER role
  const originalEmail = 'user@vura.pro';
  const existingOriginal = await prisma.user.findUnique({
    where: { email: originalEmail },
  });

  if (existingOriginal) {
    await prisma.user.update({
      where: { email: originalEmail },
      data: {
        role: 'USER',
        username: 'user_vura',
        fullName: 'Test User',
        initials: 'TU',
        balance: 0,
        currency: 'USD',
        verified: false,
        status: 'active',
        followers: null,
        winRate: null,
        wins: null,
        losses: null,
        traderTrades: null,
        minStartup: null,
        profitShare: null,
        wallets: [],
        assets: [],
      },
    });
    console.log(`Original user updated to USER role: ${originalEmail}`);
  } else {
    await prisma.user.create({
      data: {
        email: originalEmail,
        username: 'user_vura',
        passwordHash,
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        initials: 'TU',
        balance: 0,
        currency: 'USD',
        verified: false,
        role: 'USER',
        status: 'active',
        wallets: [],
        assets: [],
      },
    });
    console.log(`User created: ${originalEmail}`);
  }

  // Create admin user in Admin table
  const adminEmail = 'admin@vura.pro';
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    await prisma.admin.update({
      where: { email: adminEmail },
      data: {
        passwordHash,
      },
    });
    console.log(`Admin updated: ${adminEmail}`);
  } else {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`Admin created: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });