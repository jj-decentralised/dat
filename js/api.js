/**
 * Massive.com API Client (formerly Polygon.io)
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

const FALLBACK_PRICES = { BTC: 97500, ETH: 2750, SOL: 195 };

// Generate fallback snapshot for any ticker
function _makeFallbackSnap(price, vol) {
  const change = (Math.random() - 0.4) * 4;
  return { day: { c: price, v: vol, o: price * (1 - change / 100) }, prevDay: { c: price * (1 - change / 100) }, todaysChangePerc: change };
}

const FALLBACK_SNAPSHOTS = {};
const _SNAP_PRICES = {
  MSTR: [388.50, 18500000], BMNR: [2.15, 1200000], XXI: [45.80, 3500000], SBET: [1.85, 950000],
  ETHM: [3.20, 800000], PURR: [1.10, 600000], BTBT: [3.45, 4200000], ASST: [0.85, 500000],
  FWDI: [1.95, 350000], MBAV: [0.55, 280000], FGNX: [1.40, 420000], CEPO: [4.80, 1100000],
  BRR: [8.50, 2200000], BNC: [2.60, 780000], NAKA: [6.20, 1800000], DFDV: [12.40, 650000],
  SUIG: [3.10, 550000], SLMT: [1.75, 380000], HSDT: [2.90, 1600000], BTCS: [2.80, 1500000],
  ETHZ: [4.50, 900000], SQNS: [1.20, 2100000], UPXI: [8.75, 1200000], STSS: [0.65, 300000],
  HYPD: [1.30, 450000], WGRX: [2.10, 520000], STKE: [3.80, 680000], GAME: [1.90, 1400000],
  VVPR: [1.45, 350000], BNKK: [2.25, 600000], PAPL: [0.95, 250000], SLAI: [1.70, 400000],
  WETO: [0.75, 550000], IPST: [1.15, 320000], SBLX: [1.50, 280000], NVVE: [0.90, 420000],
  LGHL: [1.60, 880000]
};
Object.entries(_SNAP_PRICES).forEach(([t, [p, v]]) => { FALLBACK_SNAPSHOTS[t] = _makeFallbackSnap(p, v); });

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
