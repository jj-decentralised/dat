/**
 * Treasury Companies Data Module
 * Holdings data sourced from public filings and disclosures (as of Feb 2026).
 * Prices and holdings are preloaded snapshots; connect API for live updates.
 */

const TREASURY_COMPANIES = [
  // ========== BTC Treasury Companies ==========
  { ticker: 'MSTR', name: 'Strategy (MicroStrategy)', sector: 'Software / BTC Treasury', holdings: { BTC: { quantity: 714644, avgCost: 76056 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 500000000 },
  { ticker: 'XXI', name: 'Twenty One Capital', sector: 'BTC Treasury', holdings: { BTC: { quantity: 43514, avgCost: 72000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 346500000 },
  { ticker: 'ASST', name: 'Strive Inc', sector: 'Asset Management / BTC Treasury', holdings: { BTC: { quantity: 13132, avgCost: 68819 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 63100000 },
  { ticker: 'NAKA', name: 'Nakamoto Inc', sector: 'Healthcare / BTC Treasury', holdings: { BTC: { quantity: 5398, avgCost: 82000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 160000000 },
  { ticker: 'BRR', name: 'ProCap Financial', sector: 'BTC Treasury', holdings: { BTC: { quantity: 5000, avgCost: 73000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 85000000 },
  { ticker: 'SQNS', name: 'Sequans Communications', sector: 'Semiconductor / BTC Treasury', holdings: { BTC: { quantity: 2687, avgCost: 116643 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 14500000 },
  { ticker: 'LGHL', name: 'Lion Group Holding', sector: 'Fintech / Multi-Crypto', holdings: { BTC: { quantity: 88, avgCost: 90404 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 10820, avgCost: 140 } }, sharesOutstanding: 540000 },

  // ========== ETH Treasury Companies ==========
  { ticker: 'BMNR', name: 'Bitmine Immersion', sector: 'ETH Treasury', holdings: { BTC: { quantity: 193, avgCost: 54000 }, ETH: { quantity: 4285125, avgCost: 2991 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 454860000 },
  { ticker: 'SBET', name: 'Sharplink Inc', sector: 'ETH Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 864840, avgCost: 3609 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 196690000 },
  { ticker: 'ETHM', name: 'The Ether Machine', sector: 'ETH Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 496712, avgCost: 3200 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 22130000 },
  { ticker: 'BTBT', name: 'Bit Digital', sector: 'ETH Treasury / AI', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 155239, avgCost: 3045 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 324000000 },
  { ticker: 'ETHZ', name: 'ETHZilla Corp', sector: 'ETH Treasury / DeFi', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 102326, avgCost: 2800 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 18000000 },
  { ticker: 'BTCS', name: 'BTCS Inc', sector: 'Blockchain / ETH Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 70140, avgCost: 2441 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 47500000 },
  { ticker: 'FGNX', name: 'FG Nexus', sector: 'Holding Co / ETH Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 50000, avgCost: 2600 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 35000000 },
  { ticker: 'GAME', name: 'GameSquare Holdings', sector: 'Gaming / ETH Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 15600, avgCost: 3519 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 98380000 },

  // ========== SOL Treasury Companies ==========
  { ticker: 'HSDT', name: 'Solana Company', sector: 'SOL Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2300000, avgCost: 135 } }, sharesOutstanding: 41300000 },
  { ticker: 'DFDV', name: 'DeFi Development Corp', sector: 'SOL Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2221329, avgCost: 108 } }, sharesOutstanding: 29890000 },
  { ticker: 'UPXI', name: 'Upexi', sector: 'SOL Treasury / Consumer', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2174583, avgCost: 151 } }, sharesOutstanding: 69760000 },
  { ticker: 'STSS', name: 'Sharps Technology', sector: 'Healthcare / SOL Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2000000, avgCost: 145 } }, sharesOutstanding: 62000000 },
  { ticker: 'STKE', name: 'SOL Strategies', sector: 'SOL Infrastructure', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 435159, avgCost: 95 } }, sharesOutstanding: 50000000 },
  { ticker: 'FWDI', name: 'Forward Industries', sector: 'Design / SOL Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 125000, avgCost: 140 } }, sharesOutstanding: 10200000 },
  { ticker: 'SLAI', name: 'SOLAI Limited', sector: 'Mining / SOL Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 44412, avgCost: 130 } }, sharesOutstanding: 18680000 },
  { ticker: 'SLMT', name: 'Solmate Infrastructure', sector: 'SOL Validator / Infra', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 35000, avgCost: 120 } }, sharesOutstanding: 90100000 },

  // ========== Other Crypto Treasury Companies ==========
  { ticker: 'PURR', name: 'Hyperliquid Strategies', sector: 'HYPE Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 150600000, otherHoldings: { token: 'HYPE', quantity: 17600000, avgCost: 18.60 } },
  { ticker: 'SUIG', name: 'SUI Group Holdings', sector: 'SUI Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 127000000, otherHoldings: { token: 'SUI', quantity: 101795656, avgCost: 2.50 } },
  { ticker: 'BNC', name: 'CEA Industries', sector: 'BNB Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 43000000, otherHoldings: { token: 'BNB', quantity: 500000, avgCost: 870 } },
  { ticker: 'HYPD', name: 'Hyperion DeFi', sector: 'HYPE Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 25000000, otherHoldings: { token: 'HYPE', quantity: 800000, avgCost: 20.00 } },
  { ticker: 'WGRX', name: 'Wellgistics Health', sector: 'Healthcare / XRP Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 102000000, otherHoldings: { token: 'XRP', quantity: 10000000, avgCost: 2.20 } },
  { ticker: 'VVPR', name: 'VivoPower International', sector: 'Energy / XRP Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 12530000, otherHoldings: { token: 'XRP', quantity: 5000000, avgCost: 2.10 } },
  { ticker: 'BNKK', name: 'Bonk Inc', sector: 'BONK Treasury / Beverages', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 8000000, otherHoldings: { token: 'BONK', quantity: 500000000000, avgCost: 0.000008 } },
  { ticker: 'PAPL', name: 'Pineapple Financial', sector: 'Mortgage / INJ Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 24600000, otherHoldings: { token: 'INJ', quantity: 7200000, avgCost: 5.00 } },
  { ticker: 'IPST', name: 'Heritage Distilling', sector: 'Spirits / IP Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 85000000, otherHoldings: { token: 'IP', quantity: 53200000, avgCost: 3.50 } },
  { ticker: 'SBLX', name: 'StableX Technologies', sector: 'Stablecoin Infra', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 1450000, otherHoldings: { token: 'LINK', quantity: 100000, avgCost: 15.00 } },

  // ========== SPACs / Pre-Merger / Minimal Holdings ==========
  { ticker: 'CEPO', name: 'Cantor Equity Partners I', sector: 'SPAC (Pre-Acquisition)', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 20000000 },
  { ticker: 'MBAV', name: 'M3-Brigade / ReserveOne', sector: 'SPAC (BTC Planned)', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 35700000 },
  { ticker: 'NVVE', name: 'Nuvve Holding', sector: 'V2G Energy / Crypto', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 1325000 },
  { ticker: 'WETO', name: 'Webus International', sector: 'TravelTech', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 26000000 },
];

// Historical holdings snapshots (quarterly) - aggregate across all tracked companies
const HOLDINGS_HISTORY = {
  dates: ['2023-Q1', '2023-Q2', '2023-Q3', '2023-Q4', '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Q1'],
  aggregateBTC: [140000, 155000, 170000, 190000, 215000, 252000, 280000, 350000, 450000, 530000, 620000, 700000, 784656],
  aggregateETH: [48000, 55000, 62000, 70000, 85000, 110000, 180000, 350000, 850000, 2200000, 3800000, 5400000, 6039982],
  aggregateSOL: [0, 0, 5000, 25000, 80000, 200000, 500000, 1200000, 2800000, 5500000, 7800000, 8800000, 9346303]
};

const CHART_COLORS = [
  '#5b8def', '#3ecf8e', '#f0a83a', '#f45b69', '#a78bfa',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#e879f9', '#fb923c', '#34d399', '#f472b6',
  '#fbbf24', '#818cf8', '#2dd4bf', '#fb7185', '#c084fc',
  '#38bdf8', '#4ade80', '#facc15', '#f87171', '#a3e635',
  '#22d3ee', '#d946ef', '#2dd4bf', '#fb923c', '#c084fc',
  '#67e8f9', '#86efac', '#fde047', '#fca5a5', '#d8b4fe',
  '#7dd3fc', '#bbf7d0'
];

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
    ['BTC', 'ETH', 'SOL'].forEach(asset => {
      if (company.holdings[asset].quantity > 0 && prices[asset]) {
        nav += company.holdings[asset].quantity * prices[asset];
      }
    });
    return nav;
  },
  getAggregateNAV(prices) {
    return TREASURY_COMPANIES.reduce((sum, c) => sum + this.getCryptoNAV(c, prices), 0);
  }
};
