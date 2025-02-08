document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || [];
    settings.forEach(setting => {
      const element = document.querySelector(`#${setting.id}`);
      if (element) {
        element.checked = setting.checked;
      }
    });
  });
});