/**
 * Treasury Companies Data Module
 * Contains known crypto treasury companies and their holdings data.
 * Holdings data sourced from public filings and disclosures.
 */

const TREASURY_COMPANIES = [
  {
    ticker: 'MSTR',
    name: 'Strategy (MicroStrategy)',
    sector: 'Software / BTC Treasury',
    holdings: {
      BTC: { quantity: 478740, avgCost: 65033 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 244890000,
    marketCapOverride: null
  },
  {
    ticker: 'MARA',
    name: 'Marathon Digital Holdings',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 44893, avgCost: 43000 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 310750000,
    marketCapOverride: null
  },
  {
    ticker: 'RIOT',
    name: 'Riot Platforms',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 17722, avgCost: 39800 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 332100000,
    marketCapOverride: null
  },
  {
    ticker: 'CLSK',
    name: 'CleanSpark',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 10556, avgCost: 42200 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 278600000,
    marketCapOverride: null
  },
  {
    ticker: 'COIN',
    name: 'Coinbase Global',
    sector: 'Crypto Exchange',
    holdings: {
      BTC: { quantity: 9480, avgCost: 28500 },
      ETH: { quantity: 152000, avgCost: 2100 },
      SOL: { quantity: 45000, avgCost: 95 }
    },
    sharesOutstanding: 246700000,
    marketCapOverride: null
  },
  {
    ticker: 'TSLA',
    name: 'Tesla',
    sector: 'Automotive / Energy',
    holdings: {
      BTC: { quantity: 11509, avgCost: 32700 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 3210000000,
    marketCapOverride: null
  },
  {
    ticker: 'XYZ',
    name: 'Block Inc',
    sector: 'Fintech / Payments',
    holdings: {
      BTC: { quantity: 8027, avgCost: 34600 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 605000000,
    marketCapOverride: null
  },
  {
    ticker: 'HUT',
    name: 'Hut 8 Corp',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 10096, avgCost: 31600 },
      ETH: { quantity: 1500, avgCost: 2350 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 98200000,
    marketCapOverride: null
  },
  {
    ticker: 'BITF',
    name: 'Bitfarms',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 1147, avgCost: 38400 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 469000000,
    marketCapOverride: null
  },
  {
    ticker: 'IREN',
    name: 'IREN Limited',
    sector: 'Bitcoin Mining / AI',
    holdings: {
      BTC: { quantity: 1612, avgCost: 45100 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 265900000,
    marketCapOverride: null
  },
  {
    ticker: 'WULF',
    name: 'TeraWulf',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 916, avgCost: 41200 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 386100000,
    marketCapOverride: null
  },
  {
    ticker: 'BTDR',
    name: 'Bitdeer Technologies',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 1234, avgCost: 52000 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 174500000,
    marketCapOverride: null
  },
  {
    ticker: 'SMLR',
    name: 'Semler Scientific',
    sector: 'Healthcare / BTC Treasury',
    holdings: {
      BTC: { quantity: 3192, avgCost: 69682 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 7050000,
    marketCapOverride: null
  },
  {
    ticker: 'CIFR',
    name: 'Cipher Mining',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 1034, avgCost: 44500 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 356200000,
    marketCapOverride: null
  },
  {
    ticker: 'CORZ',
    name: 'Core Scientific',
    sector: 'Bitcoin Mining / AI',
    holdings: {
      BTC: { quantity: 585, avgCost: 39800 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 0, avgCost: 0 }
    },
    sharesOutstanding: 260000000,
    marketCapOverride: null
  },
  {
    ticker: 'BTBT',
    name: 'Bit Digital',
    sector: 'Bitcoin Mining',
    holdings: {
      BTC: { quantity: 730, avgCost: 33200 },
      ETH: { quantity: 19518, avgCost: 2800 },
      SOL: { quantity: 8200, avgCost: 110 }
    },
    sharesOutstanding: 124900000,
    marketCapOverride: null
  },
  {
    ticker: 'BTCS',
    name: 'BTCS Inc',
    sector: 'Blockchain Infrastructure',
    holdings: {
      BTC: { quantity: 78, avgCost: 38500 },
      ETH: { quantity: 12835, avgCost: 2400 },
      SOL: { quantity: 3500, avgCost: 85 }
    },
    sharesOutstanding: 16200000,
    marketCapOverride: null
  },
  {
    ticker: 'SQQQ',
    name: 'SOL Strategies',
    sector: 'Solana Ecosystem',
    holdings: {
      BTC: { quantity: 0, avgCost: 0 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 134396, avgCost: 140 }
    },
    sharesOutstanding: 55000000,
    marketCapOverride: null
  },
  {
    ticker: 'DFDV',
    name: 'DeFi Development Corp',
    sector: 'Solana Ecosystem',
    holdings: {
      BTC: { quantity: 0, avgCost: 0 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 317381, avgCost: 130 }
    },
    sharesOutstanding: 32400000,
    marketCapOverride: null
  },
  {
    ticker: 'UPCX',
    name: 'Upexi',
    sector: 'Solana Ecosystem',
    holdings: {
      BTC: { quantity: 0, avgCost: 0 },
      ETH: { quantity: 0, avgCost: 0 },
      SOL: { quantity: 595000, avgCost: 145 }
    },
    sharesOutstanding: 45000000,
    marketCapOverride: null
  }
];

// Historical holdings snapshots for time-series charts (quarterly)
const HOLDINGS_HISTORY = {
  dates: ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Q1'],
  aggregateBTC: [280000, 310000, 345000, 385000, 430000, 480000, 520000, 560000, 580000],
  aggregateETH: [95000, 110000, 125000, 140000, 155000, 165000, 175000, 182000, 186000],
  aggregateSOL: [120000, 180000, 250000, 380000, 500000, 650000, 780000, 920000, 1050000]
};

// Color palette for charts
const CHART_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e879f9', '#fb923c', '#a78bfa', '#34d399',
  '#f472b6', '#fbbf24', '#818cf8', '#2dd4bf', '#fb7185'
];

/**
 * Helper functions for data processing
 */
const DataUtils = {
  formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    if (Math.abs(num) >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (Math.abs(num) >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (Math.abs(num) >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (Math.abs(num) >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
    return '$' + num.toFixed(2);
  },

  formatCount(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  },

  formatPercent(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
  },

  formatPrice(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  getCompaniesWithHolding(asset) {
    return TREASURY_COMPANIES.filter(c => c.holdings[asset] && c.holdings[asset].quantity > 0);
  },

  getTotalHolding(asset) {
    return TREASURY_COMPANIES.reduce((sum, c) => sum + (c.holdings[asset]?.quantity || 0), 0);
  },

  getCryptoNAV(company, prices) {
    let nav = 0;
    if (company.holdings.BTC.quantity > 0 && prices.BTC) {
      nav += company.holdings.BTC.quantity * prices.BTC;
    }
    if (company.holdings.ETH.quantity > 0 && prices.ETH) {
      nav += company.holdings.ETH.quantity * prices.ETH;
    }
    if (company.holdings.SOL.quantity > 0 && prices.SOL) {
      nav += company.holdings.SOL.quantity * prices.SOL;
    }
    return nav;
  },

  getAggregateNAV(prices) {
    return TREASURY_COMPANIES.reduce((sum, c) => sum + this.getCryptoNAV(c, prices), 0);
  }
};
