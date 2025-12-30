// Price service for fetching live cryptocurrency prices
export interface PriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

export class PriceService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  /**
   * Fetch current prices for multiple cryptocurrencies
   * @param symbols Array of cryptocurrency symbols (e.g., ['bitcoin', 'ethereum'])
   * @returns Promise<PriceData>
   */
  static async fetchPrices(symbols: string[]): Promise<PriceData> {
    try {
      const ids = symbols.join(',');
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch prices from CoinGecko:', error);
      throw error;
    }
  }

  /**
   * Fetch price for a single cryptocurrency
   * @param symbol Cryptocurrency symbol (e.g., 'bitcoin')
   * @returns Promise<number>
   */
  static async fetchPrice(symbol: string): Promise<number> {
    try {
      const prices = await this.fetchPrices([symbol]);
      return prices[symbol]?.usd || 0;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return 0;
    }
  }

  /**
   * Map common symbols to CoinGecko IDs
   * @param symbol Database symbol
   * @returns CoinGecko ID
   */
  static mapSymbolToCoinGeckoId(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'AAVE': 'aave',
      'TSLA': 'tesla', // Note: This might not work for stocks
      'AAPL': 'apple',
      'GOOGL': 'alphabet',
      'MSFT': 'microsoft',
      'NVDA': 'nvidia',
      'AMZN': 'amazon',
    };

    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }
}