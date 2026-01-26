import { assetNames } from "./assetNames";

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
    // Fetch all assets from the backend API
    const response = await fetch('/api/assets');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }
    
    const dbAssets = await response.json();
    console.log('[fetchAssets] Loaded assets from backend:', dbAssets);
    
    const assets = dbAssets.map((asset) => {
      const price = asset.priceUsd || asset.price_usd || 0;
      const logoUrl = asset.logoUrl || asset.logo_url;
      return {
        name: asset.name,
        price: typeof price === 'number' ? price : parseFloat(price) || 0,
        symbol: asset.symbol,
        icon: logoUrl || `/asseticons/${asset.symbol}.svg`,
        type: "custom",
        amount: 0
      };
    });
    
    console.log(`[fetchAssets] Total assets loaded: ${assets.length}`);
    return assets;
  } catch (error) {
    console.error("Error in fetchAssets:", error);
    return [];
  }
}
export { fetchAssets };