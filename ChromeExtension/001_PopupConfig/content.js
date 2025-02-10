console.log('a');
chrome.storage.sync.get(['settings'], (result) => {
  console.log('c');
  if (chrome.runtime.lastError) {
    console.error('Error retrieving settings:', chrome.runtime.lastError);
    return;
  }
  const settings = result.settings || [];
  settings.forEach(setting => {
    if (setting.checked === true) {
      const idElement = document.createElement('div');
      idElement.textContent = `ID: ${setting.id}`;
      document.body.appendChild(idElement);
    }
  });
});
console.log('d');