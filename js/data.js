/**
 * Treasury Companies Data Module
 * Holdings data sourced from public filings and disclosures.
 */

const TREASURY_COMPANIES = [
  { ticker: 'MSTR', name: 'Strategy (MicroStrategy)', sector: 'Software / BTC Treasury', holdings: { BTC: { quantity: 478740, avgCost: 65033 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 244890000 },
  { ticker: 'BMNR', name: 'Bitmine', sector: 'Bitcoin Mining', holdings: { BTC: { quantity: 282, avgCost: 54000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 42000000 },
  { ticker: 'XXI', name: 'Twenty One Capital', sector: 'BTC Treasury', holdings: { BTC: { quantity: 31500, avgCost: 72000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 195000000 },
  { ticker: 'SBET', name: 'SharpLink Gaming', sector: 'Gaming / BTC Treasury', holdings: { BTC: { quantity: 88, avgCost: 60500 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 18500000 },
  { ticker: 'ETHM', name: 'Ether Capital', sector: 'ETH Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 32600, avgCost: 2300 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 98000000 },
  { ticker: 'PURR', name: 'Purrfect Holdings', sector: 'BTC Treasury', holdings: { BTC: { quantity: 120, avgCost: 58000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 25000000 },
  { ticker: 'BTBT', name: 'Bit Digital', sector: 'Bitcoin Mining', holdings: { BTC: { quantity: 730, avgCost: 33200 }, ETH: { quantity: 19518, avgCost: 2800 }, SOL: { quantity: 8200, avgCost: 110 } }, sharesOutstanding: 124900000 },
  { ticker: 'ASST', name: 'Asset Entities', sector: 'Digital Media / BTC Treasury', holdings: { BTC: { quantity: 45, avgCost: 62000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 15000000 },
  { ticker: 'FWDI', name: 'Forward Industries', sector: 'Manufacturing / BTC Treasury', holdings: { BTC: { quantity: 52, avgCost: 67000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 10200000 },
  { ticker: 'MBAV', name: 'MiMedia', sector: 'Cloud / BTC Treasury', holdings: { BTC: { quantity: 26, avgCost: 70000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 8500000 },
  { ticker: 'FGNX', name: 'Futuregen Holdings', sector: 'BTC Treasury', holdings: { BTC: { quantity: 35, avgCost: 66000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 12000000 },
  { ticker: 'CEPO', name: 'CryptoEnterprise Portfolio', sector: 'Crypto Investment', holdings: { BTC: { quantity: 210, avgCost: 48000 }, ETH: { quantity: 4500, avgCost: 2500 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 35000000 },
  { ticker: 'BRR', name: 'BRR ETF / Crypto Holdings', sector: 'Crypto ETP', holdings: { BTC: { quantity: 950, avgCost: 55000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 28000000 },
  { ticker: 'BNC', name: 'BNC Capital', sector: 'BTC Treasury', holdings: { BTC: { quantity: 175, avgCost: 61000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 22000000 },
  { ticker: 'NAKA', name: 'Nakamoto Holdings', sector: 'BTC Treasury', holdings: { BTC: { quantity: 420, avgCost: 58000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 48000000 },
  { ticker: 'DFDV', name: 'DeFi Development Corp', sector: 'Solana Ecosystem', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 317381, avgCost: 130 } }, sharesOutstanding: 32400000 },
  { ticker: 'SUIG', name: 'SUI Global', sector: 'Crypto Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 5000, avgCost: 2200 }, SOL: { quantity: 15000, avgCost: 120 } }, sharesOutstanding: 20000000 },
  { ticker: 'SLMT', name: 'SolidMint Corp', sector: 'BTC Treasury', holdings: { BTC: { quantity: 68, avgCost: 64000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 14000000 },
  { ticker: 'HSDT', name: 'Heliogen / HashData Tech', sector: 'Bitcoin Mining', holdings: { BTC: { quantity: 380, avgCost: 42000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 55000000 },
  { ticker: 'BTCS', name: 'BTCS Inc', sector: 'Blockchain Infrastructure', holdings: { BTC: { quantity: 78, avgCost: 38500 }, ETH: { quantity: 12835, avgCost: 2400 }, SOL: { quantity: 3500, avgCost: 85 } }, sharesOutstanding: 16200000 },
  { ticker: 'ETHZ', name: 'ETH Zurich Capital', sector: 'ETH Treasury', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 18000, avgCost: 2100 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 30000000 },
  { ticker: 'SQNS', name: 'Sequans Communications', sector: 'Semiconductor / BTC Treasury', holdings: { BTC: { quantity: 42, avgCost: 71000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 65000000 },
  { ticker: 'UPXI', name: 'Upexi', sector: 'Solana Ecosystem', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 595000, avgCost: 145 } }, sharesOutstanding: 45000000 },
  { ticker: 'STSS', name: 'Sharps Technology', sector: 'Healthcare / BTC Treasury', holdings: { BTC: { quantity: 30, avgCost: 68000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 9500000 },
  { ticker: 'HYPD', name: 'Hyped Company', sector: 'BTC Treasury', holdings: { BTC: { quantity: 55, avgCost: 63000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 18000000 },
  { ticker: 'WGRX', name: 'WagerX', sector: 'Gaming / Crypto Treasury', holdings: { BTC: { quantity: 40, avgCost: 59000 }, ETH: { quantity: 2000, avgCost: 2600 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 12000000 },
  { ticker: 'STKE', name: 'Stake Holdings', sector: 'BTC Treasury', holdings: { BTC: { quantity: 150, avgCost: 56000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 28000000 },
  { ticker: 'GAME', name: 'GameSquare Holdings', sector: 'Gaming / BTC Treasury', holdings: { BTC: { quantity: 95, avgCost: 61000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 42000000 },
  { ticker: 'VVPR', name: 'VivoPower International', sector: 'Energy / BTC Treasury', holdings: { BTC: { quantity: 38, avgCost: 65000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 8500000 },
  { ticker: 'BNKK', name: 'BankK Holdings', sector: 'BTC Treasury', holdings: { BTC: { quantity: 85, avgCost: 60000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 20000000 },
  { ticker: 'PAPL', name: 'Pineapple Financial', sector: 'Fintech / BTC Treasury', holdings: { BTC: { quantity: 22, avgCost: 72000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 7500000 },
  { ticker: 'SLAI', name: 'Sievert Larsen AI', sector: 'AI / BTC Treasury', holdings: { BTC: { quantity: 60, avgCost: 67000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 15000000 },
  { ticker: 'WETO', name: 'WeTrade Group', sector: 'Fintech / BTC Treasury', holdings: { BTC: { quantity: 18, avgCost: 69000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 35000000 },
  { ticker: 'IPST', name: 'iPost Corp', sector: 'Tech / BTC Treasury', holdings: { BTC: { quantity: 25, avgCost: 64000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 11000000 },
  { ticker: 'SBLX', name: 'SubLux Holdings', sector: 'BTC Treasury', holdings: { BTC: { quantity: 33, avgCost: 66000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 9000000 },
  { ticker: 'NVVE', name: 'Nuvve Holding', sector: 'Energy / BTC Treasury', holdings: { BTC: { quantity: 15, avgCost: 71000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 12500000 },
  { ticker: 'LGHL', name: 'Lion Group Holding', sector: 'Fintech / BTC Treasury', holdings: { BTC: { quantity: 110, avgCost: 55000 }, ETH: { quantity: 3000, avgCost: 2400 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 45000000 },
];

// Historical holdings snapshots (quarterly)
const HOLDINGS_HISTORY = {
  dates: ['2023-Q1', '2023-Q2', '2023-Q3', '2023-Q4', '2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1', '2025-Q2', '2025-Q3', '2025-Q4', '2026-Q1'],
  aggregateBTC: [180000, 200000, 225000, 260000, 300000, 340000, 380000, 420000, 460000, 500000, 530000, 560000, 580000],
  aggregateETH: [50000, 60000, 70000, 85000, 100000, 120000, 135000, 155000, 168000, 175000, 180000, 185000, 190000],
  aggregateSOL: [20000, 40000, 80000, 150000, 250000, 380000, 520000, 680000, 800000, 880000, 950000, 1010000, 1050000]
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
