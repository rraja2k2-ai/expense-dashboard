/* Chart.js rendering for macro category share and subcategory budget comparison. */
function renderCharts(filteredHeaders, filteredItems) {
  const macroMap = {};
  filteredHeaders.forEach(h => {
    if (isExcludedExpenseType(h['Transaction Type'])) return;
    const cat = h['Category (Primary)'] || 'Other';
    macroMap[cat] = (macroMap[cat] || 0) + getSgdAmount(h);
  });

  if (INITIALIZED_CHARTS.macro) INITIALIZED_CHARTS.macro.destroy();
  INITIALIZED_CHARTS.macro = new Chart(document.getElementById('chartCanvasMacroShare').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(macroMap),
      datasets: [{ data: Object.values(macroMap), backgroundColor: CHART_COLORS, borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#fff', font: { size: 10 } } } } }
  });

  const subcatMap = {};
  filteredItems.forEach(item => {
    const label = item['Category (Specific)'] || 'Other';
    subcatMap[label] = (subcatMap[label] || 0) + getItemSgdAmount(item);
  });

  const top10 = Object.entries(subcatMap).sort((a,b)=>b[1]-a[1]).slice(0, 10);
  const labels = top10.map(p => p[0]);
  const actuals = top10.map(p => p[1]);
  const targets = labels.map(l => (CORE_DATA_CACHE.budgetMap && CORE_DATA_CACHE.budgetMap[l] ? CORE_DATA_CACHE.budgetMap[l].budget : 0));

  if (INITIALIZED_CHARTS.subcat) INITIALIZED_CHARTS.subcat.destroy();
  INITIALIZED_CHARTS.subcat = new Chart(document.getElementById('chartCanvasSubcategories').getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Target Budget Limit', data: targets, type: 'line', borderColor: '#ef476f', borderWidth: 2, fill: false, pointRadius: 3 },
        { label: 'Spent Realized', data: actuals, backgroundColor: '#00b4d8', borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        x: { ticks: { color: '#94a3b8', font: { size: 10 } } }
      }
    }
  });
}
