/**
 * Chart Manager - Handles all Chart.js chart creation and updates
 */

const ChartManager = {
  charts: {},

  defaultOptions: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1a1d23',
        bodyColor: '#5c6370',
        borderColor: '#e2e5e9',
        borderWidth: 1,
        padding: 8,
        titleFont: { size: 11 },
        bodyFont: { size: 11 },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        callbacks: {}
      }
    },
    scales: {
      x: {
        ticks: { color: '#8b929e', font: { size: 10 } },
        grid: { color: 'rgba(226, 229, 233, 0.6)', drawBorder: false }
      },
      y: {
        ticks: { color: '#8b929e', font: { size: 10 } },
        grid: { color: 'rgba(226, 229, 233, 0.6)', drawBorder: false }
      }
    }
  },

  destroy(chartId) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
      delete this.charts[chartId];
    }
  },

  destroyAll() {
    Object.keys(this.charts).forEach(id => this.destroy(id));
  },

  _getCtx(chartId) {
    const canvas = document.getElementById('chart-' + chartId);
    if (!canvas) return null;
    return canvas.getContext('2d');
  },

  _mergeOptions(custom) {
    return {
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
          ...(custom.plugins?.tooltip || {})
        }
      },
      scales: custom.scales || this.defaultOptions.scales
    };
  },

  // ============= MARKET CAP OVER TIME (HERO CHART) =============

  renderMcapOverTime(barsData, companies, indexTo100) {
    this.destroy('mcapOverTime');
    const ctx = this._getCtx('mcapOverTime');
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

    this.charts['mcapOverTime'] = new Chart(ctx, {
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
            ticks: { color: '#8b929e', maxTicksLimit: 12, font: { size: 10 } },
            grid: { color: 'rgba(226, 229, 233, 0.6)', drawBorder: false }
          },
          y: {
            ticks: {
              color: '#8b929e',
              font: { size: 10 },
              callback: v => indexTo100 ? v.toFixed(0) : DataUtils.formatNumber(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.6)', drawBorder: false }
          }
        }
      })
    });

    // Build custom legend
    this._buildMcapLegend(tickers, datasets);
  },

  _buildMcapLegend(tickers, datasets) {
    const container = document.getElementById('mcapLegend');
    if (!container) return;
    container.innerHTML = '';

    tickers.forEach((ticker, i) => {
      const item = document.createElement('span');
      item.className = 'legend-item';
      item.dataset.ticker = ticker;
      item.innerHTML = `<span class="legend-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>${ticker}`;

      item.addEventListener('click', () => {
        const chart = this.charts['mcapOverTime'];
        if (!chart) return;
        const ds = chart.data.datasets[i];
        ds.hidden = !ds.hidden;
        item.classList.toggle('dimmed', ds.hidden);
        chart.update();
      });

      container.appendChild(item);
    });
  },

  // ============= OVERVIEW TAB CHARTS =============

  renderOverviewMcapNav(companies, prices, snapshots) {
    this.destroy('overviewMcapNav');
    const ctx = this._getCtx('overviewMcapNav');
    if (!ctx) return;

    const sorted = [...companies]
      .map(c => {
        const snap = snapshots[c.ticker];
        const price = snap?.day?.c || 0;
        const mcap = price * c.sharesOutstanding;
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
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: '#3b82f6',
            borderWidth: 1
          },
          {
            label: 'Crypto NAV',
            data: sorted.map(c => c.nav),
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: '#22c55e',
            borderWidth: 1
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
          x: { ticks: { color: '#8b929e', font: { size: 10 } }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              font: { size: 10 },
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

  renderOverviewMnavCompany(companies, prices, snapshots) {
    this.destroy('overviewMnavCompany');
    const ctx = this._getCtx('overviewMnavCompany');
    if (!ctx) return;

    const data = companies
      .map(c => {
        const snap = snapshots[c.ticker];
        const price = snap?.day?.c || 0;
        const mcap = price * c.sharesOutstanding;
        const nav = DataUtils.getCryptoNAV(c, prices);
        const mnav = nav > 0 ? mcap / nav : 0;
        return { ticker: c.ticker, mnav };
      })
      .filter(c => c.mnav > 0)
      .sort((a, b) => b.mnav - a.mnav);

    const colors = data.map(d => {
      if (d.mnav > 3) return 'rgba(239, 68, 68, 0.7)';
      if (d.mnav > 2) return 'rgba(245, 158, 11, 0.7)';
      if (d.mnav > 1) return 'rgba(34, 197, 94, 0.7)';
      return 'rgba(59, 130, 246, 0.7)';
    });

    this.charts['overviewMnavCompany'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [{
          label: 'mNAV (Market Cap / Crypto NAV)',
          data: data.map(d => d.mnav),
          backgroundColor: colors,
          borderWidth: 0
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
            ticks: { color: '#8b929e', callback: v => v.toFixed(1) + 'x' },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          },
          y: {
            ticks: { color: '#5c6370', font: { size: 10 } },
            grid: { display: false }
          }
        }
      })
    });
  },

  // ============= MARKET DATA TAB CHARTS =============

  renderMarketPrice(barsData) {
    this.destroy('marketPrice');
    const ctx = this._getCtx('marketPrice');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 0);
    if (tickers.length === 0) return;

    // Index all series to 100 at start
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

    // Use the longest series for labels
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
              label: (ctx) => ctx.dataset.label + ': ' + ctx.raw.y?.toFixed(1)
            }
          }
        },
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            ticks: { color: '#8b929e', maxTicksLimit: 10, font: { size: 10 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: '#8b929e',
              font: { size: 10 },
              callback: v => v.toFixed(0)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

  renderMarketVolume(barsData) {
    this.destroy('marketVolume');
    const ctx = this._getCtx('marketVolume');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 0);
    if (tickers.length === 0) return;

    // Show average daily volume as bar chart
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
          borderWidth: 0
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
          x: { ticks: { color: '#8b929e' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

  renderMarketCap(companies, snapshots) {
    this.destroy('marketCap');
    const ctx = this._getCtx('marketCap');
    if (!ctx) return;

    const data = companies
      .map(c => {
        const snap = snapshots[c.ticker];
        const price = snap?.day?.c || 0;
        const mcap = price * c.sharesOutstanding;
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
          borderWidth: 0
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
          x: { ticks: { color: '#8b929e' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

  renderMarketReturns(barsData) {
    this.destroy('marketReturns');
    const ctx = this._getCtx('marketReturns');
    if (!ctx) return;

    const tickers = Object.keys(barsData).filter(t => barsData[t].length > 1);
    if (tickers.length === 0) return;

    // Compute total return for each ticker
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
      r.totalReturn >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
    );

    this.charts['marketReturns'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: returns.map(r => r.ticker),
        datasets: [{
          label: 'Period Return %',
          data: returns.map(r => r.totalReturn),
          backgroundColor: colors,
          borderWidth: 0
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
            ticks: { color: '#8b929e', callback: v => v.toFixed(0) + '%' },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          },
          y: { ticks: { color: '#5c6370', font: { size: 10 } }, grid: { display: false } }
        }
      })
    });
  },

  // ============= CRYPTO HOLDINGS TAB CHARTS =============

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
          borderColor: '#ffffff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#5c6370', font: { size: 12 }, padding: 16 }
          },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#1a1d23',
            bodyColor: '#5c6370',
            borderColor: '#e2e5e9',
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

  renderHoldingsPremium(companies, prices, snapshots) {
    this.destroy('holdingsPremium');
    const ctx = this._getCtx('holdingsPremium');
    if (!ctx) return;

    const data = companies
      .map(c => {
        const snap = snapshots[c.ticker];
        const price = snap?.day?.c || 0;
        const mcap = price * c.sharesOutstanding;
        const nav = DataUtils.getCryptoNAV(c, prices);
        const premium = nav > 0 ? ((mcap - nav) / nav) * 100 : 0;
        return { ticker: c.ticker, premium };
      })
      .filter(c => c.premium !== 0)
      .sort((a, b) => b.premium - a.premium);

    const colors = data.map(d =>
      d.premium >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'
    );

    this.charts['holdingsPremium'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.ticker),
        datasets: [{
          label: 'Premium/Discount to NAV %',
          data: data.map(d => d.premium),
          backgroundColor: colors,
          borderWidth: 0
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
          x: { ticks: { color: '#8b929e', font: { size: 10 } }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => v.toFixed(0) + '%'
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

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
            backgroundColor: '#f7931a',
          },
          {
            label: 'ETH Value',
            data: data.map(d => d.ethVal),
            backgroundColor: '#627eea',
          },
          {
            label: 'SOL Value',
            data: data.map(d => d.solVal),
            backgroundColor: '#9945ff',
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
            ticks: { color: '#8b929e' },
            grid: { display: false }
          },
          y: {
            stacked: true,
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

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
            pointRadius: 3
          },
          {
            label: 'ETH Holdings',
            data: HOLDINGS_HISTORY.aggregateETH,
            borderColor: '#627eea',
            backgroundColor: 'rgba(98, 126, 234, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3
          },
          {
            label: 'SOL Holdings',
            data: HOLDINGS_HISTORY.aggregateSOL,
            borderColor: '#9945ff',
            backgroundColor: 'rgba(153, 69, 255, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 3
          }
        ]
      },
      options: this._mergeOptions({
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: ctx => ctx.dataset.label + ': ' + DataUtils.formatCount(ctx.raw)
            }
          }
        },
        scales: {
          x: { ticks: { color: '#8b929e' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

  // ============= ASSET-SPECIFIC TAB CHARTS =============

  renderAssetHoldings(asset, companies, price) {
    const chartId = asset.toLowerCase() + 'Holdings';
    this.destroy(chartId);
    const ctx = this._getCtx(chartId);
    if (!ctx) return;

    const assetColor = { BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff' }[asset];

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
          borderWidth: 1
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
          x: { ticks: { color: '#8b929e' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

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
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#5c6370', font: { size: 11 }, padding: 8 }
          },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#1a1d23',
            bodyColor: '#5c6370',
            borderColor: '#e2e5e9',
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
            backgroundColor: 'rgba(107, 114, 128, 0.6)',
            borderWidth: 0
          },
          {
            label: 'Current Value',
            data: data.map(d => d.currentValue),
            backgroundColor: currentPrice > 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(156, 163, 175, 0.6)',
            borderWidth: 0
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
          x: { ticks: { color: '#8b929e' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatNumber(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

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
          borderWidth: 1
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
          x: { ticks: { color: '#8b929e' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  },

  renderAssetOverTime(asset) {
    const chartId = asset.toLowerCase() + 'OverTime';
    this.destroy(chartId);
    const ctx = this._getCtx(chartId);
    if (!ctx) return;

    const assetKey = 'aggregate' + asset;
    const historyData = HOLDINGS_HISTORY[assetKey];
    if (!historyData) return;

    const assetColor = { BTC: '#f7931a', ETH: '#627eea', SOL: '#9945ff' }[asset];

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
          pointBackgroundColor: assetColor
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
          x: { ticks: { color: '#8b929e' }, grid: { display: false } },
          y: {
            ticks: {
              color: '#8b929e',
              callback: v => DataUtils.formatCount(v)
            },
            grid: { color: 'rgba(226, 229, 233, 0.5)' }
          }
        }
      })
    });
  }
};
