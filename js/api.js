/**
 * API Client Module
 * Handles communication with stock market data APIs.
 *
 * SECURITY: No hardcoded API keys. Users supply their own key via the UI.
 * Keys are stored in sessionStorage only (not localStorage) and cleared on tab close.
 */

// Preloaded fallback prices for crypto assets (Feb 2026)
const FALLBACK_PRICES = { BTC: 68418.00, ETH: 1988.68, SOL: 86.35 };

// Helper to create fallback snapshot with proper prevDay data
function _makeFallbackSnap(price, vol, changePerc) {
  const prevClose = price / (1 + changePerc / 100);
  return {
    day: { c: price, v: vol, o: prevClose },
    prevDay: { c: prevClose, v: Math.round(vol * 1.1) },
    todaysChangePerc: changePerc
  };
}

// Preloaded fallback stock snapshots from public market data (Feb 2026)
const _SNAP_PRICES = {
  MSTR: [120.00, 18000000, -1.85], XXI: [6.55, 3500000, -0.76],
  ASST: [8.70, 2500000, 0.58], NAKA: [0.30, 8000000, -3.23],
  BRR: [2.37, 2200000, -1.25], SQNS: [3.30, 2100000, -2.34],
  LGHL: [1.90, 880000, 1.06],
  BMNR: [21.20, 12000000, -2.10], SBET: [6.85, 5000000, -1.44],
  ETHM: [10.34, 2000000, 0.49], BTBT: [1.76, 4200000, -0.56],
  ETHZ: [3.50, 900000, -1.13], BTCS: [1.65, 1500000, 0.61],
  FGNX: [3.06, 420000, -0.65], GAME: [0.30, 1400000, -2.94],
  HSDT: [3.46, 1600000, -1.71], DFDV: [3.89, 650000, 1.31],
  UPXI: [1.00, 1200000, -2.91], STSS: [4.50, 800000, -0.88],
  STKE: [1.99, 680000, 0.51], FWDI: [8.00, 350000, -1.23],
  SLAI: [0.85, 400000, -1.16], SLMT: [1.21, 380000, 0.83],
  PURR: [4.50, 600000, 2.30], SUIG: [1.21, 550000, -1.64],
  BNC: [4.52, 780000, -0.88], HYPD: [1.30, 450000, 1.57],
  WGRX: [0.35, 520000, -4.11], VVPR: [1.63, 350000, -0.61],
  BNKK: [2.25, 600000, 3.21], PAPL: [0.73, 250000, -1.35],
  IPST: [3.50, 320000, 0.86], SBLX: [2.46, 280000, -0.40],
  CEPO: [10.44, 500000, 0.10], MBAV: [10.70, 280000, 0.19],
  NVVE: [1.39, 420000, -2.10], WETO: [0.51, 550000, -3.77]
};

const FALLBACK_SNAPSHOTS = {};
Object.entries(_SNAP_PRICES).forEach(([t, [p, v, ch]]) => {
  FALLBACK_SNAPSHOTS[t] = _makeFallbackSnap(p, v, ch);
});

/**
 * Generate simulated stock bar data for charts.
 * IMPORTANT: This data is synthetic. The UI clearly marks it as simulated.
 */
function generateSimulatedBars(ticker, days) {
  const bars = [];
  const snap = FALLBACK_SNAPSHOTS[ticker];
  if (!snap) return bars;

  const basePrice = DataUtils.getStockPrice(snap) || 10;
  let price = basePrice * (0.5 + Math.random() * 0.3);
  const dailyDrift = (basePrice - price) / days;

  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const volatility = price * 0.04;
    const change = dailyDrift + (Math.random() - 0.5) * volatility;
    price = Math.max(price + change, 0.01);
    bars.push({
      t: date.getTime(),
      o: price - change * 0.3,
      h: price * (1 + Math.random() * 0.03),
      l: price * (1 - Math.random() * 0.03),
      c: price,
      v: Math.round((snap.day.v || 1000000) * (0.5 + Math.random()))
    });
  }
  return bars;
}

const MassiveAPI = {
  _apiKey: null,
  _baseUrl: 'https://api.polygon.io',
  _cache: new Map(),
  _rateLimitDelay: 250,
  _lastRequest: 0,

  setApiKey(key) { this._apiKey = key; },
  isConnected() { return !!this._apiKey; },

  async _fetch(endpoint, params = {}) {
    if (!this._apiKey) throw new Error('No API key configured');
    const url = new URL(this._baseUrl + endpoint);
    params.apiKey = this._apiKey;
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });

    const cacheKey = url.toString();
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.data;

    // Rate limiting
    const elapsed = Date.now() - this._lastRequest;
    if (elapsed < this._rateLimitDelay) {
      await new Promise(r => setTimeout(r, this._rateLimitDelay - elapsed));
    }

    const response = await fetch(url.toString());
    this._lastRequest = Date.now();

    if (!response.ok) {
      if (response.status === 403) throw new Error('API key lacks required permissions (403)');
      if (response.status === 429) throw new Error('Rate limited - try again shortly');
      throw new Error('API error: ' + response.status);
    }

    const data = await response.json();
    this._cache.set(cacheKey, { data, time: Date.now() });
    return data;
  },

  async validateKey() {
    try {
      await this._fetch('/v2/snapshot/locale/us/markets/stocks/tickers/AAPL');
      return true;
    } catch {
      return false;
    }
  },

  async getCryptoPrices() {
    const prices = {};
    const errors = [];
    const pairs = [
      { from: 'BTC', to: 'USD', key: 'BTC' },
      { from: 'ETH', to: 'USD', key: 'ETH' },
      { from: 'SOL', to: 'USD', key: 'SOL' }
    ];

    for (const pair of pairs) {
      try {
        const data = await this._fetch('/v1/last/crypto/' + pair.from + '/' + pair.to);
        if (data.last?.price) {
          prices[pair.key] = data.last.price;
        }
      } catch (e) {
        errors.push(pair.key + ': ' + e.message);
      }
    }

    return { prices, errors };
  },

  async getTreasurySnapshots() {
    const tickers = TREASURY_COMPANIES.map(c => c.ticker);
    const snapshots = {};
    const errors = [];

    for (let i = 0; i < tickers.length; i += 10) {
      const batch = tickers.slice(i, i + 10);
      try {
        const data = await this._fetch('/v2/snapshot/locale/us/markets/stocks/tickers', {
          tickers: batch.join(',')
        });
        if (data.tickers) {
          data.tickers.forEach(s => { snapshots[s.ticker] = s; });
        }
      } catch (e) {
        // Fall back to individual requests
        for (const ticker of batch) {
          try {
            const data = await this._fetch('/v2/snapshot/locale/us/markets/stocks/tickers/' + ticker);
            if (data.ticker) snapshots[ticker] = data.ticker;
          } catch (err) {
            errors.push(ticker + ': ' + err.message);
          }
        }
      }
    }

    return { snapshots, errors };
  },

  async getMultipleStockBars(tickers, days) {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const results = {};

    for (const ticker of tickers) {
      try {
        const data = await this._fetch(
          '/v2/aggs/ticker/' + ticker + '/range/1/day/' + from + '/' + to,
          { adjusted: true, sort: 'asc', limit: 50000 }
        );
        results[ticker] = (data.results || []).map(r => ({
          t: r.t,
          o: r.o, h: r.h, l: r.l, c: r.c, v: r.v
        }));
      } catch (e) {
        console.warn('Bars fetch failed for ' + ticker + ':', e.message);
        results[ticker] = [];
      }
    }
    return results;
  }
};
