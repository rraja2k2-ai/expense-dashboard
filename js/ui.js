/* DOM-only UI helpers: dropdowns, accordions, privacy masks, and loading labels. */
function populateFilterDropdown() {
  const dates = new Set();
  (CORE_DATA_CACHE.headers || []).forEach(h => {
    const k = parsePeriod(h['Date']);
    if (k) dates.add(k);
  });
  const selector = document.getElementById('periodSelector');
  Array.from(dates).sort().reverse().forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.innerText = formatPeriodText(p);
    selector.appendChild(opt);
  });
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  if (dates.has(currentMonthStr)) selector.value = currentMonthStr;
}

function toggleAccordionDrawer(id) {
  document.getElementById(id).classList.toggle('open');
}

function togglePrivacyMask(elementId) {
  document.getElementById(elementId).classList.toggle('unblurred');
}

function setSyncStatus(text) {
  document.getElementById('systemSyncTimestamp').innerText = text;
}
