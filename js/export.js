/**
 * Export Module - JPEG and CSV export for all charts
 */

const ExportUtils = {
  /**
   * Export a chart canvas as JPEG image
   */
  exportChartAsJPEG(chartId, filename) {
    const chartInstance = ChartManager.charts[chartId];
    if (!chartInstance) {
      App.showToast('Chart not found', 'error');
      return;
    }

    const canvas = chartInstance.canvas;
    // Create a temporary canvas with white background for JPEG
    const tempCanvas = document.createElement('canvas');
    const padding = 20;
    tempCanvas.width = canvas.width + padding * 2;
    tempCanvas.height = canvas.height + padding * 2 + 40;

    const ctx = tempCanvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw title
    const chartContainer = canvas.closest('.chart-panel');
    const title = chartContainer?.querySelector('h3')?.textContent || chartId;
    ctx.fillStyle = '#1a1d23';
    ctx.font = 'bold 14px Inter, -apple-system, sans-serif';
    ctx.fillText(title, padding, 26);

    // Draw timestamp
    ctx.fillStyle = '#8b929e';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Treasury Analytics Dashboard | ' + new Date().toLocaleString(), padding, tempCanvas.height - 10);

    // Draw chart
    ctx.drawImage(canvas, padding, 40);

    // Convert to JPEG and download
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

  /**
   * Export chart data as CSV
   */
  exportChartAsCSV(chartId, filename) {
    const chartInstance = ChartManager.charts[chartId];
    if (!chartInstance) {
      // Check if it's a table export
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

    // Build CSV
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

  /**
   * Export a table as CSV
   */
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

  /**
   * Generate and download CSV content
   */
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
