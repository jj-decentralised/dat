/**
 * Main Application Controller
 * Handles tab navigation, data loading, and UI updates
 */

const App = {
  currentTab: 'overview',
  cryptoPrices: {},
  stockSnapshots: {},
  marketBarsData: {},
  initialized: false,

  async init() {
    this.setupTabs();
    this.setupApiKey();
    this.setupExportButtons();
    this.setupTableSort();
    this.setupSearch();
    this.populateMarketSelects();

    // Load with fallback data first
    this.cryptoPrices = { ...FALLBACK_PRICES };
    this.stockSnapshots = { ...FALLBACK_SNAPSHOTS };

    this.renderCurrentTab();
    this.initialized = true;

    // Try loading from API if key exists in localStorage
    const savedKey = localStorage.getItem('massive_api_key');
    if (savedKey) {
      document.getElementById('apiKeyInput').value = savedKey;
      await this.connectAPI(savedKey);
    }
  },

  // ============= TAB NAVIGATION =============

  setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.getElementById('tab-' + tabId).classList.add('active');
        this.currentTab = tabId;
        this.renderCurrentTab();
      });
    });
  },

  renderCurrentTab() {
    switch (this.currentTab) {
      case 'overview':
        this.renderOverview();
        break;
      case 'market-data':
        this.renderMarketData();
        break;
      case 'crypto-holdings':
        this.renderCryptoHoldings();
        break;
      case 'bitcoin':
        this.renderAssetTab('BTC');
        break;
      case 'ethereum':
        this.renderAssetTab('ETH');
        break;
      case 'solana':
        this.renderAssetTab('SOL');
        break;
    }
  },

  // ============= API KEY =============

  setupApiKey() {
    const btn = document.getElementById('apiKeyBtn');
    const input = document.getElementById('apiKeyInput');

    btn.addEventListener('click', () => this.connectAPI(input.value.trim()));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.connectAPI(input.value.trim());
    });
  },

  async connectAPI(key) {
    if (!key) {
      this.showToast('Please enter an API key', 'error');
      return;
    }

    const status = document.getElementById('apiStatus');
    status.textContent = 'Connecting...';
    status.className = 'api-status';

    MassiveAPI.setApiKey(key);

    this.showLoading(true);
    try {
      const valid = await MassiveAPI.validateKey();
      if (!valid) {
        status.textContent = 'Invalid Key';
        status.className = 'api-status';
        MassiveAPI.setApiKey(null);
        this.showToast('Invalid API key', 'error');
        this.showLoading(false);
        return;
      }

      status.textContent = 'Connected';
      status.className = 'api-status connected';
      localStorage.setItem('massive_api_key', key);

      // Load live data
      await this.loadLiveData();
      this.showToast('Connected to Massive.com API', 'success');
    } catch (e) {
      status.textContent = 'Error';
      status.className = 'api-status';
      this.showToast('Connection failed: ' + e.message, 'error');
    }
    this.showLoading(false);
  },

  async loadLiveData() {
    try {
      const [prices, snapshots] = await Promise.all([
        MassiveAPI.getCryptoPrices(),
        MassiveAPI.getTreasurySnapshots()
      ]);

      if (prices.BTC) this.cryptoPrices.BTC = prices.BTC;
      if (prices.ETH) this.cryptoPrices.ETH = prices.ETH;
      if (prices.SOL) this.cryptoPrices.SOL = prices.SOL;

      Object.assign(this.stockSnapshots, snapshots);

      this.renderCurrentTab();
    } catch (e) {
      console.warn('Failed to load live data:', e.message);
    }
  },

  // ============= OVERVIEW TAB =============

  renderOverview() {
    const prices = this.cryptoPrices;
    const snapshots = this.stockSnapshots;
    const companies = TREASURY_COMPANIES;

    // Summary cards
    document.getElementById('totalCompanies').textContent = companies.length;

    const totalBTC = DataUtils.getTotalHolding('BTC');
    const totalETH = DataUtils.getTotalHolding('ETH');
    const totalSOL = DataUtils.getTotalHolding('SOL');

    document.getElementById('totalBTC').textContent = DataUtils.formatCount(totalBTC);
    document.getElementById('totalBTCValue').textContent = DataUtils.formatNumber(totalBTC * (prices.BTC || 0));

    document.getElementById('totalETH').textContent = DataUtils.formatCount(totalETH);
    document.getElementById('totalETHValue').textContent = DataUtils.formatNumber(totalETH * (prices.ETH || 0));

    document.getElementById('totalSOL').textContent = DataUtils.formatCount(totalSOL);
    document.getElementById('totalSOLValue').textContent = DataUtils.formatNumber(totalSOL * (prices.SOL || 0));

    // Aggregate market cap
    let aggMcap = 0;
    companies.forEach(c => {
      const snap = snapshots[c.ticker];
      const price = snap?.day?.c || 0;
      aggMcap += price * c.sharesOutstanding;
    });
    document.getElementById('aggMarketCap').textContent = DataUtils.formatNumber(aggMcap);

    // Aggregate crypto NAV
    const aggNAV = DataUtils.getAggregateNAV(prices);
    document.getElementById('aggCryptoNAV').textContent = DataUtils.formatNumber(aggNAV);

    // mNAV
    const mnav = aggNAV > 0 ? aggMcap / aggNAV : 0;
    document.getElementById('aggMNAV').textContent = mnav.toFixed(2) + 'x';

    // Premium
    const premium = aggMcap - aggNAV;
    document.getElementById('aggPremium').textContent = DataUtils.formatNumber(premium);

    // Charts
    ChartManager.renderOverviewMcapNav(companies, prices, snapshots);
    ChartManager.renderOverviewMnavCompany(companies, prices, snapshots);

    // Table
    this.renderCompaniesTable(companies, prices, snapshots);
  },

  renderCompaniesTable(companies, prices, snapshots) {
    const tbody = document.getElementById('companiesTableBody');
    tbody.innerHTML = '';

    companies.forEach(c => {
      const snap = snapshots[c.ticker];
      const stockPrice = snap?.day?.c || 0;
      const mcap = stockPrice * c.sharesOutstanding;
      const nav = DataUtils.getCryptoNAV(c, prices);
      const mnavVal = nav > 0 ? mcap / nav : 0;
      const premiumPct = nav > 0 ? ((mcap - nav) / nav) * 100 : 0;
      const change = snap?.todaysChangePerc || 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.ticker}</strong></td>
        <td>${c.name}</td>
        <td>${c.sector}</td>
        <td class="num">${DataUtils.formatPrice(stockPrice)}</td>
        <td class="num">${DataUtils.formatNumber(mcap)}</td>
        <td class="num">${DataUtils.formatCount(c.holdings.BTC.quantity)}</td>
        <td class="num">${DataUtils.formatCount(c.holdings.ETH.quantity)}</td>
        <td class="num">${DataUtils.formatCount(c.holdings.SOL.quantity)}</td>
        <td class="num">${DataUtils.formatNumber(nav)}</td>
        <td class="num">${mnavVal > 0 ? mnavVal.toFixed(2) + 'x' : '--'}</td>
        <td class="num ${premiumPct >= 0 ? 'positive' : 'negative'}">${DataUtils.formatPercent(premiumPct)}</td>
        <td class="num ${change >= 0 ? 'positive' : 'negative'}">${DataUtils.formatPercent(change)}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  // ============= MARKET DATA TAB =============

  populateMarketSelects() {
    const select = document.getElementById('marketCompanySelect');
    TREASURY_COMPANIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.ticker;
      opt.textContent = c.ticker + ' - ' + c.name;
      opt.selected = ['MSTR', 'MARA', 'RIOT', 'COIN', 'CLSK'].includes(c.ticker);
      select.appendChild(opt);
    });

    document.getElementById('marketLoadBtn').addEventListener('click', () => {
      this.loadMarketData();
    });
  },

  async renderMarketData() {
    if (Object.keys(this.marketBarsData).length === 0) {
      await this.loadMarketData();
    } else {
      this.renderMarketCharts();
    }
  },

  async loadMarketData() {
    const select = document.getElementById('marketCompanySelect');
    const selectedTickers = Array.from(select.selectedOptions).map(o => o.value);
    const days = parseInt(document.getElementById('marketTimePeriod').value);

    if (selectedTickers.length === 0) {
      this.showToast('Select at least one company', 'error');
      return;
    }

    this.showLoading(true);

    if (MassiveAPI.isConnected()) {
      try {
        this.marketBarsData = await MassiveAPI.getMultipleStockBars(selectedTickers, days);
      } catch (e) {
        console.warn('Failed to load market data from API:', e.message);
        this.loadSimulatedMarketData(selectedTickers, days);
      }
    } else {
      this.loadSimulatedMarketData(selectedTickers, days);
    }

    this.showLoading(false);
    this.renderMarketCharts();
  },

  loadSimulatedMarketData(tickers, days) {
    this.marketBarsData = {};
    tickers.forEach(ticker => {
      this.marketBarsData[ticker] = generateSimulatedBars(ticker, days);
    });
  },

  renderMarketCharts() {
    ChartManager.renderMarketPrice(this.marketBarsData);
    ChartManager.renderMarketVolume(this.marketBarsData);
    ChartManager.renderMarketCap(TREASURY_COMPANIES, this.stockSnapshots);
    ChartManager.renderMarketReturns(this.marketBarsData);
  },

  // ============= CRYPTO HOLDINGS TAB =============

  renderCryptoHoldings() {
    const prices = this.cryptoPrices;

    const totalBTCVal = DataUtils.getTotalHolding('BTC') * (prices.BTC || 0);
    const totalETHVal = DataUtils.getTotalHolding('ETH') * (prices.ETH || 0);
    const totalSOLVal = DataUtils.getTotalHolding('SOL') * (prices.SOL || 0);
    const totalNAV = totalBTCVal + totalETHVal + totalSOLVal;

    document.getElementById('holdingsTotalNAV').textContent = DataUtils.formatNumber(totalNAV);
    document.getElementById('holdingsBTCDom').textContent =
      totalNAV > 0 ? ((totalBTCVal / totalNAV) * 100).toFixed(1) + '%' : '--';
    document.getElementById('holdingsETHDom').textContent =
      totalNAV > 0 ? ((totalETHVal / totalNAV) * 100).toFixed(1) + '%' : '--';
    document.getElementById('holdingsSOLDom').textContent =
      totalNAV > 0 ? ((totalSOLVal / totalNAV) * 100).toFixed(1) + '%' : '--';

    ChartManager.renderHoldingsComposition(prices);
    ChartManager.renderHoldingsPremium(TREASURY_COMPANIES, prices, this.stockSnapshots);
    ChartManager.renderHoldingsByCompany(TREASURY_COMPANIES, prices);
    ChartManager.renderHoldingsOverTime();
  },

  // ============= ASSET-SPECIFIC TABS =============

  renderAssetTab(asset) {
    const prices = this.cryptoPrices;
    const price = prices[asset] || 0;
    const companies = TREASURY_COMPANIES;
    const prefix = asset.toLowerCase();

    const holders = DataUtils.getCompaniesWithHolding(asset);
    const totalHeld = DataUtils.getTotalHolding(asset);
    const totalValue = totalHeld * price;

    document.getElementById(prefix + 'TotalHeld').textContent = DataUtils.formatCount(totalHeld);
    document.getElementById(prefix + 'Price').textContent = DataUtils.formatPrice(price);
    document.getElementById(prefix + 'TotalValue').textContent = DataUtils.formatNumber(totalValue);
    document.getElementById(prefix + 'CompanyCount').textContent = holders.length;

    // Charts
    ChartManager.renderAssetHoldings(asset, companies, price);
    ChartManager.renderAssetDistribution(asset, companies);
    ChartManager.renderAssetCostBasis(asset, companies, price);

    if (asset === 'BTC') {
      ChartManager.renderBtcExMstr(companies, price);
    } else {
      ChartManager.renderAssetOverTime(asset);
    }

    // Table
    this.renderAssetTable(asset, companies, price);
  },

  renderAssetTable(asset, companies, price) {
    const prefix = asset.toLowerCase();
    const tbody = document.getElementById(prefix + 'TableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const holders = companies
      .filter(c => c.holdings[asset].quantity > 0)
      .sort((a, b) => b.holdings[asset].quantity - a.holdings[asset].quantity);

    const totalHeld = holders.reduce((s, c) => s + c.holdings[asset].quantity, 0);

    holders.forEach(c => {
      const h = c.holdings[asset];
      const currentValue = h.quantity * price;
      const totalCost = h.quantity * h.avgCost;
      const pl = currentValue - totalCost;
      const plPct = totalCost > 0 ? (pl / totalCost) * 100 : 0;
      const pctOfTotal = totalHeld > 0 ? (h.quantity / totalHeld) * 100 : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${c.ticker}</strong></td>
        <td>${c.name}</td>
        <td class="num">${DataUtils.formatCount(h.quantity)}</td>
        <td class="num">${DataUtils.formatPrice(h.avgCost)}</td>
        <td class="num">${DataUtils.formatNumber(totalCost)}</td>
        <td class="num">${DataUtils.formatNumber(currentValue)}</td>
        <td class="num ${pl >= 0 ? 'positive' : 'negative'}">${DataUtils.formatNumber(pl)}</td>
        <td class="num ${plPct >= 0 ? 'positive' : 'negative'}">${DataUtils.formatPercent(plPct)}</td>
        <td class="num">${pctOfTotal.toFixed(1)}%</td>
      `;
      tbody.appendChild(tr);
    });
  },

  // ============= EXPORT BUTTONS =============

  setupExportButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-export');
      if (!btn) return;

      const chartId = btn.dataset.chart;
      const type = btn.dataset.type;

      if (type === 'jpeg') {
        ExportUtils.exportChartAsJPEG(chartId, 'treasury-analytics-' + chartId);
      } else if (type === 'csv') {
        ExportUtils.exportChartAsCSV(chartId, 'treasury-analytics-' + chartId);
      }
    });
  },

  // ============= TABLE SORTING =============

  setupTableSort() {
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const sortKey = th.dataset.sort;
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        const colIndex = Array.from(th.parentNode.children).indexOf(th);
        const isNum = th.classList.contains('num');
        const isAsc = th.classList.contains('sort-asc');

        // Clear sort indicators
        table.querySelectorAll('th').forEach(h => {
          h.classList.remove('sort-asc', 'sort-desc');
        });

        th.classList.add(isAsc ? 'sort-desc' : 'sort-asc');

        rows.sort((a, b) => {
          let aVal = a.children[colIndex]?.textContent.trim() || '';
          let bVal = b.children[colIndex]?.textContent.trim() || '';

          if (isNum) {
            aVal = parseFloat(aVal.replace(/[$,%xKMBT+]/g, '')) || 0;
            bVal = parseFloat(bVal.replace(/[$,%xKMBT+]/g, '')) || 0;
          }

          if (isAsc) {
            return isNum ? bVal - aVal : bVal.toString().localeCompare(aVal.toString());
          }
          return isNum ? aVal - bVal : aVal.toString().localeCompare(bVal.toString());
        });

        rows.forEach(row => tbody.appendChild(row));
      });
    });
  },

  // ============= SEARCH =============

  setupSearch() {
    const searchInput = document.getElementById('companySearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#companiesTableBody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }
  },

  // ============= UI HELPERS =============

  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;

    // Force reflow
    toast.offsetHeight;

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
