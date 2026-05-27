/* Rolling six-month subcategory matrix and budget mapping render logic. */
function renderSixMonthTableMatrix(selectedPeriod) {
  const headers = CORE_DATA_CACHE.headers || [];
  const items = CORE_DATA_CACHE.items || [];
  
  let anchorDate = new Date();
  if (selectedPeriod && selectedPeriod !== 'ALL') {
    const segments = selectedPeriod.split('-');
    anchorDate = new Date(parseInt(segments[0]), parseInt(segments[1]) - 1, 1);
  }

  const monthsSequence = [];
  for (let i = 5; i >= 0; i--) {
    const target = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1);
    const periodString = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
    monthsSequence.push(periodString);
  }

  const headerPeriodMap = {};
  headers.forEach(h => { headerPeriodMap[h['Receipt ID (Key)']] = parsePeriod(h['Date']); });

  const subcatTotals = {};
  const matrixAggregator = {};

  items.forEach(item => {
    const key = item['Receipt ID (Key)'];
    const period = headerPeriodMap[key];
    if (!period || !monthsSequence.includes(period)) return;

    const subcat = item['Category (Specific)'] || 'Other';
    const amount = getItemSgdAmount(item);

    subcatTotals[subcat] = (subcatTotals[subcat] || 0) + amount;
    if (!matrixAggregator[subcat]) matrixAggregator[subcat] = {};
    matrixAggregator[subcat][period] = (matrixAggregator[subcat][period] || 0) + amount;
  });

  const top10Subcats = Object.entries(subcatTotals).sort((a, b) => b[1] - a[1]).slice(0, 10).map(entry => entry[0]);
  const headerRow = document.getElementById('matrixHeaderTargetRow');
  const bodyRow = document.getElementById('matrixBodyTargetRow');
  headerRow.innerHTML = '';
  bodyRow.innerHTML = '';

  let headerHTML = '<th>Subcategory</th>';
  monthsSequence.forEach(p => { headerHTML += `<th class="num-align">${formatPeriodText(p).split(' ')[0]}</th>`; });
  headerHTML += '<th class="num-align matrix-budget-header">Monthly Budget</th>';
  headerRow.innerHTML = headerHTML;

  if (top10Subcats.length === 0) {
    bodyRow.innerHTML = `<tr><td colspan="${monthsSequence.length + 2}" class="matrix-empty">No metrics found in this selection matrix window.</td></tr>`;
    return;
  }

  top10Subcats.forEach(subcat => {
    let rowHTML = `<td><strong>${subcat}</strong></td>`;
    monthsSequence.forEach(p => {
      const cellVal = matrixAggregator[subcat]?.[p] || 0;
      rowHTML += `<td class="num-align">$${cellVal.toFixed(2)}</td>`;
    });
    const budgetConfigObj = CORE_DATA_CACHE.budgetMap ? CORE_DATA_CACHE.budgetMap[subcat] : null;
    const budgetLimit = budgetConfigObj ? budgetConfigObj.budget : 0;
    rowHTML += `<td class="num-align matrix-budget-cell">$${budgetLimit.toFixed(2)}</td>`;
    
    const tr = document.createElement('tr');
    tr.innerHTML = rowHTML;
    bodyRow.appendChild(tr);
  });
}
