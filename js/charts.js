/**
 * Chart Manager - Dark-themed (Blockworks-style) Chart.js chart management
 * All stock price references use DataUtils.getStockPrice(snapshot) to fix the $0 bug
 * when market is closed (falls back to prevDay.c).
 */

const ChartManager = {
  charts: {},

  // ===== DARK THEME DEFAULTS =====
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1c1f2e',
        titleColor: '#e2e5ea',
        bodyColor: '#a0a4b0',
        borderColor: '#252838',
        borderWidth: 1,
        padding: 10,
        titleFont: { size: 11, weight: '600' },
        bodyFont: { size: 11 },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        cornerRadius: 6,
        callbacks: {}
      }
    },
    scales: {
      x: {
        ticks: { color: '#6b7080', font: { size: 10 } },
        grid: { color: '#252838', drawBorder: false }
      },
      y: {
        ticks: { color: '#6b7080', font: { size: 10 } },
        grid: { color: '#252838', drawBorder: false }
      }
    }
  },

  // ===== LIFECYCLE =====

  destroy(chartId) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
      delete this.charts[chartId];
    }
  },

  destroyAll() {
    Object.keys(this.charts).forEach(id => this.destroy(id));
  },

  // ===== HELPERS =====

  _getCtx(chartId) {
    const canvas = document.getElementById('chart-' + chartId);
    if (!canvas) return null;
    return canvas.getContext('2d');
  },

  _mergeOptions(custom) {
    const merged = {
      ...this.defaultOptions,
      ...custom,
      plugins: {
        ...this.defaultOptions.plugins,
        ...(custom.plugins || {}),
        legend: {
          ...this.defaultOptions.plugins.legend,
          ...(custom.plugins?.legend || {})
        },
        tooltip: {
          ...this.defaultOptions.plugins.tooltip,
          ...(custom.plugins?.tooltip || {}),
          callbacks: {
            ...this.defaultOptions.plugins.tooltip.callbacks,
            ...(custom.plugins?.tooltip?.callbacks || {})
          }
        }
      },
      scales: custom.scales || this.defaultOptions.scales
    };
    // Carry over top-level keys like interaction, indexAxis, etc.
    if (custom.interaction) merged.interaction = custom.interaction;
    if (custom.indexAxis) merged.indexAxis = custom.indexAxis;
    return merged;
  },

  // ================================================================
  //  NAV CHART (Stacked Area) - Aggregate NAV over time
  // ================================================================

  renderNavChart(barsData, companies, scope) {
    this.destroy('navChart');
    const ctx = this._getCtx('navChart');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 0);
    if (tickers.length === 0) return;

    // Filter by scope if provided
    const days = scope ? DataUtils.scopeToDays(scope) : null;

    // Find the longest series for labels
    const longestTicker = tickers.reduce((a, b) =>
      barsData[a].length >= barsData[b].length ? a : b
    );
    let refBars = barsData[longestTicker];
    if (days && refBars.length > days) {
      refBars = refBars.slice(-days);
    }

    const labels = refBars.map(b =>
      new Date(b.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const datasets = tickers.map((ticker, i) => {
      const company = companies.find(c => c.ticker === ticker);
      if (!company) return null;
      let bars = barsData[ticker];
      if (days && bars.length > days) bars = bars.slice(-days);

      // NAV = close price * shares (as proxy using stock price bars)
      const data = bars.map(b => {
        const nav = DataUtils.getCryptoNAV(company, FALLBACK_PRICES);
        // Scale NAV proportionally based on price movement from bar data
        const latestClose = bars[bars.length - 1]?.c || 1;
        return latestClose > 0 ? nav * (b.c / latestClose) : nav;
      });

      const color = CHART_COLORS[i % CHART_COLORS.length];
      return {
        label: ticker,
        data,
        borderColor: color,
        backgroundColor: color + '30',
        fill: true,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.3
      };
    }).filter(Boolean);

    this.charts['navChart'] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (ctx) => ctx.dataset.label + ' Nav ' + DataUtils.formatNumber(ctx.raw)
            }
          }
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            ticks: { color: '#6b7080', maxTicksLimit: 12, font: { size: 10 } },
            grid: { color: '#252838', drawBorder: false }
          },
          y: {
            stacked: true,
            ticks: {
              color: '#6b7080',
              font: { size: 10 },
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: '#252838', drawBorder: false }
          }
        }
      })
    });

    this._buildMcapLegend(tickers, datasets);
  },

  // ================================================================
  //  VOLUME CHART (Bar) - Aggregate daily trading volume
  // ================================================================

  renderVolumeChart(barsData, companies, cumulative) {
    this.destroy('volumeChart');
    const ctx = this._getCtx('volumeChart');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 0);
    if (tickers.length === 0) return;

    // Find the longest series for labels
    const longestTicker = tickers.reduce((a, b) =>
      barsData[a].length >= barsData[b].length ? a : b
    );
    const refBars = barsData[longestTicker];
    const labels = refBars.map(b =>
      new Date(b.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    // Aggregate volume across all tickers per date
    const aggVolumes = refBars.map((_, idx) => {
      let total = 0;
      tickers.forEach(t => {
        const bar = barsData[t][idx];
        if (bar) total += (bar.v || 0);
      });
      return total;
    });

    let chartData;
    if (cumulative) {
      let running = 0;
      chartData = aggVolumes.map(v => { running += v; return running; });
    } else {
      chartData = aggVolumes;
    }

    const barColors = chartData.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + 'cc');

    this.charts['volumeChart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: cumulative ? 'Cumulative Volume' : 'Daily Volume',
          data: chartData,
          backgroundColor: '#5b8def99',
          borderColor: '#5b8def',
          borderWidth: 1,
          borderRadius: 2
        }]
      },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => (cumulative ? 'Cumulative: ' : 'Volume: ') + DataUtils.formatCount(ctx.raw)
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#6b7080', maxTicksLimit: 12, font: { size: 10 } },
            grid: { color: '#252838', drawBorder: false }
          },
          y: {
            ticks: {
              color: '#6b7080',
              font: { size: 10 },
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: '#252838', drawBorder: false }
          }
        }
      })
    });
  },

  // ================================================================
  //  MCAP OVER TIME (Multi-line) - Hero chart, with indexTo100 option
  // ================================================================

  renderMcapOverTime(barsData, companies, indexTo100) {
    // Chart ID matches the HTML canvas id="chart-navChart"
    this.destroy('navChart');
    const ctx = this._getCtx('navChart');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 1);
    if (tickers.length === 0) return;

    // Find longest series for labels
    const longestTicker = tickers.reduce((a, b) =>
      barsData[a].length >= barsData[b].length ? a : b
    );
    const labels = barsData[longestTicker].map(b =>
      new Date(b.t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const datasets = tickers.map((ticker, i) => {
      const bars = barsData[ticker];
      const company = companies.find(c => c.ticker === ticker);
      const shares = company?.sharesOutstanding || 1;

      let data;
      if (indexTo100) {
        const base = bars[0]?.c || 1;
        data = bars.map(b => (b.c / base) * 100);
      } else {
        data = bars.map(b => b.c * shares);
      }

      return {
        label: ticker,
        data,
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.3
      };
    });

    this.charts['navChart'] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw;
                if (indexTo100) return ctx.dataset.label + ': ' + val.toFixed(1);
                return ctx.dataset.label + ': ' + DataUtils.formatNumber(val);
              }
            }
          }
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            ticks: { color: '#6b7080', maxTicksLimit: 12, font: { size: 10 } },
            grid: { color: '#252838', drawBorder: false }
          },
          y: {
            ticks: {
              color: '#6b7080',
              font: { size: 10 },
              callback: v => indexTo100 ? v.toFixed(0) : DataUtils.formatNumber(v)
            },
            grid: { color: '#252838', drawBorder: false }
          }
        }
      })
    });

    // Build custom legend
    this._buildMcapLegend(tickers, datasets);
  },

  // ================================================================
  //  CUSTOM LEGEND BUILDER (clickable toggle)
  // ================================================================

  _buildMcapLegend(tickers, datasets) {
    // Try both possible container IDs
    const container = document.getElementById('mcapLegend') || document.getElementById('navChartLegend');
    if (!container) return;
    container.innerHTML = '';

    tickers.forEach((ticker, i) => {
      const item = document.createElement('span');
      item.className = 'legend-item';
      item.dataset.ticker = ticker;
      item.innerHTML = '<span class="legend-dot" style="background:' + CHART_COLORS[i % CHART_COLORS.length] + '"></span>' + ticker;
      item.style.cursor = 'pointer';
      item.style.userSelect = 'none';

      item.addEventListener('click', () => {
        // Check both possible chart keys
        const chart = this.charts['navChart'] || this.charts['mcapOverTime'];
        if (!chart) return;
        const ds = chart.data.datasets[i];
        if (!ds) return;
        ds.hidden = !ds.hidden;
        item.classList.toggle('dimmed', ds.hidden);
        item.style.opacity = ds.hidden ? '0.35' : '1';
        chart.update();
      });

      container.appendChild(item);
    });
  },

  // ================================================================
  //  OVERVIEW: Market Cap vs Crypto NAV (Grouped Bar)
  // ================================================================

  renderOverviewMcapNav(companies, prices, snapshots) {
    this.destroy('overviewMcapNav');
    const ctx = this._getCtx('overviewMcapNav');
    if (!ctx) return;

    const sorted = [...companies]
      .map(c => {
        const snap = snapshots[c.ticker];
        const stockPrice = DataUtils.getStockPrice(snap);
        const mcap = stockPrice * c.sharesOutstanding;
        const nav = DataUtils.getCryptoNAV(c, prices);
        return { ...c, mcap, nav };
      })
      .filter(c => c.mcap > 0)
      .sort((a, b) => b.mcap - a.mcap)
      .slice(0, 12);

    this.charts['overviewMcapNav'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sorted.map(c => c.ticker),
        datasets: [
          {
            label: 'Market Cap',
            data: sorted.map(c => c.mcap),
            backgroundColor: 'rgba(91, 141, 239, 0.75)',
            borderColor: '#5b8def',
            borderWidth: 1,
            borderRadius: 3
          },
          {
            label: 'Crypto NAV',
            data: sorted.map(c => c.nav),
            backgroundColor: 'rgba(62, 207, 142, 0.75)',
            borderColor: '#3ecf8e',
            borderWidth: 1,
            borderRadius: 3
          }
        ]
      },
      options: this._mergeOptions({
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.dataset.label + ': ' + DataUtils.formatNumber(ctx.raw)
            }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080', font: { size: 10 } }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              font: { size: 10 },
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  OVERVIEW: mNAV by Company (Horizontal Bar)
  // ================================================================

  renderOverviewMnavCompany(companies, prices, snapshots) {
    this.destroy('overviewMnavCompany');
    const ctx = this._getCtx('overviewMnavCompany');
    if (!ctx) return;

    const data = companies
      .map(c => {
        const snap = snapshots[c.ticker];
        const stockPrice = DataUtils.getStockPrice(snap);
        const mcap = stockPrice * c.sharesOutstanding;
        const nav = DataUtils.getCryptoNAV(c, prices);
        const mnav = nav > 0 ? mcap / nav : 0;
        return { ticker: c.ticker, mnav };
      })
      .filter(c => c.mnav > 0)
      .sort((a, b) => b.mnav - a.mnav);

    const colors = data.map(d => {
      if (d.mnav > 3) return 'rgba(244, 91, 105, 0.75)';   // red
      if (d.mnav > 2) return 'rgba(240, 168, 58, 0.75)';    // orange
      if (d.mnav > 1) return 'rgba(62, 207, 142, 0.75)';    // green
      return 'rgba(91, 141, 239, 0.75)';                     // blue
    });

    this.charts['overviewMnavCompany'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [{
          label: 'mNAV (Market Cap / Crypto NAV)',
          data: data.map(d => d.mnav),
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 3
        }]
      },
      options: this._mergeOptions({
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => 'mNAV: ' + ctx.raw.toFixed(2) + 'x'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#6b7080', callback: v => v.toFixed(1) + 'x' },
            grid: { color: '#252838' }
          },
          y: {
            ticks: { color: '#6b7080', font: { size: 10 } },
            grid: { display: false }
          }
        }
      })
    });
  },

  // ================================================================
  //  MARKET DATA: Price Performance (Indexed 100)
  // ================================================================

  renderMarketPrice(barsData) {
    this.destroy('marketPrice');
    const ctx = this._getCtx('marketPrice');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 0);
    if (tickers.length === 0) return;

    const datasets = tickers.map((ticker, i) => {
      const bars = barsData[ticker];
      const basePrice = bars[0]?.c || 1;
      return {
        label: ticker,
        data: bars.map(b => ({
          x: new Date(b.t).toLocaleDateString(),
          y: (b.c / basePrice) * 100
        })),
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3
      };
    });

    const longestSeries = tickers.reduce((a, b) =>
      barsData[a].length >= barsData[b].length ? a : b
    );
    const labels = barsData[longestSeries].map(b => new Date(b.t).toLocaleDateString());

    this.charts['marketPrice'] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: this._mergeOptions({
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (ctx) => ctx.dataset.label + ': ' + (ctx.raw.y != null ? ctx.raw.y.toFixed(1) : ctx.raw.toFixed(1))
            }
          }
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            ticks: { color: '#6b7080', maxTicksLimit: 10, font: { size: 10 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: '#6b7080',
              font: { size: 10 },
              callback: v => v.toFixed(0)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  MARKET DATA: Average Daily Volume (Bar)
  // ================================================================

  renderMarketVolume(barsData) {
    this.destroy('marketVolume');
    const ctx = this._getCtx('marketVolume');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 0);
    if (tickers.length === 0) return;

    const avgVolumes = tickers.map(ticker => {
      const bars = barsData[ticker];
      const totalVol = bars.reduce((s, b) => s + (b.v || 0), 0);
      return totalVol / bars.length;
    });

    this.charts['marketVolume'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tickers,
        datasets: [{
          label: 'Avg Daily Volume',
          data: avgVolumes,
          backgroundColor: tickers.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + 'aa'),
          borderWidth: 0,
          borderRadius: 3
        }]
      },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => 'Volume: ' + DataUtils.formatCount(ctx.raw)
            }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  MARKET DATA: Market Cap Comparison (Bar)
  //  USES DataUtils.getStockPrice(snap) to fix $0 bug
  // ================================================================

  renderMarketCap(companies, snapshots) {
    this.destroy('marketCap');
    const ctx = this._getCtx('marketCap');
    if (!ctx) return;

    const data = companies
      .map(c => {
        const snap = snapshots[c.ticker];
        const stockPrice = DataUtils.getStockPrice(snap);
        const mcap = stockPrice * c.sharesOutstanding;
        return { ticker: c.ticker, mcap };
      })
      .filter(c => c.mcap > 0)
      .sort((a, b) => b.mcap - a.mcap)
      .slice(0, 15);

    this.charts['marketCap'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [{
          label: 'Market Cap',
          data: data.map(d => d.mcap),
          backgroundColor: data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length] + 'bb'),
          borderWidth: 0,
          borderRadius: 3
        }]
      },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => DataUtils.formatNumber(ctx.raw) }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  MARKET DATA: Period Returns (Horizontal Bar)
  // ================================================================

  renderMarketReturns(barsData) {
    this.destroy('marketReturns');
    const ctx = this._getCtx('marketReturns');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 1);
    if (tickers.length === 0) return;

    const returns = tickers.map(ticker => {
      const bars = barsData[ticker];
      const firstClose = bars[0]?.c || 1;
      const lastClose = bars[bars.length - 1]?.c || 1;
      return {
        ticker,
        totalReturn: ((lastClose - firstClose) / firstClose) * 100
      };
    }).sort((a, b) => b.totalReturn - a.totalReturn);

    const colors = returns.map(r =>
      r.totalReturn >= 0 ? 'rgba(62, 207, 142, 0.75)' : 'rgba(244, 91, 105, 0.75)'
    );

    this.charts['marketReturns'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: returns.map(r => r.ticker),
        datasets: [{
          label: 'Period Return %',
          data: returns.map(r => r.totalReturn),
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 3
        }]
      },
      options: this._mergeOptions({
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => DataUtils.formatPercent(ctx.raw)
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#6b7080', callback: v => v.toFixed(0) + '%' },
            grid: { color: '#252838' }
          },
          y: { ticks: { color: '#6b7080', font: { size: 10 } }, grid: { display: false } }
        }
      })
    });
  },

  // ================================================================
  //  HOLDINGS: Composition (Doughnut)
  // ================================================================

  renderHoldingsComposition(prices) {
    this.destroy('holdingsComposition');
    const ctx = this._getCtx('holdingsComposition');
    if (!ctx) return;

    const btcVal = DataUtils.getTotalHolding('BTC') * (prices.BTC || 0);
    const ethVal = DataUtils.getTotalHolding('ETH') * (prices.ETH || 0);
    const solVal = DataUtils.getTotalHolding('SOL') * (prices.SOL || 0);

    this.charts['holdingsComposition'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)'],
        datasets: [{
          data: [btcVal, ethVal, solVal],
          backgroundColor: ['#f7931a', '#627eea', '#9945ff'],
          borderColor: '#161820',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#a0a4b0', font: { size: 12 }, padding: 16 }
          },
          tooltip: {
            backgroundColor: '#1c1f2e',
            titleColor: '#e2e5ea',
            bodyColor: '#a0a4b0',
            borderColor: '#252838',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return ctx.label + ': ' + DataUtils.formatNumber(ctx.raw) + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  },

  // ================================================================
  //  HOLDINGS: Premium / Discount to NAV (Bar)
  //  USES DataUtils.getStockPrice(snap) to fix $0 bug
  // ================================================================

  renderHoldingsPremium(companies, prices, snapshots) {
    this.destroy('holdingsPremium');
    const ctx = this._getCtx('holdingsPremium');
    if (!ctx) return;

    const data = companies
      .map(c => {
        const snap = snapshots[c.ticker];
        const stockPrice = DataUtils.getStockPrice(snap);
        const mcap = stockPrice * c.sharesOutstanding;
        const nav = DataUtils.getCryptoNAV(c, prices);
        const premium = nav > 0 ? ((mcap - nav) / nav) * 100 : 0;
        return { ticker: c.ticker, premium };
      })
      .filter(c => c.premium !== 0)
      .sort((a, b) => b.premium - a.premium);

    const colors = data.map(d =>
      d.premium >= 0 ? 'rgba(62, 207, 142, 0.75)' : 'rgba(244, 91, 105, 0.75)'
    );

    this.charts['holdingsPremium'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [{
          label: 'Premium/Discount to NAV %',
          data: data.map(d => d.premium),
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 3
        }]
      },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => (ctx.raw >= 0 ? 'Premium: +' : 'Discount: ') + ctx.raw.toFixed(1) + '%'
            }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080', font: { size: 10 } }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => v.toFixed(0) + '%'
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  HOLDINGS: By Company (Stacked Bar)
  // ================================================================

  renderHoldingsByCompany(companies, prices) {
    this.destroy('holdingsByCompany');
    const ctx = this._getCtx('holdingsByCompany');
    if (!ctx) return;

    const data = companies
      .map(c => ({
        ticker: c.ticker,
        btcVal: c.holdings.BTC.quantity * (prices.BTC || 0),
        ethVal: c.holdings.ETH.quantity * (prices.ETH || 0),
        solVal: c.holdings.SOL.quantity * (prices.SOL || 0)
      }))
      .map(d => ({ ...d, total: d.btcVal + d.ethVal + d.solVal }))
      .filter(d => d.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    this.charts['holdingsByCompany'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [
          {
            label: 'BTC Value',
            data: data.map(d => d.btcVal),
            backgroundColor: '#f7931a'
          },
          {
            label: 'ETH Value',
            data: data.map(d => d.ethVal),
            backgroundColor: '#627eea'
          },
          {
            label: 'SOL Value',
            data: data.map(d => d.solVal),
            backgroundColor: '#9945ff'
          }
        ]
      },
      options: this._mergeOptions({
        plugins: {
          tooltip: {
            mode: 'index',
            callbacks: { label: ctx => ctx.dataset.label + ': ' + DataUtils.formatNumber(ctx.raw) }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: '#6b7080' },
            grid: { display: false }
          },
          y: {
            stacked: true,
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  HOLDINGS: Over Time (Multi-line with fill)
  // ================================================================

  renderHoldingsOverTime() {
    this.destroy('holdingsOverTime');
    const ctx = this._getCtx('holdingsOverTime');
    if (!ctx) return;

    this.charts['holdingsOverTime'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: HOLDINGS_HISTORY.dates,
        datasets: [
          {
            label: 'BTC Holdings',
            data: HOLDINGS_HISTORY.aggregateBTC,
            borderColor: '#f7931a',
            backgroundColor: 'rgba(247, 147, 26, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#f7931a'
          },
          {
            label: 'ETH Holdings',
            data: HOLDINGS_HISTORY.aggregateETH,
            borderColor: '#627eea',
            backgroundColor: 'rgba(98, 126, 234, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#627eea'
          },
          {
            label: 'SOL Holdings',
            data: HOLDINGS_HISTORY.aggregateSOL,
            borderColor: '#9945ff',
            backgroundColor: 'rgba(153, 69, 255, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#9945ff'
          }
        ]
      },
      options: this._mergeOptions({
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: '#a0a4b0', font: { size: 11 }, padding: 12, usePointStyle: true }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: ctx => ctx.dataset.label + ': ' + DataUtils.formatCount(ctx.raw)
            }
          }
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { ticks: { color: '#6b7080' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  ASSET TAB: Holdings by Company (Bar)
  // ================================================================

  renderAssetHoldings(asset, companies, price) {
    const chartId = asset.toLowerCase() + 'Holdings';
    this.destroy(chartId);
    const ctx = this._getCtx(chartId);
    if (!ctx) return;

    const assetColor = { BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff' }[asset] || '#5b8def';

    const data = companies
      .filter(c => c.holdings[asset].quantity > 0)
      .map(c => ({ ticker: c.ticker, quantity: c.holdings[asset].quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    this.charts[chartId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [{
          label: asset + ' Holdings',
          data: data.map(d => d.quantity),
          backgroundColor: assetColor + 'bb',
          borderColor: assetColor,
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => DataUtils.formatCount(ctx.raw) + ' ' + asset + ' (' + DataUtils.formatNumber(ctx.raw * (price || 0)) + ')'
            }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  ASSET TAB: Distribution (Doughnut)
  // ================================================================

  renderAssetDistribution(asset, companies) {
    const chartId = asset.toLowerCase() + 'Distribution';
    this.destroy(chartId);
    const ctx = this._getCtx(chartId);
    if (!ctx) return;

    const data = companies
      .filter(c => c.holdings[asset].quantity > 0)
      .map(c => ({ ticker: c.ticker, quantity: c.holdings[asset].quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    const total = data.reduce((s, d) => s + d.quantity, 0);

    // Group small holders into "Others"
    const threshold = total * 0.02;
    const main = data.filter(d => d.quantity >= threshold);
    const othersQty = data.filter(d => d.quantity < threshold).reduce((s, d) => s + d.quantity, 0);
    if (othersQty > 0) {
      main.push({ ticker: 'Others', quantity: othersQty });
    }

    this.charts[chartId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: main.map(d => d.ticker),
        datasets: [{
          data: main.map(d => d.quantity),
          backgroundColor: main.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderColor: '#161820',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#a0a4b0', font: { size: 11 }, padding: 8 }
          },
          tooltip: {
            backgroundColor: '#1c1f2e',
            titleColor: '#e2e5ea',
            bodyColor: '#a0a4b0',
            borderColor: '#252838',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                return ctx.label + ': ' + DataUtils.formatCount(ctx.raw) + ' (' + pct + '%)';
              }
            }
          }
        }
      }
    });
  },

  // ================================================================
  //  ASSET TAB: Cost Basis vs Current Value (Grouped Bar)
  // ================================================================

  renderAssetCostBasis(asset, companies, currentPrice) {
    const chartId = asset.toLowerCase() + 'CostBasis';
    this.destroy(chartId);
    const ctx = this._getCtx(chartId);
    if (!ctx) return;

    const data = companies
      .filter(c => c.holdings[asset].quantity > 0 && c.holdings[asset].avgCost > 0)
      .map(c => ({
        ticker: c.ticker,
        totalCost: c.holdings[asset].quantity * c.holdings[asset].avgCost,
        currentValue: c.holdings[asset].quantity * (currentPrice || 0)
      }))
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 12);

    this.charts[chartId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [
          {
            label: 'Total Cost Basis',
            data: data.map(d => d.totalCost),
            backgroundColor: 'rgba(107, 112, 128, 0.6)',
            borderWidth: 0,
            borderRadius: 3
          },
          {
            label: 'Current Value',
            data: data.map(d => d.currentValue),
            backgroundColor: currentPrice > 0 ? 'rgba(62, 207, 142, 0.65)' : 'rgba(107, 112, 128, 0.4)',
            borderWidth: 0,
            borderRadius: 3
          }
        ]
      },
      options: this._mergeOptions({
        plugins: {
          tooltip: {
            mode: 'index',
            callbacks: { label: ctx => ctx.dataset.label + ': ' + DataUtils.formatNumber(ctx.raw) }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  ASSET TAB: BTC Holdings (ex-MSTR)
  // ================================================================

  renderBtcExMstr(companies, price) {
    this.destroy('btcExMstr');
    const ctx = this._getCtx('btcExMstr');
    if (!ctx) return;

    const data = companies
      .filter(c => c.holdings.BTC.quantity > 0 && c.ticker !== 'MSTR')
      .map(c => ({ ticker: c.ticker, quantity: c.holdings.BTC.quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    this.charts['btcExMstr'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [{
          label: 'BTC Holdings (ex-MSTR)',
          data: data.map(d => d.quantity),
          backgroundColor: '#f7931abb',
          borderColor: '#f7931a',
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => DataUtils.formatCount(ctx.raw) + ' BTC (' + DataUtils.formatNumber(ctx.raw * (price || 0)) + ')'
            }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  },

  // ================================================================
  //  ASSET TAB: Holdings Over Time (single asset line with fill)
  // ================================================================

  renderAssetOverTime(asset) {
    const chartId = asset.toLowerCase() + 'OverTime';
    this.destroy(chartId);
    const ctx = this._getCtx(chartId);
    if (!ctx) return;

    const assetKey = 'aggregate' + asset;
    const historyData = HOLDINGS_HISTORY[assetKey];
    if (!historyData) return;

    const assetColor = { BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff' }[asset] || '#5b8def';

    this.charts[chartId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: HOLDINGS_HISTORY.dates,
        datasets: [{
          label: 'Aggregate ' + asset + ' Holdings',
          data: historyData,
          borderColor: assetColor,
          backgroundColor: assetColor + '20',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: assetColor,
          pointBorderColor: assetColor
        }]
      },
      options: this._mergeOptions({
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => DataUtils.formatCount(ctx.raw) + ' ' + asset
            }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7080' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#6b7080',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: '#252838' }
          }
        }
      })
    });
  }
};
