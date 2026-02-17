/**
 * Main Application Controller
 */

const App = {
  currentTab: 'overview',
  cryptoPrices: {},
  stockSnapshots: {},
  marketBarsData: {},
  mcapBarsData: {},
  mcapDays: 90,
  mcapIndexed: false,
  initialized: false,

  async init() {
    this.setupTabs();
    this.setupApiKey();
    this.setupExportButtons();
    this.setupTableSort();
    this.setupSearch();
    this.setupMcapPeriodPills();
    this.populateMarketSelects();

    this.cryptoPrices = { ...FALLBACK_PRICES };
    this.stockSnapshots = { ...FALLBACK_SNAPSHOTS };

    this.renderCurrentTab();
    this.initialized = true;

    const savedKey = localStorage.getItem('massive_api_key');
    if (savedKey) {
      document.getElementById('apiKeyInput').value = savedKey;
      await this.connectAPI(savedKey);
    }
  },

  // ========== TAB NAV ==========
  setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        this.currentTab = tab.dataset.tab;
        document.getElementById('tab-' + this.currentTab).classList.add('active');
        this.renderCurrentTab();
      });
    });
  },

  renderCurrentTab() {
    switch (this.currentTab) {
      case 'overview': this.renderOverview(); break;
      case 'market-data': this.renderMarketData(); break;
      case 'crypto-holdings': this.renderCryptoHoldings(); break;
      case 'bitcoin': this.renderAssetTab('BTC'); break;
      case 'ethereum': this.renderAssetTab('ETH'); break;
      case 'solana': this.renderAssetTab('SOL'); break;
    }
  },

  // ========== API KEY ==========
  setupApiKey() {
    document.getElementById('apiKeyBtn').addEventListener('click', () =>
      this.connectAPI(document.getElementById('apiKeyInput').value.trim()));
    document.getElementById('apiKeyInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.connectAPI(e.target.value.trim());
    });
  },

  async connectAPI(key) {
    if (!key) { this.showToast('Enter API key', 'error'); return; }
    const status = document.getElementById('apiStatus');
    status.textContent = 'connecting'; status.className = 'api-status';
    MassiveAPI.setApiKey(key);
    this.showLoading(true);
    try {
      if (!(await MassiveAPI.validateKey())) {
        status.textContent = 'invalid'; MassiveAPI.setApiKey(null);
        this.showToast('Invalid key', 'error'); this.showLoading(false); return;
      }
      status.textContent = 'live'; status.className = 'api-status connected';
      localStorage.setItem('massive_api_key', key);
      await this.loadLiveData();
      this.showToast('Connected', 'success');
    } catch (e) {
      status.textContent = 'error';
      this.showToast(e.message, 'error');
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
    } catch (e) { console.warn('Live data failed:', e.message); }
  },

  // ========== MCAP PERIOD PILLS ==========
  setupMcapPeriodPills() {
    const container = document.getElementById('mcapPeriodPills');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const pill = e.target.closest('.period-pill');
      if (!pill) return;
      container.querySelectorAll('.period-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      this.mcapDays = parseInt(pill.dataset.days);
      this.loadMcapChart();
    });

    // Index to 100 toggle
    const indexToggle = document.getElementById('mcapIndexToggle');
    if (indexToggle) {
      indexToggle.addEventListener('change', () => {
        this.mcapIndexed = indexToggle.checked;
        if (Object.keys(this.mcapBarsData).length > 0) {
          ChartManager.renderMcapOverTime(this.mcapBarsData, TREASURY_COMPANIES, this.mcapIndexed);
        }
      });
    }
  },

  async loadMcapChart() {
    const tickers = TREASURY_COMPANIES.map(c => c.ticker);
    if (MassiveAPI.isConnected()) {
      try {
        this.mcapBarsData = await MassiveAPI.getMultipleStockBars(tickers, this.mcapDays);
      } catch (e) {
        this._loadSimulatedMcap(tickers, this.mcapDays);
      }
    } else {
      this._loadSimulatedMcap(tickers, this.mcapDays);
    }
    ChartManager.renderMcapOverTime(this.mcapBarsData, TREASURY_COMPANIES, this.mcapIndexed);
  },

  _loadSimulatedMcap(tickers, days) {
    this.mcapBarsData = {};
    tickers.forEach(t => { this.mcapBarsData[t] = generateSimulatedBars(t, days); });
  },

  // ========== OVERVIEW ==========
  renderOverview() {
    const prices = this.cryptoPrices;
    const snapshots = this.stockSnapshots;
    const companies = TREASURY_COMPANIES;

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

    let aggMcap = 0;
    companies.forEach(c => {
      const snap = snapshots[c.ticker];
      aggMcap += (snap?.day?.c || 0) * c.sharesOutstanding;
    });
    document.getElementById('aggMarketCap').textContent = DataUtils.formatNumber(aggMcap);

    const aggNAV = DataUtils.getAggregateNAV(prices);
    document.getElementById('aggCryptoNAV').textContent = DataUtils.formatNumber(aggNAV);

    const mnav = aggNAV > 0 ? aggMcap / aggNAV : 0;
    document.getElementById('aggMNAV').textContent = mnav.toFixed(2) + 'x';
    document.getElementById('aggPremium').textContent = DataUtils.formatNumber(aggMcap - aggNAV);

    // Hero chart
    if (Object.keys(this.mcapBarsData).length === 0) {
      this.loadMcapChart();
    } else {
      ChartManager.renderMcapOverTime(this.mcapBarsData, companies, this.mcapIndexed);
    }

    ChartManager.renderOverviewMcapNav(companies, prices, snapshots);
    ChartManager.renderOverviewMnavCompany(companies, prices, snapshots);
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
        <td>${c.ticker}</td>
        <td>${c.name}</td>
        <td>${c.sector}</td>
        <td class="num">${DataUtils.formatPrice(stockPrice)}</td>
        <td class="num">${DataUtils.formatNumber(mcap)}</td>
        <td class="num">${c.holdings.BTC.quantity > 0 ? DataUtils.formatCount(c.holdings.BTC.quantity) : '-'}</td>
        <td class="num">${c.holdings.ETH.quantity > 0 ? DataUtils.formatCount(c.holdings.ETH.quantity) : '-'}</td>
        <td class="num">${c.holdings.SOL.quantity > 0 ? DataUtils.formatCount(c.holdings.SOL.quantity) : '-'}</td>
        <td class="num">${DataUtils.formatNumber(nav)}</td>
        <td class="num">${mnavVal > 0 ? mnavVal.toFixed(2) + 'x' : '--'}</td>
        <td class="num ${premiumPct >= 0 ? 'positive' : 'negative'}">${DataUtils.formatPercent(premiumPct)}</td>
        <td class="num ${change >= 0 ? 'positive' : 'negative'}">${DataUtils.formatPercent(change)}</td>`;
      tbody.appendChild(tr);
    });
  },

  // ========== MARKET DATA ==========
  populateMarketSelects() {
    const select = document.getElementById('marketCompanySelect');
    const defaults = ['MSTR', 'XXI', 'BTBT', 'DFDV', 'NAKA'];
    TREASURY_COMPANIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.ticker;
      opt.textContent = c.ticker;
      opt.selected = defaults.includes(c.ticker);
      select.appendChild(opt);
    });
    document.getElementById('marketLoadBtn').addEventListener('click', () => this.loadMarketData());
  },

  async renderMarketData() {
    if (Object.keys(this.marketBarsData).length === 0) await this.loadMarketData();
    else this.renderMarketCharts();
  },

  async loadMarketData() {
    const select = document.getElementById('marketCompanySelect');
    const tickers = Array.from(select.selectedOptions).map(o => o.value);
    const days = parseInt(document.getElementById('marketTimePeriod').value);
    if (tickers.length === 0) { this.showToast('Select companies', 'error'); return; }

    this.showLoading(true);
    if (MassiveAPI.isConnected()) {
      try { this.marketBarsData = await MassiveAPI.getMultipleStockBars(tickers, days); }
      catch { this._loadSimulatedMarket(tickers, days); }
    } else {
      this._loadSimulatedMarket(tickers, days);
    }
    this.showLoading(false);
    this.renderMarketCharts();
  },

  _loadSimulatedMarket(tickers, days) {
    this.marketBarsData = {};
    tickers.forEach(t => { this.marketBarsData[t] = generateSimulatedBars(t, days); });
  },

  renderMarketCharts() {
    ChartManager.renderMarketPrice(this.marketBarsData);
    ChartManager.renderMarketVolume(this.marketBarsData);
    ChartManager.renderMarketCap(TREASURY_COMPANIES, this.stockSnapshots);
    ChartManager.renderMarketReturns(this.marketBarsData);
  },

  // ========== CRYPTO HOLDINGS ==========
  renderCryptoHoldings() {
    const prices = this.cryptoPrices;
    const btcVal = DataUtils.getTotalHolding('BTC') * (prices.BTC || 0);
    const ethVal = DataUtils.getTotalHolding('ETH') * (prices.ETH || 0);
    const solVal = DataUtils.getTotalHolding('SOL') * (prices.SOL || 0);
    const totalNAV = btcVal + ethVal + solVal;

    document.getElementById('holdingsTotalNAV').textContent = DataUtils.formatNumber(totalNAV);
    document.getElementById('holdingsBTCDom').textContent = totalNAV > 0 ? ((btcVal / totalNAV) * 100).toFixed(1) + '%' : '--';
    document.getElementById('holdingsETHDom').textContent = totalNAV > 0 ? ((ethVal / totalNAV) * 100).toFixed(1) + '%' : '--';
    document.getElementById('holdingsSOLDom').textContent = totalNAV > 0 ? ((solVal / totalNAV) * 100).toFixed(1) + '%' : '--';

    ChartManager.renderHoldingsComposition(prices);
    ChartManager.renderHoldingsPremium(TREASURY_COMPANIES, prices, this.stockSnapshots);
    ChartManager.renderHoldingsByCompany(TREASURY_COMPANIES, prices);
    ChartManager.renderHoldingsOverTime();
  },

  // ========== ASSET TABS ==========
  renderAssetTab(asset) {
    const price = this.cryptoPrices[asset] || 0;
    const prefix = asset.toLowerCase();
    const holders = DataUtils.getCompaniesWithHolding(asset);
    const totalHeld = DataUtils.getTotalHolding(asset);

    document.getElementById(prefix + 'TotalHeld').textContent = DataUtils.formatCount(totalHeld);
    document.getElementById(prefix + 'Price').textContent = DataUtils.formatPrice(price);
    document.getElementById(prefix + 'TotalValue').textContent = DataUtils.formatNumber(totalHeld * price);
    document.getElementById(prefix + 'CompanyCount').textContent = holders.length;

    ChartManager.renderAssetHoldings(asset, TREASURY_COMPANIES, price);
    ChartManager.renderAssetDistribution(asset, TREASURY_COMPANIES);
    ChartManager.renderAssetCostBasis(asset, TREASURY_COMPANIES, price);

    if (asset === 'BTC') ChartManager.renderBtcExMstr(TREASURY_COMPANIES, price);
    else ChartManager.renderAssetOverTime(asset);

    this.renderAssetTable(asset, TREASURY_COMPANIES, price);
  },

  renderAssetTable(asset, companies, price) {
    const tbody = document.getElementById(asset.toLowerCase() + 'TableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const holders = companies.filter(c => c.holdings[asset].quantity > 0)
      .sort((a, b) => b.holdings[asset].quantity - a.holdings[asset].quantity);
    const totalHeld = holders.reduce((s, c) => s + c.holdings[asset].quantity, 0);

    holders.forEach(c => {
      const h = c.holdings[asset];
      const val = h.quantity * price;
      const cost = h.quantity * h.avgCost;
      const pl = val - cost;
      const plPct = cost > 0 ? (pl / cost) * 100 : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.ticker}</td><td>${c.name}</td>
        <td class="num">${DataUtils.formatCount(h.quantity)}</td>
        <td class="num">${DataUtils.formatPrice(h.avgCost)}</td>
        <td class="num">${DataUtils.formatNumber(cost)}</td>
        <td class="num">${DataUtils.formatNumber(val)}</td>
        <td class="num ${pl >= 0 ? 'positive' : 'negative'}">${DataUtils.formatNumber(pl)}</td>
        <td class="num ${plPct >= 0 ? 'positive' : 'negative'}">${DataUtils.formatPercent(plPct)}</td>
        <td class="num">${totalHeld > 0 ? ((h.quantity / totalHeld) * 100).toFixed(1) + '%' : '--'}</td>`;
      tbody.appendChild(tr);
    });
  },

  // ========== EXPORT ==========
  setupExportButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-export');
      if (!btn) return;
      const chartId = btn.dataset.chart;
      const type = btn.dataset.type;
      if (type === 'jpeg') ExportUtils.exportChartAsJPEG(chartId, 'treasury-' + chartId);
      else if (type === 'csv') ExportUtils.exportChartAsCSV(chartId, 'treasury-' + chartId);
    });
  },

  // ========== TABLE SORT ==========
  setupTableSort() {
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const colIndex = Array.from(th.parentNode.children).indexOf(th);
        const isNum = th.classList.contains('num');
        const isAsc = th.classList.contains('sort-asc');
        table.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(isAsc ? 'sort-desc' : 'sort-asc');
        rows.sort((a, b) => {
          let aV = a.children[colIndex]?.textContent.trim() || '';
          let bV = b.children[colIndex]?.textContent.trim() || '';
          if (isNum) { aV = parseFloat(aV.replace(/[$,%xKMBT+\-]/g, '')) || 0; bV = parseFloat(bV.replace(/[$,%xKMBT+\-]/g, '')) || 0; }
          return isAsc ? (isNum ? bV - aV : bV.toString().localeCompare(aV)) : (isNum ? aV - bV : aV.toString().localeCompare(bV));
        });
        rows.forEach(r => tbody.appendChild(r));
      });
    });
  },

  // ========== SEARCH ==========
  setupSearch() {
    const input = document.getElementById('companySearch');
    if (input) {
      input.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#companiesTableBody tr').forEach(r => {
          r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }
  },

  // ========== UI ==========
  showLoading(show) {
    document.getElementById('loading-overlay').classList.toggle('hidden', !show);
  },

  showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast ' + type;
    toast.offsetHeight;
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
