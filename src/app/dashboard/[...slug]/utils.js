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
const cryptoSymbols = new Set("BTC,ETH,SOL,BCH,LTC,DOGE,USDT,MATIC,AVAX,USDC,AAVE,ALGO,ANC,APE,AURORA,AXS,BTG,BORING,ADA,XCN,LINK,CRO,DAI,DASH,MANA,ETC,EVMOS,GT,LN,XMR,NEXO,OKB,OP,OGN,ORN,DOT,XPR,RARI,SFP,SHIB,XLM,GMT,SUSHI,TLOS,XTZ,GRT,TRX,UNI,VET,WING,ZEC,XRP,ICP,VELO,HEX,PNG,RNDR,QNT,HBAR,FET,XDC,BSV,TON,PEPE,XRPH,SOLO".split(','));
const stockSymbols = new Set("AAPL,ABT,ADBE,ADI,AEMD,AIG,AMC,AMD,AMT,AMZN,APT,ASML,ATER,AXP,BA,BABA,BAC,BIDU,BMY,C,CAT,CCO,CEI,CHWY,CL,CLEU,CMCSA,COST,CRDF,CRM,CSCO,CVX,DIS,EBAY,FB,FSLY,GE,GEVO,GM,GOOGL,GS,HD,HON,IBM,INMD,INTC,JNJ,JPM,KO,LEN,LVS,MA,MDLZ,MMM,MNST,MSFT,MO,MRIN,MRK,MS,MSI,NFLX,NKE,NVDA,NVS,ORCL,PEP,PFE,PG,PYPL,RACE,RKLB,RL,RWLK,SBUX,SNAP,SSRM,SQ,T,TEVA,TM,TMUS,TRIP,TSLA,TSM,TWTR,UNH,V,VZ,WFC,WMT,XOM".split(','));

// Default prices for fallback (in case APIs fail)
const defaultPrices = {
  BTC: 45000,
  ETH: 2500,
  XRP: 2.50,
  SOL: 150,
  TSLA: 250,
  // Add more as needed
};

async function fetchAssets() {
  try {
    const assets = [];
    
    // Fetch crypto assets
    try {
      const cryptoResponse = await fetch(cryptoUrl, { headers });
      if (cryptoResponse.ok) {
        const cryptoData = await cryptoResponse.json();
        const cassets = Object.entries(cryptoData)
          .filter(([symbol]) => cryptoSymbols.has(symbol)) // Only include expected symbols
          .map(([symbol, assetData]) => {
            const price = assetData?.value;
            const finalPrice = (price && !isNaN(price) && price > 0) ? price : (defaultPrices[symbol] || 0);
            
            if (isNaN(finalPrice) || finalPrice < 0) {
              console.warn(`Invalid price for crypto ${symbol}:`, { apiPrice: price, finalPrice });
              return null;
            }
            
            return {
              name: assetNames[symbol] || symbol,
              price: finalPrice,
              symbol: symbol,
              icon: `/asseticons/${symbol}.svg`,
              type: "crypto",
              amount: 0
            };
          })
          .filter(asset => asset !== null);
        
        assets.push(...cassets);
        console.log(`[fetchAssets] Loaded ${cassets.length} crypto assets`);
      }
    } catch (error) {
      console.error("Error fetching crypto assets:", error);
    }

    // Fetch stock assets
    try {
      const stockResponse = await fetch(stockUrl, { headers: stockHeaders });
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        const sassets = Object.entries(stockData)
          .filter(([symbol]) => stockSymbols.has(symbol)) // Only include expected symbols
          .map(([symbol, asset]) => {
            const price = asset?.dailyBar?.c;
            const finalPrice = (price && !isNaN(price) && price > 0) ? price : (defaultPrices[symbol] || 0);
            
            if (isNaN(finalPrice) || finalPrice < 0) {
              console.warn(`Invalid price for stock ${symbol}:`, { apiPrice: price, finalPrice });
              return null;
            }
            
            return {
              name: assetNames[symbol] || symbol,
              price: finalPrice,
              symbol: symbol,
              icon: `/asseticons/${symbol}.svg`,
              type: "stock",
              amount: 0
            };
          })
          .filter(asset => asset !== null);
        
        assets.push(...sassets);
        console.log(`[fetchAssets] Loaded ${sassets.length} stock assets`);
      }
    } catch (error) {
      console.error("Error fetching stock assets:", error);
    }

    console.log(`[fetchAssets] Total assets loaded: ${assets.length}`);
    return assets;
  } catch (error) {
    console.error("Error in fetchAssets:", error);
    return [];
  }
}
export { fetchAssets };