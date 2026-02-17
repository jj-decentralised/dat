/**
 * Massive.com API Client (formerly Polygon.io)
 * API key is optional - dashboard works fully with preloaded data.
 */

const MassiveAPI = {
  apiKey: null,
  baseUrl: 'https://api.polygon.io',
  cache: new Map(),
  rateLimitDelay: 250,

  setApiKey(key) { this.apiKey = key; },
  isConnected() { return !!this.apiKey; },

  async _fetch(endpoint, params = {}) {
    if (!this.apiKey) throw new Error('API key not set.');
    const url = new URL(this.baseUrl + endpoint);
    params.apiKey = this.apiKey;
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });

    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.time < 5 * 60 * 1000) return cached.data;

    if (this._lastRequest) {
      const elapsed = Date.now() - this._lastRequest;
      if (elapsed < this.rateLimitDelay) await new Promise(r => setTimeout(r, this.rateLimitDelay - elapsed));
    }

    const response = await fetch(url.toString());
    this._lastRequest = Date.now();

    if (!response.ok) {
      if (response.status === 403) throw new Error('Invalid API key.');
      if (response.status === 429) throw new Error('Rate limited.');
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    this.cache.set(cacheKey, { data, time: Date.now() });
    return data;
  },

  async getTickerSnapshot(ticker) {
    const data = await this._fetch(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`);
    return data.ticker || null;
  },

  async getAllSnapshots(tickers) {
    const data = await this._fetch('/v2/snapshot/locale/us/markets/stocks/tickers', { tickers: tickers.join(',') });
    return data.tickers || [];
  },

  async getStockBars(ticker, multiplier, timespan, from, to) {
    const data = await this._fetch(`/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`, { adjusted: true, sort: 'asc', limit: 50000 });
    return data.results || [];
  },

  async getCryptoLastTrade(from, to) {
    const data = await this._fetch(`/v1/last/crypto/${from}/${to}`);
    return data.last || null;
  },

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
    } catch (e) { console.warn('Crypto prices fetch failed:', e.message); }
    return prices;
  },

  async getTreasurySnapshots() {
    const tickers = TREASURY_COMPANIES.map(c => c.ticker);
    const results = {};
    for (let i = 0; i < tickers.length; i += 10) {
      const batch = tickers.slice(i, i + 10);
      try {
        const snapshots = await this.getAllSnapshots(batch);
        snapshots.forEach(s => { results[s.ticker] = s; });
      } catch (e) {
        for (const ticker of batch) {
          try {
            const snap = await this.getTickerSnapshot(ticker);
            if (snap) results[ticker] = snap;
          } catch (err) { /* skip */ }
        }
      }
    }
    return results;
  },

  async getMultipleStockBars(tickers, days = 90) {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const results = {};
    for (const ticker of tickers) {
      try {
        results[ticker] = await this.getStockBars(ticker, 1, 'day', from, to);
      } catch (e) {
        console.warn(`Bars failed for ${ticker}:`, e.message);
        results[ticker] = [];
      }
    }
    return results;
  },

  async validateKey() {
    try { await this._fetch('/v2/snapshot/locale/us/markets/stocks/tickers/AAPL'); return true; }
    catch { return false; }
  }
};

// Accurate fallback crypto prices (Feb 2026)
const FALLBACK_PRICES = { BTC: 69400, ETH: 2300, SOL: 110 };

// Accurate fallback stock snapshots from public market data (Feb 2026)
function _makeFallbackSnap(price, vol, changePerc) {
  const prevClose = price / (1 + changePerc / 100);
  return {
    day: { c: price, v: vol, o: prevClose },
    prevDay: { c: prevClose },
    todaysChangePerc: changePerc
  };
}

const FALLBACK_SNAPSHOTS = {};
// [price, avg_volume, daily_change_%]
const _SNAP_PRICES = {
  // BTC Treasury
  MSTR: [120.00, 18000000, -1.85],
  XXI:  [6.55, 3500000, -0.76],
  ASST: [8.70, 2500000, +0.58],
  NAKA: [0.30, 8000000, -3.23],
  BRR:  [2.37, 2200000, -1.25],
  SQNS: [3.30, 2100000, -2.34],
  LGHL: [1.90, 880000, +1.06],

  // ETH Treasury
  BMNR: [21.20, 12000000, -2.10],
  SBET: [6.85, 5000000, -1.44],
  ETHM: [10.34, 2000000, +0.49],
  BTBT: [1.76, 4200000, -0.56],
  ETHZ: [3.50, 900000, -1.13],
  BTCS: [1.65, 1500000, +0.61],
  FGNX: [3.06, 420000, -0.65],
  GAME: [0.30, 1400000, -2.94],

  // SOL Treasury
  HSDT: [3.46, 1600000, -1.71],
  DFDV: [3.89, 650000, +1.31],
  UPXI: [1.00, 1200000, -2.91],
  STSS: [4.50, 800000, -0.88],
  STKE: [1.99, 680000, +0.51],
  FWDI: [8.00, 350000, -1.23],
  SLAI: [0.85, 400000, -1.16],
  SLMT: [1.21, 380000, +0.83],

  // Other Crypto Treasury
  PURR: [4.50, 600000, +2.30],
  SUIG: [1.21, 550000, -1.64],
  BNC:  [4.52, 780000, -0.88],
  HYPD: [1.30, 450000, +1.57],
  WGRX: [0.35, 520000, -4.11],
  VVPR: [1.63, 350000, -0.61],
  BNKK: [2.25, 600000, +3.21],
  PAPL: [0.73, 250000, -1.35],
  IPST: [3.50, 320000, +0.86],
  SBLX: [2.46, 280000, -0.40],

  // SPACs / Pre-Merger
  CEPO: [10.44, 500000, +0.10],
  MBAV: [10.70, 280000, +0.19],
  NVVE: [1.39, 420000, -2.10],
  WETO: [0.51, 550000, -3.77]
};
Object.entries(_SNAP_PRICES).forEach(([t, [p, v, ch]]) => { FALLBACK_SNAPSHOTS[t] = _makeFallbackSnap(p, v, ch); });

function generateSimulatedBars(ticker, days) {
  const bars = [];
  const snap = FALLBACK_SNAPSHOTS[ticker];
  if (!snap) return bars;

  let price = snap.day.c * (0.5 + Math.random() * 0.3);
  const endPrice = snap.day.c;
  const dailyDrift = (endPrice - price) / days;

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
