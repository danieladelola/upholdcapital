import "dotenv/config";
import { prisma } from '../src/lib/db';

const traders = [
  { name: '10x Stock Signals', username: '10x_stock_signals', followers: 9000, winRate: 92, profitShare: 15, wins: 2143, losses: 367, trades: 779, minStartup: 0, isAdminPosted: true },
  { name: 'AJ Ale', username: 'aj_ale_', followers: 2600, winRate: 92, profitShare: 15, wins: 3472, losses: 19, trades: 0, minStartup: 100, isAdminPosted: true },
  { name: 'Alertia Mars', username: 'alertia_mars', followers: 93100, winRate: 100, profitShare: 22, wins: 28, losses: 0, trades: 0, minStartup: 3200, isAdminPosted: false },
  { name: 'Amadeus Crypto', username: 'amadeus_crypto', followers: 33700, winRate: 85.6, profitShare: 15, wins: 229, losses: 29, trades: 0, minStartup: 2000, isAdminPosted: true },
  { name: 'Aness Hussein Ali', username: 'aness_hussein', followers: 6200, winRate: 90.54, profitShare: 15, wins: 6092, losses: 841, trades: 4550, minStartup: 0, isAdminPosted: true },
  { name: 'Aristotle', username: 'aristotle_investments', followers: 1800, winRate: 89, profitShare: 15, wins: 8517, losses: 381, trades: 2698, minStartup: 0, isAdminPosted: true },
  { name: 'Arturo Pestana', username: 'arturo_pestana', followers: 2300, winRate: 92, profitShare: 15, wins: 3421, losses: 15, trades: 0, minStartup: 200, isAdminPosted: true },
  { name: 'Asher', username: 'asher', followers: 794, winRate: 90.46, profitShare: 15, wins: 5689, losses: 342, trades: 6125, minStartup: 0, isAdminPosted: true },
  { name: 'Ayris', username: 'Ayris', followers: 1400, winRate: 92, profitShare: 15, wins: 1907, losses: 270, trades: 2270, minStartup: 0, isAdminPosted: true },
  { name: 'Benedict Evans', username: 'benedict_evans', followers: 1200, winRate: 95.5, profitShare: 15, wins: 4194, losses: 132, trades: 4163, minStartup: 0, isAdminPosted: true },
  { name: 'Benjamin Cowen', username: 'intothecryptoverse', followers: 1400, winRate: 87.54, profitShare: 15, wins: 868, losses: 120, trades: 693, minStartup: 0, isAdminPosted: true },
  { name: 'Bruce', username: 'bruce_', followers: 2500, winRate: 95, profitShare: 15, wins: 5818, losses: 19, trades: 0, minStartup: 300, isAdminPosted: true },
  { name: 'Casper SMC', username: 'casper_smc', followers: 7700, winRate: 95, profitShare: 15, wins: 3254, losses: 19, trades: 125, minStartup: 0, isAdminPosted: true },
  { name: 'Chris', username: 'It’s_cblast', followers: 2800, winRate: 95.7, profitShare: 15, wins: 9389, losses: 50, trades: 1767, minStartup: 0, isAdminPosted: true },
  { name: 'Clipsunversaw', username: 'Clipsunversaw', followers: 9100, winRate: 85, profitShare: 10.47, wins: 2740, losses: 304, trades: 4450, minStartup: 0, isAdminPosted: true },
  { name: 'Crypto Elite', username: 'crypto_elite_', followers: 4200, winRate: 92, profitShare: 15, wins: 2378, losses: 15, trades: 0, minStartup: 300, isAdminPosted: true },
  { name: 'Crypto King', username: 'crypto_king', followers: 2200, winRate: 95, profitShare: 15, wins: 2993, losses: 12, trades: 6698, minStartup: 0, isAdminPosted: true },
  { name: 'Crypto Shark', username: 'Crypto_shark', followers: 100000, winRate: 100, profitShare: 15, wins: 101, losses: 0, trades: 8889, minStartup: 1000, isAdminPosted: false },
  { name: 'Crypto Wendy', username: 'crypto_wendy', followers: 1200, winRate: 89.5, profitShare: 15, wins: 5607, losses: 892, trades: 6448, minStartup: 0, isAdminPosted: true },
  { name: 'Damaris Cardenas', username: 'Damaris_cardenas', followers: 4600, winRate: 95.14, profitShare: 15, wins: 3774, losses: 486, trades: 4144, minStartup: 0, isAdminPosted: true },
  { name: 'David Foley', username: 'Jianchi1847886', followers: 1000, winRate: 83.63, profitShare: 15, wins: 8240, losses: 810, trades: 8810, minStartup: 0, isAdminPosted: true },
  { name: 'Dominik Kovarík', username: 'dominik_kovarík', followers: 1500, winRate: 95, profitShare: 15, wins: 2890, losses: 15, trades: 0, minStartup: 300, isAdminPosted: true },
  { name: 'Frank Ethan', username: 'frank_ethan_', followers: 8800, winRate: 93, profitShare: 15, wins: 1573, losses: 15, trades: 0, minStartup: 100, isAdminPosted: true },
  { name: 'FRANK TAYLOR', username: 'franktaylor428', followers: 1300, winRate: 89, profitShare: 15, wins: 2653, losses: 470, trades: 3986, minStartup: 0, isAdminPosted: true },
  { name: 'Graham', username: 'jianchi', followers: 3200, winRate: 89.73, profitShare: 15, wins: 3321, losses: 193, trades: 4257, minStartup: 0, isAdminPosted: true },
  { name: 'H H Chuong', username: 'h_h_chuong_', followers: 850, winRate: 95, profitShare: 15, wins: 2953, losses: 23, trades: 0, minStartup: 100, isAdminPosted: true },
  { name: 'Jackie Talks Investment', username: 'jackie_talks_investment', followers: 3500, winRate: 95, profitShare: 15, wins: 2753, losses: 15, trades: 0, minStartup: 300, isAdminPosted: false },
];

async function main() {
  // Get admin user or create a dummy trader
  let trader = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!trader) {
    trader = await prisma.user.create({
      data: {
        email: 'admin@dummy.com',
        username: 'admin',
        passwordHash: 'dummy',
        role: 'ADMIN',
        displayName: 'Admin Trader',
      },
    });
  }

  // Get BTC asset
  const asset = await prisma.asset.findFirst({
    where: { symbol: 'BTC' },
  });

  if (!asset) {
    console.log('BTC asset not found, skipping');
    return;
  }

  // Clear existing posted trades
  await prisma.postedTrade.deleteMany();

  for (const t of traders) {
    await prisma.postedTrade.create({
      data: {
        traderId: trader.id,
        assetId: asset.id,
        tradeType: 'buy', // dummy
        amount: 1000, // dummy
        entryPrice: 50000, // dummy
        profitShare: t.profitShare,
        duration: 24,
        name: t.name,
        username: t.username,
        followers: t.followers,
        winRate: t.winRate,
        wins: t.wins,
        losses: t.losses,
        trades: t.trades,
        minStartup: t.minStartup,
        isAdminPosted: t.isAdminPosted,
      },
    });
  }

  console.log('Posted trades seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });