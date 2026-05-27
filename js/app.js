/* App initialization, orchestration pipeline, and top-level event wiring. */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    CORE_DATA_CACHE = await fetchData();
    if (!CORE_DATA_CACHE.ok) throw new Error(CORE_DATA_CACHE.error || "Malformed backend response");
    
    setSyncStatus(`Sync: ${new Date(CORE_DATA_CACHE.lastUpdated).toLocaleTimeString()}`);
    populateFilterDropdown();
    runOperationalPipeline();
  } catch (err) {
    setSyncStatus(`Error: ${err.message}`);
  }
});

function runOperationalPipeline() {
  const period = document.getElementById('periodSelector').value;
  const filterLabel = period === 'ALL' ? 'Total' : formatPeriodText(period);
  
  document.getElementById('titleIncomeLabel').innerText = `${filterLabel} Income 👁`;
  document.getElementById('titleExpenseLabel').innerText = `${filterLabel} Outflows`;

  const filteredHeaders = (CORE_DATA_CACHE.headers || []).filter(h => period === 'ALL' || parsePeriod(h['Date']) === period);
  const matchedKeys = new Set(filteredHeaders.map(h => h['Receipt ID (Key)']));
  const filteredItems = (CORE_DATA_CACHE.items || []).filter(i => matchedKeys.has(i['Receipt ID (Key)']));

  CURRENT_FILTERED_HEADERS = filteredHeaders.slice().sort((a,b) => parseDateMs(b['Date']) - parseDateMs(a['Date']));
  CURRENT_RENDERED_COUNT = 0;

  renderConsolidatedMetrics(period, filteredHeaders);
  renderCharts(filteredHeaders, filteredItems);
  renderSixMonthTableMatrix(period); 
  
  document.getElementById('receiptsLogList').innerHTML = '';
  loadMoreReceipts();
}
