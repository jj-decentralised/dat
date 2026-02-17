/**
 * Massive.com API Client
 * Wraps the Massive.com (formerly Polygon.io) REST API
 * Base URL: https://api.polygon.io (still supported)
 */

const MassiveAPI = {
  apiKey: null,
  baseUrl: 'https://api.polygon.io',
  cache: new Map(),
  rateLimitDelay: 250, // ms between requests for free tier

  setApiKey(key) {
    this.apiKey = key;
  },

  isConnected() {
    return !!this.apiKey;
  },

  async _fetch(endpoint, params = {}) {
    if (!this.apiKey) {
      throw new Error('API key not set. Please enter your Massive.com API key.');
    }

    const url = new URL(this.baseUrl + endpoint);
    params.apiKey = this.apiKey;
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });

    const cacheKey = url.toString();
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.time < 5 * 60 * 1000) { // 5 min cache
        return cached.data;
      }
    }

    // Rate limiting
    if (this._lastRequest) {
      const elapsed = Date.now() - this._lastRequest;
      if (elapsed < this.rateLimitDelay) {
        await new Promise(r => setTimeout(r, this.rateLimitDelay - elapsed));
      }
    }

    const response = await fetch(url.toString());
    this._lastRequest = Date.now();

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Invalid API key or insufficient permissions.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, time: Date.now() });
    return data;
  },

  /**
   * Get single ticker snapshot (current price, volume, change)
   */
  async getTickerSnapshot(ticker) {
    const data = await this._fetch(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`);
    return data.ticker || null;
  },

  /**
   * Get multiple ticker snapshots
   */
  async getAllSnapshots(tickers) {
    const tickerParam = tickers.join(',');
    const data = await this._fetch('/v2/snapshot/locale/us/markets/stocks/tickers', {
      tickers: tickerParam
    });
    return data.tickers || [];
  },

  /**
   * Get aggregated bars for a stock ticker
   */
  async getStockBars(ticker, multiplier, timespan, from, to) {
    const data = await this._fetch(
      `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
      { adjusted: true, sort: 'asc', limit: 50000 }
    );
    return data.results || [];
  },

  /**
   * Get daily open/close for a stock
   */
  async getDailyOHLC(ticker, date) {
    const data = await this._fetch(`/v1/open-close/${ticker}/${date}`);
    return data;
  },

  /**
   * Get crypto last trade
   */
  async getCryptoLastTrade(from, to) {
    const data = await this._fetch(`/v1/last/crypto/${from}/${to}`);
    return data.last || null;
  },

  /**
   * Get crypto aggregated bars
   */
  async getCryptoBars(pair, multiplier, timespan, from, to) {
    const data = await this._fetch(
      `/v2/aggs/ticker/${pair}/range/${multiplier}/${timespan}/${from}/${to}`,
      { adjusted: true, sort: 'asc', limit: 50000 }
    );
    return data.results || [];
  },

  /**
   * Get ticker details / overview
   */
  async getTickerDetails(ticker) {
    const data = await this._fetch(`/v3/reference/tickers/${ticker}`);
    return data.results || null;
  },

  /**
   * Get current crypto prices for BTC, ETH, SOL
   */
  async getCryptoPrices() {
    const prices = {};
    try {
      const [btc, eth, sol] = await Promise.all([
        this.getCryptoLastTrade('BTC', 'USD'),
        this.getCryptoLastTrade('ETH', 'USD'),
        this.getCryptoLastTrade('SOL', 'USD')
      ]);
      prices.BTC = btc?.price || null;
      prices.ETH = eth?.price || null;
      prices.SOL = sol?.price || null;
    } catch (e) {
      console.warn('Failed to fetch crypto prices from API:', e.message);
    }
    return prices;
  },

  /**
   * Get stock snapshots for all treasury companies
   */
  async getTreasurySnapshots() {
    const tickers = TREASURY_COMPANIES.map(c => c.ticker);
    const results = {};

    // Fetch in batches of 10 to avoid URL length limits
    for (let i = 0; i < tickers.length; i += 10) {
      const batch = tickers.slice(i, i + 10);
      try {
        const snapshots = await this.getAllSnapshots(batch);
        snapshots.forEach(s => {
          results[s.ticker] = s;
        });
      } catch (e) {
        console.warn(`Failed to fetch snapshots for batch:`, batch, e.message);
        // Try individual fetches as fallback
        for (const ticker of batch) {
          try {
            const snap = await this.getTickerSnapshot(ticker);
            if (snap) results[ticker] = snap;
          } catch (err) {
            console.warn(`Failed to fetch snapshot for ${ticker}:`, err.message);
          }
        }
      }
    }

    return results;
  },

  /**
   * Get historical bars for multiple tickers
   */
  async getMultipleStockBars(tickers, days = 30) {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const results = {};

    for (const ticker of tickers) {
      try {
        results[ticker] = await this.getStockBars(ticker, 1, 'day', from, to);
      } catch (e) {
        console.warn(`Failed to fetch bars for ${ticker}:`, e.message);
        results[ticker] = [];
      }
    }

    return results;
  },

  /**
   * Validate API key
   */
  async validateKey() {
    try {
      await this._fetch('/v2/snapshot/locale/us/markets/stocks/tickers/AAPL');
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Fallback prices when API is not connected
const FALLBACK_PRICES = {
  BTC: 97500,
  ETH: 2750,
  SOL: 195
};

// Simulated stock data for when API is not connected
const FALLBACK_SNAPSHOTS = {
  MSTR: { day: { c: 388.50, v: 18500000, o: 382.20 }, prevDay: { c: 385.10 }, todaysChangePerc: 0.88 },
  MARA: { day: { c: 22.85, v: 42000000, o: 22.10 }, prevDay: { c: 22.30 }, todaysChangePerc: 2.47 },
  RIOT: { day: { c: 12.65, v: 28000000, o: 12.40 }, prevDay: { c: 12.50 }, todaysChangePerc: 1.20 },
  CLSK: { day: { c: 13.20, v: 15000000, o: 12.90 }, prevDay: { c: 13.00 }, todaysChangePerc: 1.54 },
  COIN: { day: { c: 265.30, v: 8500000, o: 262.50 }, prevDay: { c: 263.80 }, todaysChangePerc: 0.57 },
  TSLA: { day: { c: 345.20, v: 52000000, o: 340.80 }, prevDay: { c: 342.00 }, todaysChangePerc: 0.94 },
  XYZ:  { day: { c: 78.40, v: 5200000, o: 77.80 }, prevDay: { c: 77.90 }, todaysChangePerc: 0.64 },
  HUT:  { day: { c: 28.15, v: 6800000, o: 27.50 }, prevDay: { c: 27.80 }, todaysChangePerc: 1.26 },
  BITF: { day: { c: 1.85, v: 12000000, o: 1.82 }, prevDay: { c: 1.83 }, todaysChangePerc: 1.09 },
  IREN: { day: { c: 11.40, v: 4500000, o: 11.20 }, prevDay: { c: 11.30 }, todaysChangePerc: 0.88 },
  WULF: { day: { c: 6.25, v: 8200000, o: 6.10 }, prevDay: { c: 6.15 }, todaysChangePerc: 1.63 },
  BTDR: { day: { c: 18.90, v: 3100000, o: 18.60 }, prevDay: { c: 18.70 }, todaysChangePerc: 1.07 },
  SMLR: { day: { c: 52.80, v: 320000, o: 51.90 }, prevDay: { c: 52.10 }, todaysChangePerc: 1.34 },
  CIFR: { day: { c: 7.35, v: 7800000, o: 7.20 }, prevDay: { c: 7.25 }, todaysChangePerc: 1.38 },
  CORZ: { day: { c: 14.20, v: 5600000, o: 14.00 }, prevDay: { c: 14.05 }, todaysChangePerc: 1.07 },
  BTBT: { day: { c: 3.45, v: 4200000, o: 3.38 }, prevDay: { c: 3.40 }, todaysChangePerc: 1.47 },
  BTCS: { day: { c: 2.80, v: 1500000, o: 2.72 }, prevDay: { c: 2.75 }, todaysChangePerc: 1.82 },
  SQQQ: { day: { c: 5.10, v: 980000, o: 5.00 }, prevDay: { c: 5.02 }, todaysChangePerc: 1.59 },
  DFDV: { day: { c: 12.40, v: 650000, o: 12.10 }, prevDay: { c: 12.20 }, todaysChangePerc: 1.64 },
  UPCX: { day: { c: 8.75, v: 1200000, o: 8.50 }, prevDay: { c: 8.60 }, todaysChangePerc: 1.74 }
};

// Generate simulated historical data for market data tab
function generateSimulatedBars(ticker, days) {
  const bars = [];
  const snap = FALLBACK_SNAPSHOTS[ticker];
  if (!snap) return bars;

  let price = snap.day.c * (0.7 + Math.random() * 0.2); // start ~75-90% of current
  const endPrice = snap.day.c;
  const dailyDrift = (endPrice - price) / days;

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

    const volatility = price * 0.03;
    const change = dailyDrift + (Math.random() - 0.5) * volatility;
    price = Math.max(price + change, 0.01);

    const high = price * (1 + Math.random() * 0.03);
    const low = price * (1 - Math.random() * 0.03);
    const volume = (snap.day.v || 1000000) * (0.5 + Math.random());

    bars.push({
      t: date.getTime(),
      o: price - change * 0.3,
      h: high,
      l: low,
      c: price,
      v: Math.round(volume)
    });
  }

  return bars;
}
