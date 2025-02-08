document.addEventListener('DOMContentLoaded', function () {
  const settingsContainer = document.getElementById('settings');
  const saveButton = document.getElementById('save');

  // Load settings from config.json
  fetch('config.json')
    .then(response => response.json())
    .then(data => {
      data.settings.forEach(setting => {
        const div = document.createElement('div');
        div.className = 'setting';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = setting.id;
        checkbox.checked = setting.checked;
        const label = document.createElement('label');
        label.htmlFor = setting.id;
        label.textContent = setting.name;
        div.appendChild(checkbox);
        div.appendChild(label);
        settingsContainer.appendChild(div);
      });
    });

  // Save settings to Chrome storage
  saveButton.addEventListener('click', () => {
    const settings = [];
    document.querySelectorAll('.setting input').forEach(input => {
      settings.push({
        id: input.id,
        checked: input.checked
      });
    });
    chrome.storage.sync.set({ settings }, () => {
      console.log('Settings saved');
    });
  });

  // Load saved settings from Chrome storage
  chrome.storage.sync.get('settings', (data) => {
    if (data.settings) {
      data.settings.forEach(savedSetting => {
        const checkbox = document.getElementById(savedSetting.id);
        if (checkbox) {
          checkbox.checked = savedSetting.checked;
        }
      });
    }
  });
});
