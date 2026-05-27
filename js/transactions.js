/* Lazy transaction rendering and item drilldown row interactions. */
function loadMoreReceipts() {
  const container = document.getElementById('receiptsLogList');
  const totalAvailable = CURRENT_FILTERED_HEADERS.length;
  const nextCount = Math.min(CURRENT_RENDERED_COUNT + RENDER_BATCH_SIZE, totalAvailable);
  
  const batchHeaders = CURRENT_FILTERED_HEADERS.slice(CURRENT_RENDERED_COUNT, nextCount);
  const fragment = document.createDocumentFragment();

  batchHeaders.forEach(h => {
    const key = h['Receipt ID (Key)'];
    const subItems = (CORE_DATA_CACHE.itemsByReceipt && CORE_DATA_CACHE.itemsByReceipt[key]) || [];
    const sourceDisplay = h['Payment Method (Source)'] || h['Payment Method'] || 'N/A';
    const targetDisplay = h['Target Account'] ? ` ➔ ${h['Target Account']}` : '';

    const row = document.createElement('div');
    row.className = 'tx-row-wrapper';
    row.innerHTML = `
      <div class="tx-header-trigger">
        <div class="tx-meta">
          <h4>${h['Merchant'] || 'Vendor'} <span class="badge badge-cyan tx-type-badge">${h['Transaction Type'] || 'Expense'}</span></h4>
          <p>${h['Date'] || 'N/A'} · <span class="tx-secondary">${sourceDisplay}${targetDisplay}</span> · <span class="tx-item-count">${subItems.length} items</span></p>
        </div>
        <div class="tx-amount">SGD ${parseFloat(h['SGD Total Amount'] || 0).toFixed(2)}</div>
      </div>
      <div class="tx-expanded-body">
        <div class="table-responsive">
          <table class="ledger-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th class="num-align">Qty</th>
                <th class="num-align">Price</th>
                <th class="num-align">Total</th>
              </tr>
            </thead>
            <tbody>
              ${subItems.map(i => {
                return `<tr>
                    <td><strong>${i['Item Description'] || 'N/A'}</strong></td>
                    <td><span class="badge badge-cyan">${i['Category (Specific)'] || 'General'}</span></td>
                    <td class="num-align">${parseFloat(i['Qty'] || 0)}</td>
                    <td class="num-align">SGD ${parseFloat(i['Unit Price'] || 0).toFixed(2)}</td>
                    <td class="num-align tx-item-total">SGD ${parseFloat(i['SGD Total Amount'] || i['Item Total'] || 0).toFixed(2)}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    row.querySelector('.tx-header-trigger').addEventListener('click', () => {
      row.querySelector('.tx-expanded-body').classList.toggle('open');
    });
    fragment.appendChild(row);
  });

  container.appendChild(fragment);
  CURRENT_RENDERED_COUNT = nextCount;

  const btn = document.getElementById('loadMoreTransactionsBtn');
  btn.classList.toggle('is-hidden', CURRENT_RENDERED_COUNT >= totalAvailable);
}
