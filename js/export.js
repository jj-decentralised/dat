/**
 * Export Module - JPEG and CSV export for all charts (Dark Theme)
 */

const ExportUtils = {
  exportChartAsJPEG(chartId, filename) {
    const chartInstance = ChartManager.charts[chartId];
    if (!chartInstance) {
      App.showToast('Chart not found', 'error');
      return;
    }

    const canvas = chartInstance.canvas;
    const tempCanvas = document.createElement('canvas');
    const padding = 20;
    tempCanvas.width = canvas.width + padding * 2;
    tempCanvas.height = canvas.height + padding * 2 + 40;

    const ctx = tempCanvas.getContext('2d');

    // Dark background matching the dashboard theme
    ctx.fillStyle = '#161820';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw title
    const chartContainer = canvas.closest('.chart-card');
    const title = chartContainer?.querySelector('.chart-title')?.textContent || chartId;
    ctx.fillStyle = '#e8eaed';
    ctx.font = 'bold 14px Inter, -apple-system, sans-serif';
    ctx.fillText(title, padding, 26);

    // Draw timestamp
    ctx.fillStyle = '#6b7080';
    ctx.font = '11px Inter, -apple-system, sans-serif';
    ctx.fillText('Blockworks Treasury Analytics | ' + new Date().toLocaleString(), padding, tempCanvas.height - 10);

    // Draw chart
    ctx.drawImage(canvas, padding, 40);

    tempCanvas.toBlob((blob) => {
      if (!blob) {
        App.showToast('Failed to generate image', 'error');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (filename || chartId) + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      App.showToast('Chart exported as JPEG', 'success');
    }, 'image/jpeg', 0.95);
  },

  exportChartAsCSV(chartId, filename) {
    const chartInstance = ChartManager.charts[chartId];
    if (!chartInstance) {
      if (chartId.endsWith('Table')) {
        this.exportTableAsCSV(chartId, filename);
        return;
      }
      App.showToast('Chart not found', 'error');
      return;
    }

    const data = chartInstance.data;
    const labels = data.labels || [];
    const datasets = data.datasets || [];

    if (labels.length === 0 || datasets.length === 0) {
      App.showToast('No data to export', 'error');
      return;
    }

    const headers = ['Label', ...datasets.map(ds => ds.label || 'Value')];
    const rows = labels.map((label, i) => {
      const values = datasets.map(ds => {
        const val = ds.data[i];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return val.y !== undefined ? val.y : JSON.stringify(val);
        return val;
      });
      return [label, ...values];
    });

    this._downloadCSV(headers, rows, filename || chartId);
  },

  exportTableAsCSV(tableId, filename) {
    let tableBody, tableHead;

    if (tableId === 'overviewTable') {
      tableBody = document.getElementById('companiesTableBody');
      tableHead = document.querySelector('#companiesTable thead');
    } else if (tableId === 'btcTable') {
      tableBody = document.getElementById('btcTableBody');
      tableHead = tableBody?.closest('table')?.querySelector('thead');
    } else if (tableId === 'ethTable') {
      tableBody = document.getElementById('ethTableBody');
      tableHead = tableBody?.closest('table')?.querySelector('thead');
    } else if (tableId === 'solTable') {
      tableBody = document.getElementById('solTableBody');
      tableHead = tableBody?.closest('table')?.querySelector('thead');
    }

    if (!tableBody || !tableHead) {
      App.showToast('Table not found', 'error');
      return;
    }

    const headers = Array.from(tableHead.querySelectorAll('th')).map(th => th.textContent.trim());
    const rows = Array.from(tableBody.querySelectorAll('tr')).map(tr =>
      Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
    );

    this._downloadCSV(headers, rows, filename || tableId);
  },

  _downloadCSV(headers, rows, filename) {
    const csvContent = [
      headers.map(h => this._escapeCSV(h)).join(','),
      ...rows.map(row => row.map(v => this._escapeCSV(String(v))).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (filename || 'export') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.showToast('Data exported as CSV', 'success');
  },

  _escapeCSV(str) {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }
};
