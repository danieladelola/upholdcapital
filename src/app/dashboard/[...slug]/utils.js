import { assetNames } from "./assetNames";

const cryptoUrl = "https://redstone.p.rapidapi.com/prices?provider=redstone&symbols=BTC,ETH,SOL,BCH,LTC,DOGE,USDT,MATIC,AVAX,USDC,AAVE,ALGO,ANC,APE,AURORA,AXS,BTG,BORING,ADA,XCN,LINK,CRO,DAI,DASH,MANA,ETC,EVMOS,GT,LN,XMR,NEXO,OKB,OP,OGN,ORN,DOT,XPR,RARI,SFP,SHIB,XLM,GMT,SUSHI,TLOS,XTZ,GRT,TRX,UNI,VET,WING,ZEC,XRP,ICP,VELO,HEX,PNG,RNDR,QNT,HBAR,FET,XDC,BSV,TON,PEPE,XRPH,SOLO";
const stockUrl = "https://data.alpaca.markets/v2/stocks/snapshots?symbols=AAPL,ABT,ADBE,ADI,AEMD,AIG,AMC,AMD,AMT,AMZN,APT,ASML,ATER,AXP,BA,BABA,BAC,BIDU,BMY,C,CAT,CCO,CEI,CHWY,CL,CLEU,CMCSA,COST,CRDF,CRM,CSCO,CVX,DIS,EBAY,FB,FSLY,GE,GEVO,GM,GOOGL,GS,HD,HON,IBM,INMD,INTC,JNJ,JPM,KO,LEN,LVS,MA,MDLZ,MMM,MNST,MSFT,MO,MRIN,MRK,MS,MSI,NFLX,NKE,NVDA,NVS,ORCL,PEP,PFE,PG,PYPL,RACE,RKLB,RL,RWLK,SBUX,SNAP,SSRM,SQ,T,TEVA,TM,TMUS,TRIP,TSLA,TSM,TWTR,UNH,V,VZ,WFC,WMT,XOM";

const headers = {
  "x-rapidapi-host": "redstone.p.rapidapi.com",
  "x-rapidapi-key": "396a8cb761mshc0459779f675ee6p18d42djsn4cd87cfd13f7",
};

const stockHeaders = {
  "APCA-API-KEY-ID": "PKQ6M7Z27HOJ5JZ6XEGN",
  "APCA-API-SECRET-KEY": "J7HXcztjRdTUHB0aGkihTdnTTdLGmiVDstpJNAd5",
};

// Dictionary for actual asset names

  
async function fetchAssets() {
  try {
    // Fetch crypto assets
    const cryptoResponse = await fetch(cryptoUrl, { headers });
    if (!cryptoResponse) {
      throw new Error('Failed to fetch crypto data');
    }
    const cryptoData = await cryptoResponse.json();
    const cassets = Object.entries(cryptoData).map(([symbol, assetData]) => ({
      name: assetNames[symbol] || symbol,
      price: assetData.value,
      symbol: symbol,
      icon: `/asseticons/${symbol}.svg`,
      type: "crypto",
      amount:0
    }));

    // Fetch stock assets
    const stockResponse = await fetch(stockUrl, { headers: stockHeaders });
    const stockData = await stockResponse.json();
    const sassets = Object.entries(stockData).map(([symbol, asset]) => ({
      name: assetNames[symbol] || symbol,
      price: asset.dailyBar.c,
      symbol: symbol,
      icon: `/asseticons/${symbol}.svg`,
      type: "stock",
      amount:0
    }));

    // Merge assets into a single array
    const assets = [...cassets, ...sassets];
    return assets
  } catch (error) {
    console.error("Error fetching or updating assets:", error);
  }
}
export { fetchAssets };