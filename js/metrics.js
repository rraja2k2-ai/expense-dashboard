/* KPI, account drawer, and savings metric rendering. */
function renderConsolidatedMetrics(period, filteredHeaders) {
  const meta = CORE_DATA_CACHE.meta || { financialAccounts: [], fixedIncomeMap: {} };
  const accounts = meta.financialAccounts || [];
  const totalNetWorthSgd = meta.netWorthSGD || 0;
  
  let runningSavingsSgd = 0, runningSavingsInr = 0;
  let runningDebtSgd = 0, runningDebtInr = 0;

  let htmlSgdSavings = createTableHeaderHTML();
  let htmlInrSavings = createTableHeaderHTML();
  let htmlSgdDebt = createTableHeaderHTML();
  let htmlInrDebt = createTableHeaderHTML();

  accounts.forEach(acc => {
    const val = acc.balance || 0;
    const currency = acc.currency || 'SGD';
    const totalInSgd = acc.weightSGD || val;
    const group = acc.group; 
    const exchangeRate = val !== 0 ? (totalInSgd / val) : (currency === 'INR' ? 0.016 : 1.0);

    const rowMarkup = `<tr>
      <td><strong>${acc.name}</strong></td>
      <td><span class="badge badge-cyan">${group}</span></td>
      <td class="num-align">${currency}</td>
      <td class="num-align">${formatLocaleAmount(val, 'en-SG')}</td>
      <td class="num-align">${formatLocaleAmount(totalInSgd, 'en-SG')}</td>
      <td class="num-align">${exchangeRate.toFixed(4)}</td>
    </tr>`;

    if (group === "Savings") {
      if (currency === "SGD") { runningSavingsSgd += val; htmlSgdSavings += rowMarkup; }
      else { runningSavingsInr += val; htmlInrSavings += rowMarkup; }
    } else {
      if (currency === "SGD") { runningDebtSgd += val; htmlSgdDebt += rowMarkup; }
      else { runningDebtInr += val; htmlInrDebt += rowMarkup; }
    }
  });

  document.getElementById('metricNetWorth').innerText = `$ ${formatLocaleAmount(totalNetWorthSgd, 'en-SG')} SGD`;
  
  document.getElementById('valSavingsSgd').innerText = `$ ${formatLocaleAmount(runningSavingsSgd, 'en-SG')} SGD ▾`;
  document.getElementById('valSavingsInr').innerText = `₹ ${formatLocaleAmount(runningSavingsInr, 'en-IN')} INR ▾`;
  document.getElementById('valLiabilitySgd').innerText = `$ ${formatLocaleAmount(Math.abs(runningDebtSgd), 'en-SG')} SGD ▾`;
  document.getElementById('valLiabilityInr').innerText = `₹ ${formatLocaleAmount(Math.abs(runningDebtInr), 'en-IN')} INR ▾`;

  document.getElementById('tableSavingsSgd').innerHTML = htmlSgdSavings + '</tbody></table>';
  document.getElementById('tableSavingsInr').innerHTML = htmlInrSavings + '</tbody></table>';
  document.getElementById('tableLiabilitySgd').innerHTML = htmlSgdDebt + '</tbody></table>';
  document.getElementById('tableLiabilityInr').innerHTML = htmlInrDebt + '</tbody></table>';

  const incomeVal = period === 'ALL' ? Object.values(meta.fixedIncomeMap || {}).reduce((a,b)=>a+b,0) : ((meta.fixedIncomeMap && meta.fixedIncomeMap['Regular Salary']) || 12700);
  document.getElementById('metricIncome').innerText = `SGD ${formatLocaleAmount(incomeVal, 'en-SG')}`;

  const expenseVal = filteredHeaders.reduce((s, h) => {
    if (isExcludedExpenseType(h['Transaction Type'])) return s;
    return s + getSgdAmount(h);
  }, 0);
  
  document.getElementById('metricExpense').innerText = `SGD ${formatLocaleAmount(expenseVal, 'en-SG')}`;

  const netSavings = incomeVal - expenseVal;
  const savingsPct = incomeVal > 0 ? ((netSavings / incomeVal) * 100).toFixed(1) : 0;
  document.getElementById('metricSavingsRate').innerText = `SGD ${formatLocaleAmount(netSavings, 'en-SG')}`;
  document.getElementById('subSavingsRateBadge').innerHTML = `<span class="badge ${netSavings >= 0 ? 'badge-emerald' : 'badge-rose'}">${savingsPct}% Saved Margin</span>`;
}

function createTableHeaderHTML() {
  return `<table class="ledger-table">
    <thead>
      <tr>
        <th>Account</th>
        <th>Group Mapping</th>
        <th class="num-align">Currency</th>
        <th class="num-align">Foreign Balance</th>
        <th class="num-align">Weight in SGD</th>
        <th class="num-align">Ex. Rate</th>
      </tr>
    </thead>
    <tbody>`;
}
