import "dotenv/config"
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { assetNames } from '../src/app/dashboard/[...slug]/assetNames'

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

const cryptoSymbols = "BTC,ETH,SOL,BCH,LTC,DOGE,USDT,MATIC,AVAX,USDC,AAVE,ALGO,ANC,APE,AURORA,AXS,BTG,BORING,ADA,XCN,LINK,CRO,DAI,DASH,MANA,ETC,EVMOS,GT,LN,XMR,NEXO,OKB,OP,OGN,ORN,DOT,XPR,RARI,SFP,SHIB,XLM,GMT,SUSHI,TLOS,XTZ,GRT,TRX,UNI,VET,WING,ZEC,XRP,ICP,VELO,HEX,PNG,RNDR,QNT,HBAR,FET,XDC,BSV,TON,PEPE,XRPH,SOLO".split(',')
const stockSymbols = "AAPL,ABT,ADBE,ADI,AEMD,AIG,AMC,AMD,AMT,AMZN,APT,ASML,ATER,AXP,BA,BABA,BAC,BIDU,BMY,C,CAT,CCO,CEI,CHWY,CL,CLEU,CMCSA,COST,CRDF,CRM,CSCO,CVX,DIS,EBAY,FB,FSLY,GE,GEVO,GM,GOOGL,GS,HD,HON,IBM,INMD,INTC,JNJ,JPM,KO,LEN,LVS,MA,MDLZ,MMM,MNST,MSFT,MO,MRIN,MRK,MS,MSI,NFLX,NKE,NVDA,NVS,ORCL,PEP,PFE,PG,PYPL,RACE,RKLB,RL,RWLK,SBUX,SNAP,SSRM,SQ,T,TEVA,TM,TMUS,TRIP,TSLA,TSM,TWTR,UNH,V,VZ,WFC,WMT,XOM".split(',')

async function seedAssets() {
  console.log('Seeding assets...')

  // Seed crypto assets
  for (const symbol of cryptoSymbols) {
    const name = assetNames[symbol] || symbol
    const logoUrl = `/asseticons/${symbol}.svg`

    await prisma.asset.upsert({
      where: { symbol },
      update: {
        name,
        logo_url: logoUrl,
      },
      create: {
        symbol,
        name,
        price_usd: 0, // Will be updated by external API
        logo_url: logoUrl,
      },
    })
  }

  // Seed stock assets
  for (const symbol of stockSymbols) {
    const name = assetNames[symbol] || symbol
    const logoUrl = `/asseticons/${symbol}.svg`

    await prisma.asset.upsert({
      where: { symbol },
      update: {
        name,
        logo_url: logoUrl,
      },
      create: {
        symbol,
        name,
        price_usd: 0, // Will be updated by external API
        logo_url: logoUrl,
      },
    })
  }

  console.log('Assets seeded successfully')
}

seedAssets()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })