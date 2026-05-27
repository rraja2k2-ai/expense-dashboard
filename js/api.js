/* Google Apps Script API communication. */
async function fetchData() {
  const response = await fetch(`${CONFIG_GAS_URL}?token=${CONFIG_TOKEN}`);
  return response.json();
}
