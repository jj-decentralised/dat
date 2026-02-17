/**
 * Treasury Companies Data Module
 * Holdings data sourced from public filings and disclosures.
 * Prices and holdings are preloaded snapshots; connect API for live updates.
 *
 * DATA FRESHNESS: Last updated Feb 17, 2026
 */

const DATA_LAST_UPDATED = '2026-02-17T17:00:00-05:00';

const OTHER_TOKEN_PRICES = {
  HYPE: 30.82,
  SUI: 3.60,
  BNB: 640,
  XRP: 2.45,
  BONK: 0.000012,
  INJ: 8.50,
  IP: 4.20,
  LINK: 18.00
};

const TREASURY_COMPANIES = [
  // ========== BTC Treasury Companies ==========
  { ticker: 'MSTR', name: 'Strategy (MicroStrategy)', sector: 'Software / BTC Treasury', mainCrypto: 'BTC', holdings: { BTC: { quantity: 714644, avgCost: 76056 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 500000000, fullyDiluted: 520000000, reportedCash: 46700000 },
  { ticker: 'XXI', name: 'Twenty One Capital', sector: 'BTC Treasury', mainCrypto: 'BTC', holdings: { BTC: { quantity: 43514, avgCost: 72000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 346500000, fullyDiluted: 360000000, reportedCash: 12000000 },
  { ticker: 'ASST', name: 'Strive Inc', sector: 'Asset Management / BTC Treasury', mainCrypto: 'BTC', holdings: { BTC: { quantity: 13132, avgCost: 68819 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 63100000, fullyDiluted: 68000000, reportedCash: 8500000 },
  { ticker: 'NAKA', name: 'Nakamoto Inc', sector: 'Healthcare / BTC Treasury', mainCrypto: 'BTC', holdings: { BTC: { quantity: 5398, avgCost: 82000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 160000000, fullyDiluted: 175000000, reportedCash: 3200000 },
  { ticker: 'BRR', name: 'ProCap Financial', sector: 'BTC Treasury', mainCrypto: 'BTC', holdings: { BTC: { quantity: 5000, avgCost: 73000 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 85000000, fullyDiluted: 92000000, reportedCash: 5100000 },
  { ticker: 'SQNS', name: 'Sequans Communications', sector: 'Semiconductor / BTC Treasury', mainCrypto: 'BTC', holdings: { BTC: { quantity: 2687, avgCost: 116643 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 14500000, fullyDiluted: 16000000, reportedCash: 2000000 },
  { ticker: 'LGHL', name: 'Lion Group Holding', sector: 'Fintech / Multi-Crypto', mainCrypto: 'BTC', holdings: { BTC: { quantity: 88, avgCost: 90404 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 10820, avgCost: 140 } }, sharesOutstanding: 540000, fullyDiluted: 600000, reportedCash: 450000 },

  // ========== ETH Treasury Companies ==========
  { ticker: 'BMNR', name: 'Bitmine Immersion', sector: 'ETH Treasury', mainCrypto: 'ETH', holdings: { BTC: { quantity: 193, avgCost: 54000 }, ETH: { quantity: 4285125, avgCost: 2991 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 454860000, fullyDiluted: 480000000, reportedCash: 15000000 },
  { ticker: 'SBET', name: 'Sharplink Inc', sector: 'ETH Treasury', mainCrypto: 'ETH', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 864840, avgCost: 3609 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 196690000, fullyDiluted: 210000000, reportedCash: 4200000 },
  { ticker: 'ETHM', name: 'The Ether Machine*', sector: 'ETH Treasury', mainCrypto: 'ETH', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 496712, avgCost: 3200 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 22130000, fullyDiluted: 25000000, reportedCash: 1500000 },
  { ticker: 'BTBT', name: 'Bit Digital', sector: 'ETH Treasury / AI', mainCrypto: 'ETH', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 155239, avgCost: 3045 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 324000000, fullyDiluted: 340000000, reportedCash: 22000000 },
  { ticker: 'ETHZ', name: 'ETHZilla Corp', sector: 'ETH Treasury / DeFi', mainCrypto: 'ETH', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 102326, avgCost: 2800 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 18000000, fullyDiluted: 20000000, reportedCash: 900000 },
  { ticker: 'BTCS', name: 'BTCS Inc', sector: 'Blockchain / ETH Treasury', mainCrypto: 'ETH', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 70140, avgCost: 2441 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 47500000, fullyDiluted: 52000000, reportedCash: 3100000 },
  { ticker: 'FGNX', name: 'FG Nexus', sector: 'Holding Co / ETH Treasury', mainCrypto: 'ETH', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 50000, avgCost: 2600 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 35000000, fullyDiluted: 38000000, reportedCash: 1800000 },
  { ticker: 'GAME', name: 'GameSquare Holdings', sector: 'Gaming / ETH Treasury', mainCrypto: 'ETH', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 15600, avgCost: 3519 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 98380000, fullyDiluted: 108000000, reportedCash: 6500000 },

  // ========== SOL Treasury Companies ==========
  { ticker: 'HSDT', name: 'Solana Company', sector: 'SOL Treasury', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2300000, avgCost: 135 } }, sharesOutstanding: 41300000, fullyDiluted: 45000000, reportedCash: 2800000 },
  { ticker: 'DFDV', name: 'DeFi Development Corp', sector: 'SOL Treasury', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2221329, avgCost: 108 } }, sharesOutstanding: 29890000, fullyDiluted: 33000000, reportedCash: 1900000 },
  { ticker: 'UPXI', name: 'Upexi', sector: 'SOL Treasury / Consumer', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2174583, avgCost: 151 } }, sharesOutstanding: 69760000, fullyDiluted: 75000000, reportedCash: 4500000 },
  { ticker: 'STSS', name: 'Sharps Technology', sector: 'Healthcare / SOL Treasury', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 2000000, avgCost: 145 } }, sharesOutstanding: 62000000, fullyDiluted: 68000000, reportedCash: 3200000 },
  { ticker: 'STKE', name: 'SOL Strategies', sector: 'SOL Infrastructure', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 435159, avgCost: 95 } }, sharesOutstanding: 50000000, fullyDiluted: 55000000, reportedCash: 7500000 },
  { ticker: 'FWDI', name: 'Forward Industries', sector: 'Design / SOL Treasury', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 125000, avgCost: 140 } }, sharesOutstanding: 10200000, fullyDiluted: 11500000, reportedCash: 2100000 },
  { ticker: 'SLAI', name: 'SOLAI Limited', sector: 'Mining / SOL Treasury', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 44412, avgCost: 130 } }, sharesOutstanding: 18680000, fullyDiluted: 20000000, reportedCash: 800000 },
  { ticker: 'SLMT', name: 'Solmate Infrastructure', sector: 'SOL Validator / Infra', mainCrypto: 'SOL', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 35000, avgCost: 120 } }, sharesOutstanding: 90100000, fullyDiluted: 95000000, reportedCash: 500000 },

  // ========== Other Crypto Treasury Companies ==========
  { ticker: 'PURR', name: 'Hyperliquid Strategies', sector: 'HYPE Treasury', mainCrypto: 'HYPE', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 150600000, fullyDiluted: 165000000, reportedCash: 2500000, otherHoldings: { token: 'HYPE', quantity: 17600000, avgCost: 18.60 } },
  { ticker: 'SUIG', name: 'SUI Group Holdings', sector: 'SUI Treasury', mainCrypto: 'SUI', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 127000000, fullyDiluted: 140000000, reportedCash: 3200000, otherHoldings: { token: 'SUI', quantity: 101795656, avgCost: 2.50 } },
  { ticker: 'BNC', name: 'CEA Industries', sector: 'BNB Treasury', mainCrypto: 'BNB', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 43000000, fullyDiluted: 46000000, reportedCash: 1800000, otherHoldings: { token: 'BNB', quantity: 500000, avgCost: 870 } },
  { ticker: 'HYPD', name: 'Hyperion DeFi', sector: 'HYPE Treasury', mainCrypto: 'HYPE', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 25000000, fullyDiluted: 28000000, reportedCash: 600000, otherHoldings: { token: 'HYPE', quantity: 800000, avgCost: 20.00 } },
  { ticker: 'WGRX', name: 'Wellgistics Health', sector: 'Healthcare / XRP Treasury', mainCrypto: 'Pending', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 102000000, fullyDiluted: 110000000, reportedCash: 1200000, otherHoldings: { token: 'XRP', quantity: 10000000, avgCost: 2.20 } },
  { ticker: 'VVPR', name: 'VivoPower International', sector: 'Energy / XRP Treasury', mainCrypto: 'Pending', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 12530000, fullyDiluted: 14000000, reportedCash: 800000, otherHoldings: { token: 'XRP', quantity: 5000000, avgCost: 2.10 } },
  { ticker: 'BNKK', name: 'Bonk Inc', sector: 'BONK Treasury / Beverages', mainCrypto: 'BONK', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 8000000, fullyDiluted: 9000000, reportedCash: 400000, otherHoldings: { token: 'BONK', quantity: 500000000000, avgCost: 0.000008 } },
  { ticker: 'PAPL', name: 'Pineapple Financial', sector: 'Mortgage / INJ Treasury', mainCrypto: 'INJ', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 24600000, fullyDiluted: 27000000, reportedCash: 300000, otherHoldings: { token: 'INJ', quantity: 7200000, avgCost: 5.00 } },
  { ticker: 'IPST', name: 'Heritage Distilling', sector: 'Spirits / IP Treasury', mainCrypto: 'IP', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 85000000, fullyDiluted: 92000000, reportedCash: 5500000, otherHoldings: { token: 'IP', quantity: 53200000, avgCost: 3.50 } },
  { ticker: 'SBLX', name: 'StableX Technologies*', sector: 'Stablecoin Infra', mainCrypto: 'Pending', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 1450000, fullyDiluted: 1600000, reportedCash: 200000, otherHoldings: { token: 'LINK', quantity: 100000, avgCost: 15.00 } },

  // ========== SPACs / Pre-Merger / Minimal Holdings ==========
  { ticker: 'CEPO', name: 'Cantor Equity Partners I*', sector: 'SPAC (Pre-Acquisition)', mainCrypto: 'Pending', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 20000000, fullyDiluted: 22000000, reportedCash: 0, isPending: true },
  { ticker: 'MBAV', name: 'M3-Brigade / ReserveOne', sector: 'SPAC (BTC Planned)', mainCrypto: 'Pending', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 35700000, fullyDiluted: 38000000, reportedCash: 0, isPending: true },
  { ticker: 'NVVE', name: 'Nuvve Holding', sector: 'V2G Energy / Crypto', mainCrypto: 'Pending', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 1325000, fullyDiluted: 1500000, reportedCash: 0, isPending: true },
  { ticker: 'WETO', name: 'Webus International', sector: 'TravelTech', mainCrypto: 'Pending', holdings: { BTC: { quantity: 0, avgCost: 0 }, ETH: { quantity: 0, avgCost: 0 }, SOL: { quantity: 0, avgCost: 0 } }, sharesOutstanding: 26000000, fullyDiluted: 28000000, reportedCash: 0, isPending: true },
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
    if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
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
  getActiveCompanies() {
    return TREASURY_COMPANIES.filter(c => {
      const hasBtcEthSol = ['BTC', 'ETH', 'SOL'].some(a => c.holdings[a].quantity > 0);
      const hasOther = c.otherHoldings && c.otherHoldings.quantity > 0;
      return hasBtcEthSol || hasOther;
    });
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
    // Include other holdings NAV
    if (company.otherHoldings && company.otherHoldings.quantity > 0) {
      const tokenPrice = OTHER_TOKEN_PRICES[company.otherHoldings.token] || 0;
      nav += company.otherHoldings.quantity * tokenPrice;
    }
    return nav;
  },
  getAggregateNAV(prices) {
    return TREASURY_COMPANIES.reduce((sum, c) => sum + this.getCryptoNAV(c, prices), 0);
  },
  getMainCryptoAsset(company) {
    if (company.mainCrypto) return company.mainCrypto;
    const holdings = company.holdings;
    if (holdings.BTC.quantity > 0) return 'BTC';
    if (holdings.ETH.quantity > 0) return 'ETH';
    if (holdings.SOL.quantity > 0) return 'SOL';
    if (company.otherHoldings) return company.otherHoldings.token;
    return 'Pending';
  },
  getTokenHoldingsDisplay(company) {
    const parts = [];
    if (company.holdings.BTC.quantity > 0) parts.push(this.formatCount(company.holdings.BTC.quantity) + ' BTC');
    if (company.holdings.ETH.quantity > 0) parts.push(this.formatCount(company.holdings.ETH.quantity) + ' ETH');
    if (company.holdings.SOL.quantity > 0) parts.push(this.formatCount(company.holdings.SOL.quantity) + ' SOL');
    if (company.otherHoldings && company.otherHoldings.quantity > 0) {
      parts.push(this.formatCount(company.otherHoldings.quantity) + ' ' + company.otherHoldings.token);
    }
    return parts.length > 0 ? parts.join(', ') : 'Pending';
  },
  getStockPrice(snapshot) {
    if (!snapshot) return 0;
    const dayClose = snapshot.day?.c;
    if (dayClose && dayClose > 0) return dayClose;
    // Fallback to prevDay close when market is closed
    const prevClose = snapshot.prevDay?.c;
    if (prevClose && prevClose > 0) return prevClose;
    return 0;
  },
  getDailyChange(snapshot) {
    if (!snapshot) return 0;
    // Try explicit change percent first
    if (snapshot.todaysChangePerc && snapshot.todaysChangePerc !== 0) {
      return snapshot.todaysChangePerc;
    }
    // Compute from day.c / prevDay.c
    const current = this.getStockPrice(snapshot);
    const prev = snapshot.prevDay?.c;
    if (current > 0 && prev > 0) {
      return ((current - prev) / prev) * 100;
    }
    return 0;
  },
  getDataFreshnessLabel() {
    const updated = new Date(DATA_LAST_UPDATED);
    const now = new Date();
    const hoursDiff = (now - updated) / (1000 * 60 * 60);
    if (hoursDiff < 24) return { label: 'Updated today', stale: false };
    if (hoursDiff < 72) return { label: 'Updated ' + Math.floor(hoursDiff / 24) + 'd ago', stale: false };
    return { label: 'Updated ' + updated.toLocaleDateString(), stale: true };
  },
  // Parse abbreviated values for correct sort ordering
  parseAbbreviatedValue(str) {
    if (!str || str === '--' || str === 'Pending') return 0;
    const cleaned = str.replace(/[$,+%x]/g, '').trim();
    const multipliers = { T: 1e12, B: 1e9, M: 1e6, K: 1e3 };
    const match = cleaned.match(/^(-?[\d.]+)\s*([TBMK])?$/i);
    if (match) {
      const num = parseFloat(match[1]);
      const suffix = match[2] ? match[2].toUpperCase() : '';
      return num * (multipliers[suffix] || 1);
    }
    return parseFloat(cleaned) || 0;
  },
  scopeToDays(scope) {
    const now = new Date();
    switch (scope) {
      case '1D': return 1;
      case '7D': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case 'YTD': {
        const jan1 = new Date(now.getFullYear(), 0, 1);
        return Math.ceil((now - jan1) / 86400000);
      }
      case '1Y': return 365;
      case 'ALL': return 1095;
      default: return 90;
    }
  }
};
