import "dotenv/config"
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function updateAssetPrices() {
  console.log('Updating asset prices...')

  // Mock prices for some popular assets
  const priceUpdates = [
    { symbol: 'BTC', price: 95000 },
    { symbol: 'ETH', price: 3200 },
    { symbol: 'SOL', price: 180 },
    { symbol: 'ADA', price: 0.45 },
    { symbol: 'DOT', price: 6.50 },
    { symbol: 'LINK', price: 18.50 },
    { symbol: 'UNI', price: 8.20 },
    { symbol: 'AAVE', price: 95 },
    { symbol: 'TSLA', price: 220 },
    { symbol: 'AAPL', price: 180 },
    { symbol: 'GOOGL', price: 140 },
    { symbol: 'MSFT', price: 420 },
    { symbol: 'NVDA', price: 850 },
    { symbol: 'AMZN', price: 155 },
  ]

  for (const update of priceUpdates) {
    await prisma.asset.updateMany({
      where: { symbol: update.symbol },
      data: { priceUsd: update.price }
    })
    console.log(`Updated ${update.symbol} to $${update.price}`)
  }

  console.log('Asset prices updated successfully')
}

updateAssetPrices()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })