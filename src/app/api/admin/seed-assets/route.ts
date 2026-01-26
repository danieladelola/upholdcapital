import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const cryptoSymbols = "BTC,ETH,SOL,BCH,LTC,DOGE,USDT,MATIC,AVAX,USDC,AAVE,ALGO,ANC,APE,AURORA,AXS,BTG,BORING,ADA,XCN,LINK,CRO,DAI,DASH,MANA,ETC,EVMOS,GT,LN,XMR,NEXO,OKB,OP,OGN,ORN,DOT,XPR,RARI,SFP,SHIB,XLM,GMT,SUSHI,TLOS,XTZ,GRT,TRX,UNI,VET,WING,ZEC,XRP,ICP,VELO,HEX,PNG,RNDR,QNT,HBAR,FET,XDC,BSV,TON,PEPE,XRPH,SOLO".split(',');
const stockSymbols = "AAPL,ABT,ADBE,ADI,AEMD,AIG,AMC,AMD,AMT,AMZN,APT,ASML,ATER,AXP,BA,BABA,BAC,BIDU,BMY,C,CAT,CCO,CEI,CHWY,CL,CLEU,CMCSA,COST,CRDF,CRM,CSCO,CVX,DIS,EBAY,FB,FSLY,GE,GEVO,GM,GOOGL,GS,HD,HON,IBM,INMD,INTC,JNJ,JPM,KO,LEN,LVS,MA,MDLZ,MMM,MNST,MSFT,MO,MRIN,MRK,MS,MSI,NFLX,NKE,NVDA,NVS,ORCL,PEP,PFE,PG,PYPL,RACE,RKLB,RL,RWLK,SBUX,SNAP,SSRM,SQ,T,TEVA,TM,TMUS,TRIP,TSLA,TSM,TWTR,UNH,V,VZ,WFC,WMT,XOM".split(',');

const assetNames: Record<string, string> = {
    // Crypto tickers
    BTC: "Bitcoin",
    ETH: "Ethereum",
    SOL: "Solana",
    BCH: "Bitcoin Cash",
    LTC: "Litecoin",
    DOGE: "Dogecoin",
    USDT: "Tether",
    MATIC: "Polygon",
    AVAX: "Avalanche",
    USDC: "USD Coin",
    AAVE: "Aave",
    ALGO: "Algorand",
    ANC: "Anchor Protocol",
    APE: "ApeCoin",
    AURORA: "Aurora",
    AXS: "Axie Infinity",
    BTG: "Bitcoin Gold",
    BORING: "BoringDAO",
    ADA: "Cardano",
    XCN: "Chain",
    LINK: "Chainlink",
    CRO: "Cronos",
    DAI: "Dai",
    DASH: "Dash",
    MANA: "Decentraland",
    ETC: "Ethereum Classic",
    EVMOS: "Evmos",
    GT: "GateToken",
    LN: "Link",
    XMR: "Monero",
    NEXO: "Nexo",
    OKB: "OKB",
    OP: "Optimism",
    OGN: "Origin Protocol",
    ORN: "Orion Protocol",
    DOT: "Polkadot",
    XPR: "Proton",
    RARI: "Rarible",
    SFP: "SafePal",
    SHIB: "Shiba Inu",
    XLM: "Stellar",
    GMT: "STEPN",
    SUSHI: "SushiSwap",
    TLOS: "Telos",
    XTZ: "Tezos",
    GRT: "The Graph",
    TRX: "Tron",
    UNI: "Uniswap",
    VET: "VeChain",
    WING: "Wing Finance",
    ZEC: "Zcash",
    XRP: "XRP",
    ICP: "Internet Computer",
    VELO: "Velodrome Finance",
    HEX: "HEX",
    PNG: "Pangolin",
    RNDR: "Render Token",
    QNT: "Quant",
    HBAR: "Hedera",
    FET: "Fetch.ai",
    XDC: "XDC Network",
    BSV: "Bitcoin SV",
    TON: "Toncoin",
    PEPE: "Pepe",
    XRPH: "XRP Healthcare",
    SOLO: "Sologenic",
    // Stock tickers
    AAPL: "Apple Inc.",
    ABT: "Abbott Laboratories",
    ADBE: "Adobe Inc.",
    ADI: "Analog Devices",
    AEMD: "Aethlon Medical",
    AIG: "American International Group",
    AMC: "AMC Entertainment",
    AMD: "Advanced Micro Devices",
    AMT: "American Tower",
    AMZN: "Amazon.com",
    APT: "Alpha Pro Tech",
    ASML: "ASML Holding",
    ATER: "Aterian",
    AXP: "American Express",
    BA: "Boeing",
    BABA: "Alibaba Group",
    BAC: "Bank of America",
    BIDU: "Baidu",
    BMY: "Bristol-Myers Squibb",
    C: "Citigroup",
    CAT: "Caterpillar",
    CCO: "Clear Channel Outdoor",
    CEI: "Camber Energy",
    CHWY: "Chewy",
    CL: "Colgate-Palmolive",
    CLEU: "China Liberal Education",
    CMCSA: "Comcast",
    COST: "Costco Wholesale",
    CRDF: "Cardiff Oncology",
    CRM: "Salesforce",
    CSCO: "Cisco Systems",
    CVX: "Chevron",
    DIS: "Walt Disney",
    EBAY: "eBay",
    FB: "Meta Platforms",
    FSLY: "Fastly",
    GE: "General Electric",
    GEVO: "Gevo Inc.",
    GM: "General Motors",
    GOOGL: "Alphabet Inc.",
    GS: "Goldman Sachs",
    HD: "Home Depot",
    HON: "Honeywell",
    IBM: "IBM",
    INMD: "InMode Ltd.",
    INTC: "Intel",
    JNJ: "Johnson & Johnson",
    JPM: "JPMorgan Chase",
    KO: "Coca-Cola",
    LEN: "Lennar Corporation",
    LVS: "Las Vegas Sands",
    MA: "Mastercard",
    MDLZ: "Mondelez International",
    MMM: "3M Company",
    MNST: "Monster Beverage",
    MSFT: "Microsoft",
    MO: "Altria Group",
    MRIN: "Marin Software",
    MRK: "Merck & Co.",
    MS: "Morgan Stanley",
    MSI: "Motorola Solutions",
    NFLX: "Netflix",
    NKE: "Nike",
    NVDA: "NVIDIA",
    NVS: "Novartis",
    ORCL: "Oracle",
    PEP: "PepsiCo",
    PFE: "Pfizer",
    PG: "Procter & Gamble",
    PYPL: "PayPal",
    RACE: "Ferrari",
    RKLB: "Rocket Lab USA",
    RL: "Ralph Lauren",
    RWLK: "ReWalk Robotics",
    SBUX: "Starbucks",
    SNAP: "Snap Inc.",
    SSRM: "SSR Mining",
    SQ: "Block Inc. (formerly Square)",
    T: "AT&T",
    TEVA: "Teva Pharmaceutical",
    TSM: "Taiwan Semiconductor",
    TMUS: "T-Mobile US",
    TRIP: "TripAdvisor",
    TSLA: "Tesla",
    TWTR: "Twitter (X)",
    UNH: "UnitedHealth Group",
    V: "Visa",
    VZ: "Verizon",
    WFC: "Wells Fargo",
    WMT: "Walmart",
    XOM: "Exxon Mobil",
};

export async function POST() {
  try {
    let createdCount = 0;
    let updatedCount = 0;

    // Seed crypto assets
    for (const symbol of cryptoSymbols) {
      const name = assetNames[symbol] || symbol;
      const logoUrl = `/asseticons/${symbol}.svg`;

      const result = await prisma.asset.upsert({
        where: { symbol },
        update: {
          name,
          logoUrl,
          stakingEnabled: true,
          stakeMin: 10,
          stakeMax: 100,
          stakeRoi: 4,
          stakeCycleDays: 6,
        },
        create: {
          symbol,
          name,
          priceUsd: 0,
          logoUrl,
          stakingEnabled: true,
          stakeMin: 10,
          stakeMax: 100,
          stakeRoi: 4,
          stakeCycleDays: 6,
        },
      });

      if (result && 'id' in result) {
        createdCount++;
      } else {
        updatedCount++;
      }
    }

    // Seed stock assets
    for (const symbol of stockSymbols) {
      const name = assetNames[symbol] || symbol;
      const logoUrl = `/asseticons/${symbol}.svg`;

      const result = await prisma.asset.upsert({
        where: { symbol },
        update: {
          name,
          logoUrl,
          stakingEnabled: false,
        },
        create: {
          symbol,
          name,
          priceUsd: 0,
          logoUrl,
          stakingEnabled: false,
        },
      });

      if (result && 'id' in result) {
        createdCount++;
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Assets seeded successfully',
      created: createdCount,
      updated: updatedCount,
    });
  } catch (error) {
    console.error('Error seeding assets:', error);
    return NextResponse.json(
      { error: 'Failed to seed assets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also provide a GET endpoint to check asset count
export async function GET() {
  try {
    const count = await prisma.asset.count();
    const assets = await prisma.asset.findMany({
      select: { symbol: true, name: true, priceUsd: true },
      orderBy: { symbol: 'asc' },
    });
    
    return NextResponse.json({
      totalAssets: count,
      assets: assets,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}
