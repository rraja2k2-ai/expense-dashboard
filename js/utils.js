/* Date parsing, currency formatting, and shared calculation helpers. */
function parsePeriod(dStr) {
  if (!dStr) return null;
  const p = String(dStr).split('/');
  return p.length >= 3 ? `${p[2]}-${p[1].padStart(2, '0')}` : null;
}

function formatPeriodText(pToken) {
  const t = pToken.split('-');
  return new Date(+t[0], +t[1]-1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function parseDateMs(dStr) {
  if (!dStr) return 0;
  const p = String(dStr).split('/');
  return p.length < 3 ? 0 : new Date(+p[2], +p[1]-1, +p[0]).getTime();
}

function formatLocaleAmount(value, locale) {
  return value.toLocaleString(locale, { minimumFractionDigits: 2 });
}

function normalizeTransactionType(value) {
  return String(value || '').trim().toLowerCase();
}

function isExcludedExpenseType(value) {
  return EXCLUDED_EXPENSE_TYPES.has(normalizeTransactionType(value));
}

function getSgdAmount(record) {
  return parseFloat(record['SGD Total Amount']) || 0;
}

function getItemSgdAmount(item) {
  return parseFloat(item['SGD Total Amount'] || item['Item Total']) || 0;
}
