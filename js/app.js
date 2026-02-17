/**
 * Main Application Controller
 * Dark-themed Blockworks-style Treasury Companies analytics dashboard.
 */

const App = {
  currentTab: 'overview',
  cryptoPrices: {},
  stockSnapshots: {},
  marketBarsData: {},
  navBarsData: {},
  volumeBarsData: {},
  navScope: '3M',
  volumeScope: '3M',
  volumeCumulative: false,
  sidebarOpen: true,
  initialized: false,
  errors: [],

  // ================================================================
  //  INITIALIZATION
  // ================================================================

  async init() {
    this.setupTicker();
    this.setupSidebar();
    this.setupTabs();
    this.setupApiKey();
    this.setupExportButtons();
    this.setupTableSort();
    this.setupSearch();
    this.setupTimeScopeControls();
    this.setupVolumeControls();
    this.setupTableControls();
    this.setupColumnToggle();
    this.populateMarketSelects();
    this.setupTabScrollArrows();

    // Load fallback data
    this.cryptoPrices = { ...FALLBACK_PRICES };
    this.stockSnapshots = { ...FALLBACK_SNAPSHOTS };

    this.renderCurrentTab();
    this.initialized = true;

    // Auto-connect if saved API key exists in sessionStorage
    const savedKey = sessionStorage.getItem('massive_api_key');
    if (savedKey) {
      document.getElementById('apiKeyInput').value = savedKey;
      await this.connectAPI(savedKey);
    }
  },

  // ================================================================
  //  TICKER BAR (Marquee)
  // ================================================================

  setupTicker() {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    // Group A: Crypto prices
    const cryptoItems = [
      { name: 'Bitcoin', symbol: 'BTC', price: '$68,418', cssClass: 'btc', letter: 'B' },
      { name: 'Ethereum', symbol: 'ETH', price: '$1,988.68', cssClass: 'eth', letter: 'E' },
      { name: 'Solana', symbol: 'SOL', price: '$86.35', cssClass: 'sol', letter: 'S' },
      { name: 'Hyperliquid', symbol: 'HYPE', price: '$30.82', cssClass: 'hype', letter: 'H' }
    ];

    // Group B: Aggregate stats
    const statItems = [
      { label: '24hr Spot DEX Volume', value: '$6.03B', change: '-0.75%', negative: true },
      { label: '24hr App Revenue', value: '$11.81M', change: '-0.01%', negative: true },
      { label: '24hr Blockchain REV', value: '$229.96M', change: '+12.99%', negative: false },
      { label: 'Stablecoin Supply', value: '$307.48B', change: '', negative: false },
      { label: '7d DAT Flows', value: '$323.14M', change: '-0.65%', negative: true },
      { label: '5d ETF Flows', value: '-$339.9M', change: '-0.05%', negative: true }
    ];

    const buildItems = () => {
      let html = '';
      cryptoItems.forEach(c => {
        html += `<div class="ticker-item">` +
          `<span class="ticker-coin-icon ${c.cssClass}">${c.letter}</span>` +
          `<span class="ticker-name">${c.name}</span>` +
          `<span class="ticker-price">${c.price}</span>` +
          `</div>`;
      });
      statItems.forEach(s => {
        const changeHtml = s.change
          ? `<span class="ticker-change ${s.negative ? 'negative' : 'positive'}">${s.change}</span>`
          : '';
        html += `<div class="ticker-item">` +
          `<span class="ticker-label">${s.label}</span>` +
          `<span class="ticker-stat-value">${s.value}</span>` +
          changeHtml +
          `</div>`;
      });
      return html;
    };

    // Duplicate content so the marquee loops seamlessly
    const content = buildItems();
    track.innerHTML = content + content;
  },

  // ================================================================
  //  SIDEBAR
  // ================================================================

  setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const nav = document.getElementById('sidebarNav');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeBtn = document.getElementById('sidebarClose');
    const searchInput = document.getElementById('sidebarSearch');

    if (!nav) return;

    // Define sidebar sections
    const sections = [
      {
        title: 'Markets',
        items: ['Treasury Companies', 'Crypto ETFs', 'Funding and M&A', 'Revenue Leaderboard']
      },
      {
        title: 'Sectors',
        items: ['App Comparison', 'Centralized Exchanges', 'DeFi Lending', 'DEX Aggregators', 'Liquid Staking', 'NFT Marketplaces', 'Perpetual DEXs', 'Stablecoins']
      },
      {
        title: 'Treasury Companies',
        items: ['Bitmine', 'SharpLink', 'Forward Industries']
      },
      {
        title: 'Layer 1',
        items: ['Aptos', 'Avalanche', 'Bitcoin', 'BNB Chain', 'Cardano', 'Cosmos', 'Ethereum', 'Fantom', 'Hedera', 'NEAR', 'Polkadot', 'Polygon', 'Solana', 'Sui', 'Tezos', 'Tron', 'Zcash']
      },
      {
        title: 'Layer 2',
        items: ['Arbitrum', 'Base', 'Blast', 'Linea', 'Mantle', 'Optimism', 'Scroll', 'Starknet', 'ZKsync Era']
      },
      {
        title: 'Finance',
        items: ['Aave', 'Compound', 'Curve', 'dYdX', 'Euler', 'GMX', 'Lido', 'MakerDAO', 'Morpho', 'Pendle', 'Spark']
      },
      {
        title: 'Consumer',
        items: ['Axiom', 'ENS', 'Friend.tech', 'Lens', 'Polymarket', 'Pump.fun', 'Raydium', 'Uniswap', 'Zora']
      },
      {
        title: 'DePIN',
        items: ['GEODNET', 'Helium']
      },
      {
        title: 'Chain Clusters',
        items: []
      },
      {
        title: 'ETFs',
        items: []
      }
    ];

    nav.innerHTML = '';
    sections.forEach((section, idx) => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'sidebar-section' + (idx === 0 ? ' open' : '');

      const header = document.createElement('div');
      header.className = 'sidebar-section-header';
      header.innerHTML = `<span>${section.title}</span><span class="arrow">&#9656;</span>`;
      header.addEventListener('click', () => {
        sectionEl.classList.toggle('open');
      });

      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'sidebar-section-items';

      section.items.forEach(item => {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'sidebar-link';
        link.textContent = item;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          nav.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
        itemsContainer.appendChild(link);
      });

      sectionEl.appendChild(header);
      sectionEl.appendChild(itemsContainer);
      nav.appendChild(sectionEl);
    });

    // Mark "Treasury Companies" in Markets as active by default
    const firstLink = nav.querySelector('.sidebar-link');
    if (firstLink) firstLink.classList.add('active');

    // Hamburger toggle
    const content = document.getElementById('mainContent');
    const footer = document.querySelector('.site-footer');
    const updateLayout = () => {
      const collapsed = sidebar.classList.contains('collapsed');
      this.sidebarOpen = !collapsed;
      if (content) content.style.marginLeft = collapsed ? '0' : '';
      if (footer) footer.style.marginLeft = collapsed ? '0' : '';
    };

    if (hamburgerBtn && sidebar) {
      hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        updateLayout();
      });
    }

    // Close button
    if (closeBtn && sidebar) {
      closeBtn.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
        updateLayout();
      });
    }

    // Sidebar search filter
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        nav.querySelectorAll('.sidebar-link').forEach(link => {
          const match = link.textContent.toLowerCase().includes(q);
          link.style.display = match ? '' : 'none';
        });
        // Show sections that have visible items
        nav.querySelectorAll('.sidebar-section').forEach(section => {
          const visibleItems = section.querySelectorAll('.sidebar-link:not([style*="display: none"])');
          if (q && visibleItems.length > 0) {
            section.classList.add('open');
          }
        });
      });
    }
  },

  // ================================================================
  //  TABS
  // ================================================================

  setupTabs() {
    const tabs = document.querySelectorAll('.sub-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');

      tab.addEventListener('click', () => {
        // Deactivate all tabs
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        // Hide all panels
        panels.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('role', 'tabpanel');
        });

        // Activate clicked tab
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        this.currentTab = tab.dataset.tab;

        // Show corresponding panel
        const panel = document.getElementById('tab-' + this.currentTab);
        if (panel) {
          panel.classList.add('active');
          panel.setAttribute('role', 'tabpanel');
        }

        this.renderCurrentTab();
      });
    });

    // Set role on initial panels
    panels.forEach(p => p.setAttribute('role', 'tabpanel'));
  },

  setupTabScrollArrows() {
    const leftBtn = document.getElementById('tabScrollLeft');
    const rightBtn = document.getElementById('tabScrollRight');
    const tabsContainer = document.querySelector('.sub-tabs');

    if (leftBtn && tabsContainer) {
      leftBtn.addEventListener('click', () => {
        tabsContainer.scrollBy({ left: -150, behavior: 'smooth' });
      });
    }

    if (rightBtn && tabsContainer) {
      rightBtn.addEventListener('click', () => {
        tabsContainer.scrollBy({ left: 150, behavior: 'smooth' });
      });
    }
  },

  // ================================================================
  //  API KEY
  // ================================================================

  setupApiKey() {
    const toggleBtn = document.getElementById('apiToggleBtn');
    const section = document.getElementById('apiKeySection');
    if (toggleBtn && section) {
      toggleBtn.addEventListener('click', () => section.classList.toggle('hidden'));
    }

    const connectBtn = document.getElementById('apiKeyBtn');
    if (connectBtn) {
      connectBtn.addEventListener('click', () =>
        this.connectAPI(document.getElementById('apiKeyInput').value.trim()));
    }

    const input = document.getElementById('apiKeyInput');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.connectAPI(e.target.value.trim());
      });
    }
  },

  async connectAPI(key) {
    if (!key) { this.showToast('Enter API key', 'error'); return; }

    const status = document.getElementById('apiStatus');
    status.textContent = 'CONNECTING';
    status.className = 'api-badge';

    MassiveAPI.setApiKey(key);
    this.showLoading(true);

    try {
      if (!(await MassiveAPI.validateKey())) {
        status.textContent = 'INVALID';
        status.className = 'api-badge error';
        MassiveAPI.setApiKey(null);
        this.showToast('Invalid API key', 'error');
        this.showLoading(false);
        return;
      }

      // Store in sessionStorage (NOT localStorage)
      sessionStorage.setItem('massive_api_key', key);
      document.getElementById('apiKeySection').classList.add('hidden');

      await this.loadLiveData();

      // Determine final status - check for partial failures
      if (this.errors.length > 0) {
        status.textContent = 'PARTIAL';
        status.className = 'api-badge simulated';
        this.showErrorBanner('Live data partially loaded. Some feeds failed: ' + this.errors.join('; '));
      } else {
        status.textContent = 'LIVE';
        status.className = 'api-badge connected';
        this.showToast('Connected to live data', 'success');
      }
    } catch (e) {
      status.textContent = 'ERROR';
      status.className = 'api-badge error';
      this.showToast(e.message, 'error');
    }

    this.showLoading(false);
  },

  async loadLiveData() {
    this.errors = [];
    let cryptoOk = true;
    let stocksOk = true;

    // Load crypto prices
    try {
      const prices = await MassiveAPI.getCryptoPrices();
      if (prices.BTC) this.cryptoPrices.BTC = prices.BTC;
      if (prices.ETH) this.cryptoPrices.ETH = prices.ETH;
      if (prices.SOL) this.cryptoPrices.SOL = prices.SOL;
      // Check if any came back null
      if (!prices.BTC && !prices.ETH && !prices.SOL) {
        cryptoOk = false;
        this.errors.push('Crypto prices unavailable');
      }
    } catch (e) {
      cryptoOk = false;
      this.errors.push('Crypto prices failed: ' + e.message);
    }

    // Load stock snapshots
    try {
      const snapshots = await MassiveAPI.getTreasurySnapshots();
      // CRITICAL: Only overwrite entries where the API returned a valid price
      Object.entries(snapshots).forEach(([ticker, snap]) => {
        const livePrice = DataUtils.getStockPrice(snap);
        if (livePrice > 0) {
          this.stockSnapshots[ticker] = snap;
        }
      });
    } catch (e) {
      stocksOk = false;
      this.errors.push('Stock snapshots failed: ' + e.message);
    }

    // Show error banner for partial failures
    if (stocksOk && !cryptoOk) {
      this.showErrorBanner('Stock data loaded but crypto prices failed. Using fallback crypto prices.');
    } else if (!stocksOk && cryptoOk) {
      this.showErrorBanner('Crypto prices loaded but stock snapshots failed. Using fallback stock data.');
    }

    this.renderCurrentTab();
  },

  // ================================================================
  //  TIME SCOPE CONTROLS (NAV Chart)
  // ================================================================

  setupTimeScopeControls() {
    // NAV scope buttons
    const navScopeBar = document.getElementById('navTimeScopeBar');
    if (navScopeBar) {
      navScopeBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.scope-btn');
        if (!btn) return;
        navScopeBar.querySelectorAll('.scope-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.navScope = btn.dataset.scope;
        this.loadNavChart();
      });
    }

    // NAV interval pills
    const navIntervalPills = document.getElementById('navIntervalPills');
    if (navIntervalPills) {
      navIntervalPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.interval-pill');
        if (!pill) return;
        navIntervalPills.querySelectorAll('.interval-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.loadNavChart();
      });
    }

    // NAV date range inputs
    const dateFrom = document.getElementById('navDateFrom');
    const dateTo = document.getElementById('navDateTo');
    if (dateFrom && dateTo) {
      const handleDateChange = () => {
        if (dateFrom.value && dateTo.value) {
          // Clear active scope when custom date is used
          const navScopeBar2 = document.getElementById('navTimeScopeBar');
          if (navScopeBar2) {
            navScopeBar2.querySelectorAll('.scope-btn').forEach(b => b.classList.remove('active'));
          }
          this.loadNavChart();
        }
      };
      dateFrom.addEventListener('change', handleDateChange);
      dateTo.addEventListener('change', handleDateChange);
    }

    // NAV compare toggle
    const compareToggle = document.getElementById('navCompareToggle');
    if (compareToggle) {
      compareToggle.addEventListener('change', () => {
        this.loadNavChart();
      });
    }
  },

  // ================================================================
  //  VOLUME CONTROLS
  // ================================================================

  setupVolumeControls() {
    // Volume scope buttons
    const volumeScopeBar = document.getElementById('volumeTimeScopeBar');
    if (volumeScopeBar) {
      volumeScopeBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.scope-btn');
        if (!btn) return;
        volumeScopeBar.querySelectorAll('.scope-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.volumeScope = btn.dataset.scope;
        this.loadVolumeChart();
      });
    }

    // Volume interval pills
    const volumeIntervalPills = document.getElementById('volumeIntervalPills');
    if (volumeIntervalPills) {
      volumeIntervalPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.interval-pill');
        if (!pill) return;
        volumeIntervalPills.querySelectorAll('.interval-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.loadVolumeChart();
      });
    }

    // Volume stack/cumulative pills
    const volumeStackPills = document.getElementById('volumeStackPills');
    if (volumeStackPills) {
      volumeStackPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.stack-pill');
        if (!pill) return;
        volumeStackPills.querySelectorAll('.stack-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.volumeCumulative = pill.dataset.stack === 'cumulative';
        this.loadVolumeChart();
      });
    }
  },

  // ================================================================
  //  TABLE CONTROLS
  // ================================================================

  setupTableControls() {
    // Price change period selector
    const priceChangePeriod = document.getElementById('priceChangePeriod');
    if (priceChangePeriod) {
      priceChangePeriod.addEventListener('change', () => {
        const val = priceChangePeriod.value;
        const header = document.getElementById('priceChangeHeader');
        if (header) {
          const labels = { '1': '1d Price', '5': '5d Price', '7': '7d Price', '30': '30d Price', '90': '90d Price', 'ytd': 'YTD Price' };
          header.textContent = labels[val] || val + 'd Price';
        }
        // Re-render table with updated period
        this.renderCompaniesTable(TREASURY_COMPANIES, this.cryptoPrices, this.stockSnapshots);
      });
    }

    // Table sort scope selector
    const tableSortScope = document.getElementById('tableSortScope');
    if (tableSortScope) {
      tableSortScope.addEventListener('change', () => {
        this.renderCompaniesTable(TREASURY_COMPANIES, this.cryptoPrices, this.stockSnapshots);
      });
    }

    // Table parameter pills (Overview / mNAV / Market Data)
    const tableParamPills = document.getElementById('tableParamPills');
    if (tableParamPills) {
      tableParamPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.param-pill');
        if (!pill) return;
        tableParamPills.querySelectorAll('.param-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this._applyTableParamMode(pill.dataset.param);
      });
    }
  },

  _applyTableParamMode(mode) {
    const table = document.getElementById('companiesTable');
    if (!table) return;

    const headers = table.querySelectorAll('thead th');
    // Column indices by data-sort attribute
    const columnMap = {};
    headers.forEach((th, i) => { columnMap[th.dataset.sort] = i; });

    // Define which columns are visible in each mode
    const modeColumns = {
      overview: ['rank', 'name', 'ticker', 'crypto', 'price', 'priceChange', 'volume', 'nav', 'tokens', 'marketCap', 'oMnav', 'fdMnav', 'cash', 'sparkline'],
      mnav: ['rank', 'name', 'ticker', 'crypto', 'price', 'nav', 'marketCap', 'oMnav', 'fdMnav', 'sparkline'],
      market: ['rank', 'name', 'ticker', 'price', 'priceChange', 'volume', 'marketCap', 'cash']
    };

    const visibleCols = new Set(modeColumns[mode] || modeColumns.overview);

    headers.forEach((th, i) => {
      const key = th.dataset.sort;
      const show = visibleCols.has(key);
      th.style.display = show ? '' : 'none';
    });

    // Also hide/show corresponding cells in tbody
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      Array.from(row.children).forEach((td, i) => {
        const headerKey = headers[i]?.dataset.sort;
        td.style.display = visibleCols.has(headerKey) ? '' : 'none';
      });
    });
  },

  // ================================================================
  //  COLUMN TOGGLE
  // ================================================================

  setupColumnToggle() {
    const columnsBtn = document.getElementById('columnsBtn');
    const popover = document.getElementById('columnsPopover');
    const columnsList = document.getElementById('columnsList');

    if (!columnsBtn || !popover || !columnsList) return;

    columnsBtn.addEventListener('click', () => {
      popover.classList.toggle('hidden');

      // Build checkboxes if not already populated
      if (columnsList.children.length === 0) {
        const table = document.getElementById('companiesTable');
        if (!table) return;
        const headers = table.querySelectorAll('thead th');
        headers.forEach((th, i) => {
          const label = document.createElement('label');
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = th.style.display !== 'none';
          cb.dataset.colIndex = i;
          cb.addEventListener('change', () => {
            const display = cb.checked ? '' : 'none';
            th.style.display = display;
            table.querySelectorAll('tbody tr').forEach(row => {
              if (row.children[i]) row.children[i].style.display = display;
            });
          });
          label.appendChild(cb);
          label.appendChild(document.createTextNode(' ' + th.textContent.trim()));
          columnsList.appendChild(label);
        });
      }
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && e.target !== columnsBtn) {
        popover.classList.add('hidden');
      }
    });
  },

  // ================================================================
  //  RENDER CURRENT TAB
  // ================================================================

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

  // ================================================================
  //  OVERVIEW TAB
  // ================================================================

  renderOverview() {
    const prices = this.cryptoPrices;
    const snapshots = this.stockSnapshots;
    const companies = TREASURY_COMPANIES;

    // Companies count: active / total
    const activeCount = DataUtils.getActiveCompanies().length;
    const totalCompaniesEl = document.getElementById('totalCompanies');
    if (totalCompaniesEl) {
      totalCompaniesEl.textContent = activeCount + ' / ' + companies.length;
    }

    const totalBTC = DataUtils.getTotalHolding('BTC');
    const totalETH = DataUtils.getTotalHolding('ETH');
    const totalSOL = DataUtils.getTotalHolding('SOL');

    const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    setEl('totalBTC', DataUtils.formatCount(totalBTC));
    setEl('totalBTCValue', DataUtils.formatNumber(totalBTC * (prices.BTC || 0)));
    setEl('totalETH', DataUtils.formatCount(totalETH));
    setEl('totalETHValue', DataUtils.formatNumber(totalETH * (prices.ETH || 0)));
    setEl('totalSOL', DataUtils.formatCount(totalSOL));
    setEl('totalSOLValue', DataUtils.formatNumber(totalSOL * (prices.SOL || 0)));

    // Aggregate market cap using DataUtils.getStockPrice for each snapshot
    let aggMcap = 0;
    companies.forEach(c => {
      const snap = snapshots[c.ticker];
      const stockPrice = DataUtils.getStockPrice(snap);
      aggMcap += stockPrice * c.sharesOutstanding;
    });
    setEl('aggMarketCap', DataUtils.formatNumber(aggMcap));

    const aggNAV = DataUtils.getAggregateNAV(prices);
    setEl('aggCryptoNAV', DataUtils.formatNumber(aggNAV));

    const mnav = aggNAV > 0 ? aggMcap / aggNAV : 0;
    setEl('aggMNAV', mnav.toFixed(2) + 'x');

    const premium = aggNAV > 0 ? ((aggMcap - aggNAV) / aggNAV) * 100 : 0;
    const premiumEl = document.getElementById('aggPremium');
    if (premiumEl) {
      premiumEl.textContent = DataUtils.formatPercent(premium);
      premiumEl.className = 'metric-value ' + (premium >= 0 ? 'positive' : 'negative');
    }

    // Load charts
    this.loadNavChart();
    this.loadVolumeChart();

    ChartManager.renderOverviewMcapNav(companies, prices, snapshots);
    ChartManager.renderOverviewMnavCompany(companies, prices, snapshots);

    // Render companies table
    this.renderCompaniesTable(companies, prices, snapshots);

    // Render heatmap
    this.renderHeatmap();
  },

  // ================================================================
  //  COMPANIES TABLE (14 columns)
  // ================================================================

  renderCompaniesTable(companies, prices, snapshots) {
    const tbody = document.getElementById('companiesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Build sorted list with computed data
    const tableData = companies.map(c => {
      const snap = snapshots[c.ticker];
      const stockPrice = DataUtils.getStockPrice(snap);
      const nav = DataUtils.getCryptoNAV(c, prices);
      const mcap = stockPrice * c.sharesOutstanding;
      const fdMcap = stockPrice * c.fullyDiluted;
      const oMnav = nav > 0 ? mcap / nav : 0;
      const fdMnav = nav > 0 ? fdMcap / nav : 0;
      const dailyChange = DataUtils.getDailyChange(snap);
      const volume = snap?.day?.v || 0;
      return { company: c, stockPrice, nav, mcap, fdMcap, oMnav, fdMnav, dailyChange, volume, snap };
    });

    // Apply sort scope
    const sortScope = document.getElementById('tableSortScope')?.value || 'nav';
    switch (sortScope) {
      case 'nav':
        tableData.sort((a, b) => b.nav - a.nav);
        break;
      case 'best-30d':
      case 'best-7d':
        // Sort by daily change as proxy (simulated)
        tableData.sort((a, b) => b.dailyChange - a.dailyChange);
        break;
      case 'volume-week':
        tableData.sort((a, b) => b.volume - a.volume);
        break;
      default:
        tableData.sort((a, b) => b.nav - a.nav);
    }

    tableData.forEach((d, idx) => {
      const c = d.company;
      const tr = document.createElement('tr');

      // NAV ranking
      const rank = idx + 1;

      // Main crypto label
      const cryptoLabel = DataUtils.getMainCryptoAsset(c);

      // Token holdings display
      const tokenDisplay = c.isPending ? '<span class="pending">Pending</span>' : DataUtils.getTokenHoldingsDisplay(c);

      // Price change - use dailyChange for now (placeholder for selected period)
      const changeVal = d.dailyChange;
      const changeCls = changeVal >= 0 ? 'positive' : 'negative';

      // Sparkline canvas placeholder
      const sparkId = 'spark-' + c.ticker;

      // Outstanding mNAV
      const oMnavDisplay = d.oMnav > 0 ? d.oMnav.toFixed(2) + 'x' : '--';

      // Fully diluted mNAV
      const fdMnavDisplay = d.fdMnav > 0 ? d.fdMnav.toFixed(2) + 'x' : '--';

      // Cash
      const cashDisplay = c.reportedCash > 0 ? DataUtils.formatNumber(c.reportedCash) : '--';

      // Price display
      const priceDisplay = c.isPending && d.stockPrice === 0 ? '<span class="pending">Pending</span>' : DataUtils.formatPrice(d.stockPrice);

      tr.innerHTML =
        `<td class="num">${rank}</td>` +
        `<td>${c.name}</td>` +
        `<td>${c.ticker}</td>` +
        `<td>${cryptoLabel}</td>` +
        `<td class="num">${priceDisplay}</td>` +
        `<td class="num ${changeCls}">${DataUtils.formatPercent(changeVal)}</td>` +
        `<td class="num">${d.volume > 0 ? DataUtils.formatCount(d.volume) : '--'}</td>` +
        `<td class="num">${d.nav > 0 ? DataUtils.formatNumber(d.nav) : (c.isPending ? '<span class="pending">Pending</span>' : '--')}</td>` +
        `<td class="num">${tokenDisplay}</td>` +
        `<td class="num">${d.mcap > 0 ? DataUtils.formatNumber(d.mcap) : '--'}</td>` +
        `<td class="num">${oMnavDisplay}</td>` +
        `<td class="num">${fdMnavDisplay}</td>` +
        `<td class="num">${cashDisplay}</td>` +
        `<td class="num"><span class="sparkline-cell"><canvas id="${sparkId}" width="60" height="20"></canvas></span></td>`;

      tbody.appendChild(tr);
    });

    // Draw sparklines after DOM insertion
    tableData.forEach(d => {
      this._drawSparkline(d.company.ticker, d.nav);
    });

    // Data freshness indicator
    this._renderDataFreshness();

    // Update pagination info
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
      paginationInfo.textContent = '1 - ' + tableData.length + ' of ' + tableData.length;
    }
  },

  _drawSparkline(ticker, currentNav) {
    const canvas = document.getElementById('spark-' + ticker);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate simulated NAV trend data (8 points)
    const points = [];
    let val = currentNav * (0.7 + Math.random() * 0.2);
    const step = (currentNav - val) / 7;
    for (let i = 0; i < 8; i++) {
      points.push(val);
      val += step + (Math.random() - 0.5) * step * 0.5;
    }
    // Ensure last point is near current NAV
    points[7] = currentNav;

    if (currentNav <= 0) return;

    const w = 60;
    const h = 20;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const isUp = points[7] >= points[0];
    ctx.strokeStyle = isUp ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 2) - 1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  },

  _renderDataFreshness() {
    // Remove existing freshness indicator
    const existing = document.querySelector('.data-freshness');
    if (existing) existing.remove();

    const freshness = DataUtils.getDataFreshnessLabel();
    const tableCard = document.getElementById('companiesTable')?.closest('.chart-card');
    if (!tableCard) return;

    const div = document.createElement('div');
    div.className = 'data-freshness';
    div.innerHTML =
      `<span class="freshness-dot${freshness.stale ? ' stale' : ''}"></span>` +
      `<span>${freshness.label}</span>` +
      (MassiveAPI.isConnected() ? '<span> | Live data connected</span>' : '<span> | Using preloaded data</span>');
    tableCard.appendChild(div);
  },

  // ================================================================
  //  HEATMAP
  // ================================================================

  renderHeatmap() {
    const container = document.getElementById('heatmapContainer');
    if (!container) return;

    const prices = this.cryptoPrices;

    // Top 15 companies by NAV
    const ranked = TREASURY_COMPANIES
      .map(c => ({ company: c, nav: DataUtils.getCryptoNAV(c, prices) }))
      .filter(d => d.nav > 0)
      .sort((a, b) => b.nav - a.nav)
      .slice(0, 15);

    // Check heatmap bucket setting
    const bucketSelect = document.getElementById('heatmapBucket');
    const bucket = bucketSelect ? bucketSelect.value : 'week';
    const numCols = 8;

    // Generate column labels
    const colLabels = [];
    const now = new Date();
    for (let i = numCols - 1; i >= 0; i--) {
      if (bucket === 'week') {
        const d = new Date(now.getTime() - i * 7 * 86400000);
        colLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        colLabels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      }
    }

    // Build table
    let html = '<table class="heatmap-table"><thead><tr><th>Company</th>';
    colLabels.forEach(label => { html += `<th>${label}</th>`; });
    html += '</tr></thead><tbody>';

    ranked.forEach(d => {
      html += `<tr><td style="text-align:left;color:var(--text-secondary);font-weight:600;">${d.company.ticker}</td>`;
      for (let j = 0; j < numCols; j++) {
        // Simulated % change data seeded by ticker and column index
        const seed = d.company.ticker.charCodeAt(0) + j * 7;
        const change = ((Math.sin(seed) * 15) + (Math.cos(seed * 0.7) * 8)).toFixed(1);
        const val = parseFloat(change);
        const color = this._heatmapColor(val);
        html += `<td class="heatmap-cell" style="background:${color};color:#fff;">${val > 0 ? '+' : ''}${val}%</td>`;
      }
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Wire heatmap controls
    if (bucketSelect && !bucketSelect._wired) {
      bucketSelect._wired = true;
      bucketSelect.addEventListener('change', () => this.renderHeatmap());
    }
    const metricSelect = document.getElementById('heatmapMetric');
    if (metricSelect && !metricSelect._wired) {
      metricSelect._wired = true;
      metricSelect.addEventListener('change', () => this.renderHeatmap());
    }
  },

  _heatmapColor(value) {
    // Red (negative) through neutral to green (positive)
    if (value > 10) return 'rgba(34, 197, 94, 0.85)';
    if (value > 5) return 'rgba(34, 197, 94, 0.55)';
    if (value > 0) return 'rgba(34, 197, 94, 0.25)';
    if (value === 0) return 'rgba(107, 114, 128, 0.3)';
    if (value > -5) return 'rgba(239, 68, 68, 0.25)';
    if (value > -10) return 'rgba(239, 68, 68, 0.55)';
    return 'rgba(239, 68, 68, 0.85)';
  },

  // ================================================================
  //  NAV CHART
  // ================================================================

  async loadNavChart() {
    const days = DataUtils.scopeToDays(this.navScope);
    const tickers = TREASURY_COMPANIES.map(c => c.ticker);
    let isSimulated = false;

    if (MassiveAPI.isConnected()) {
      try {
        this.navBarsData = await MassiveAPI.getMultipleStockBars(tickers, days);
      } catch (e) {
        this._loadSimulatedBars('navBarsData', tickers, days);
        isSimulated = true;
      }
    } else {
      this._loadSimulatedBars('navBarsData', tickers, days);
      isSimulated = true;
    }

    // Show/hide simulated banner
    this._toggleSimulatedBanner('chart-navChart', isSimulated);

    // Render NAV chart as MCapOverTime
    ChartManager.renderMcapOverTime(this.navBarsData, TREASURY_COMPANIES, false);
  },

  // ================================================================
  //  VOLUME CHART
  // ================================================================

  async loadVolumeChart() {
    const days = DataUtils.scopeToDays(this.volumeScope);
    const tickers = TREASURY_COMPANIES.map(c => c.ticker);
    let isSimulated = false;

    if (MassiveAPI.isConnected()) {
      try {
        this.volumeBarsData = await MassiveAPI.getMultipleStockBars(tickers, days);
      } catch (e) {
        this._loadSimulatedBars('volumeBarsData', tickers, days);
        isSimulated = true;
      }
    } else {
      this._loadSimulatedBars('volumeBarsData', tickers, days);
      isSimulated = true;
    }

    this._toggleSimulatedBanner('chart-volumeChart', isSimulated);
    this._renderVolumeChart();
  },

  _renderVolumeChart() {
    const chartId = 'volumeChart';
    ChartManager.destroy(chartId);

    const canvas = document.getElementById('chart-' + chartId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Aggregate volume across all tickers per date
    const dateVolMap = {};
    Object.values(this.volumeBarsData).forEach(bars => {
      bars.forEach(bar => {
        const dateKey = new Date(bar.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateVolMap[dateKey] = (dateVolMap[dateKey] || 0) + (bar.v || 0);
      });
    });

    const labels = Object.keys(dateVolMap);
    let data = Object.values(dateVolMap);

    // Cumulative mode
    if (this.volumeCumulative) {
      let cumulative = 0;
      data = data.map(v => { cumulative += v; return cumulative; });
    }

    ChartManager.charts[chartId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: this.volumeCumulative ? 'Cumulative Volume' : 'Daily Aggregate Volume',
          data,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: '#6366f1',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#1a1d23',
            bodyColor: '#5c6370',
            borderColor: '#e2e5e9',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => 'Volume: ' + DataUtils.formatCount(ctx.raw)
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#8b929e', maxTicksLimit: 12, font: { size: 10 } },
            grid: { color: 'rgba(226, 229, 233, 0.6)', drawBorder: false }
          },
          y: {
            ticks: {
              color: '#8b929e',
              font: { size: 10 },
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.6)', drawBorder: false }
          }
        }
      }
    });
  },

  // ================================================================
  //  SIMULATED DATA HELPERS
  // ================================================================

  _loadSimulatedBars(prop, tickers, days) {
    this[prop] = {};
    tickers.forEach(t => { this[prop][t] = generateSimulatedBars(t, days); });
  },

  _toggleSimulatedBanner(canvasId, show) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const container = canvas.closest('.chart-card');
    if (!container) return;

    let banner = container.querySelector('.simulated-banner');
    if (show) {
      if (!banner) {
        banner = document.createElement('div');
        banner.className = 'simulated-banner';
        banner.textContent = 'Displaying simulated data. Connect API for live charts.';
        const chartContainer = container.querySelector('.chart-container');
        if (chartContainer) container.insertBefore(banner, chartContainer);
      }
    } else if (banner) {
      banner.remove();
    }
  },

  // ================================================================
  //  MARKET DATA TAB
  // ================================================================

  populateMarketSelects() {
    const select = document.getElementById('marketCompanySelect');
    if (!select) return;
    const defaults = ['MSTR', 'BMNR', 'SBET', 'DFDV', 'HSDT'];
    TREASURY_COMPANIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.ticker;
      opt.textContent = c.ticker + ' - ' + c.name;
      opt.selected = defaults.includes(c.ticker);
      select.appendChild(opt);
    });
    const loadBtn = document.getElementById('marketLoadBtn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.loadMarketData());
    }
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
    if (!select) return;
    const tickers = Array.from(select.selectedOptions).map(o => o.value);
    const days = parseInt(document.getElementById('marketTimePeriod')?.value || '30');
    if (tickers.length === 0) { this.showToast('Select at least one company', 'error'); return; }

    this.showLoading(true);
    if (MassiveAPI.isConnected()) {
      try {
        this.marketBarsData = await MassiveAPI.getMultipleStockBars(tickers, days);
      } catch (e) {
        this._loadSimulatedBars('marketBarsData', tickers, days);
      }
    } else {
      this._loadSimulatedBars('marketBarsData', tickers, days);
    }
    this.showLoading(false);
    this.renderMarketCharts();
  },

  renderMarketCharts() {
    ChartManager.renderMarketPrice(this.marketBarsData);
    ChartManager.renderMarketVolume(this.marketBarsData);
    ChartManager.renderMarketCap(TREASURY_COMPANIES, this.stockSnapshots);
    ChartManager.renderMarketReturns(this.marketBarsData);
  },

  // ================================================================
  //  CRYPTO HOLDINGS TAB
  // ================================================================

  renderCryptoHoldings() {
    const prices = this.cryptoPrices;
    const btcVal = DataUtils.getTotalHolding('BTC') * (prices.BTC || 0);
    const ethVal = DataUtils.getTotalHolding('ETH') * (prices.ETH || 0);
    const solVal = DataUtils.getTotalHolding('SOL') * (prices.SOL || 0);
    const totalNAV = btcVal + ethVal + solVal;

    const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    setEl('holdingsTotalNAV', DataUtils.formatNumber(totalNAV));
    setEl('holdingsBTCDom', totalNAV > 0 ? ((btcVal / totalNAV) * 100).toFixed(1) + '%' : '--');
    setEl('holdingsETHDom', totalNAV > 0 ? ((ethVal / totalNAV) * 100).toFixed(1) + '%' : '--');
    setEl('holdingsSOLDom', totalNAV > 0 ? ((solVal / totalNAV) * 100).toFixed(1) + '%' : '--');

    ChartManager.renderHoldingsComposition(prices);
    ChartManager.renderHoldingsPremium(TREASURY_COMPANIES, prices, this.stockSnapshots);
    ChartManager.renderHoldingsByCompany(TREASURY_COMPANIES, prices);
    ChartManager.renderHoldingsOverTime();
  },

  // ================================================================
  //  ASSET TABS (BTC, ETH, SOL)
  // ================================================================

  renderAssetTab(asset) {
    const price = this.cryptoPrices[asset] || 0;
    const prefix = asset.toLowerCase();
    const holders = DataUtils.getCompaniesWithHolding(asset);
    const totalHeld = DataUtils.getTotalHolding(asset);

    const setEl = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

    setEl(prefix + 'TotalHeld', DataUtils.formatCount(totalHeld));
    setEl(prefix + 'Price', DataUtils.formatPrice(price));
    setEl(prefix + 'TotalValue', DataUtils.formatNumber(totalHeld * price));
    setEl(prefix + 'CompanyCount', holders.length);

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

    const holders = companies
      .filter(c => c.holdings[asset] && c.holdings[asset].quantity > 0)
      .sort((a, b) => b.holdings[asset].quantity - a.holdings[asset].quantity);
    const totalHeld = holders.reduce((s, c) => s + c.holdings[asset].quantity, 0);

    holders.forEach(c => {
      const h = c.holdings[asset];
      const val = h.quantity * price;
      const cost = h.quantity * h.avgCost;
      const pl = val - cost;
      const plPct = cost > 0 ? (pl / cost) * 100 : 0;
      const share = totalHeld > 0 ? ((h.quantity / totalHeld) * 100).toFixed(1) + '%' : '--';

      const tr = document.createElement('tr');
      tr.innerHTML =
        `<td>${c.ticker}</td>` +
        `<td>${c.name}</td>` +
        `<td class="num">${DataUtils.formatCount(h.quantity)}</td>` +
        `<td class="num">${DataUtils.formatPrice(h.avgCost)}</td>` +
        `<td class="num">${DataUtils.formatNumber(cost)}</td>` +
        `<td class="num">${DataUtils.formatNumber(val)}</td>` +
        `<td class="num ${pl >= 0 ? 'positive' : 'negative'}">${DataUtils.formatNumber(pl)}</td>` +
        `<td class="num ${plPct >= 0 ? 'positive' : 'negative'}">${DataUtils.formatPercent(plPct)}</td>` +
        `<td class="num">${share}</td>`;
      tbody.appendChild(tr);
    });
  },

  // ================================================================
  //  EXPORT BUTTONS
  // ================================================================

  setupExportButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.export-btn');
      if (!btn) return;
      const chartId = btn.dataset.chart;
      const type = btn.dataset.type;
      if (type === 'jpeg') ExportUtils.exportChartAsJPEG(chartId, 'treasury-' + chartId);
      else if (type === 'csv') ExportUtils.exportChartAsCSV(chartId, 'treasury-' + chartId);
    });
  },

  // ================================================================
  //  TABLE SORT (fixed parsing with DataUtils.parseAbbreviatedValue)
  // ================================================================

  setupTableSort() {
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const colIndex = Array.from(th.parentNode.children).indexOf(th);
        const isNum = th.classList.contains('num');
        const isAsc = th.classList.contains('sort-asc');

        // Clear all sort classes on sibling headers
        table.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(isAsc ? 'sort-desc' : 'sort-asc');

        rows.sort((a, b) => {
          let aV = a.children[colIndex]?.textContent.trim() || '';
          let bV = b.children[colIndex]?.textContent.trim() || '';

          if (isNum) {
            // Use DataUtils.parseAbbreviatedValue for correct K/M/B/T parsing
            const aNum = DataUtils.parseAbbreviatedValue(aV);
            const bNum = DataUtils.parseAbbreviatedValue(bV);
            return isAsc ? (bNum - aNum) : (aNum - bNum);
          }

          // String comparison
          return isAsc
            ? bV.toString().localeCompare(aV.toString())
            : aV.toString().localeCompare(bV.toString());
        });

        rows.forEach(r => tbody.appendChild(r));
      });
    });
  },

  // ================================================================
  //  SEARCH
  // ================================================================

  setupSearch() {
    // Table search
    const companySearch = document.getElementById('companySearch');
    if (companySearch) {
      companySearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('#companiesTableBody tr').forEach(r => {
          r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        if (!q) return;
        // Search across all visible table rows
        document.querySelectorAll('.data-table tbody tr').forEach(r => {
          if (r.closest('.tab-panel.active')) {
            r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
          }
        });
      });
    }
  },

  // ================================================================
  //  UI HELPERS
  // ================================================================

  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.toggle('hidden', !show);
  },

  showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast ' + type;
    // Force reflow for animation
    toast.offsetHeight;
    setTimeout(() => toast.classList.add('hidden'), 3000);
  },

  showErrorBanner(msg) {
    // Remove any existing error banner
    const existing = document.querySelector('.error-banner');
    if (existing) existing.remove();

    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const banner = document.createElement('div');
    banner.className = 'error-banner';
    banner.innerHTML =
      `<span>${msg}</span>` +
      `<button class="dismiss" title="Dismiss">&times;</button>`;

    banner.querySelector('.dismiss').addEventListener('click', () => banner.remove());

    // Insert after navbar
    navbar.parentNode.insertBefore(banner, navbar.nextSibling);
  }
};

// ================================================================
//  BOOTSTRAP
// ================================================================

document.addEventListener('DOMContentLoaded', () => App.init());
