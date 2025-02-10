document.addEventListener('DOMContentLoaded', async function () {
  const settingsContainer = document.getElementById('settings');
  const saveButton = document.getElementById('save');

  // Load settings from config.json
  try {
    const response = await fetch('config.json');
    const configSetting = await response.json();

    // 取得 storage 內的設定值覆蓋 data.settings 內的設定值
    chrome.storage.sync.get('settings', (storageSetting) => {
      if (storageSetting.settings) {
        configSetting.settings = configSetting.settings.map(config => {
          const matchSetting = storageSetting.settings.find(storage => storage.id === config.id);
          if (matchSetting) {
            config.checked = matchSetting.checked;
          }
          return config;
        });
      }
      // 將選項新增到頁面
      configSetting.settings.forEach(setting => {
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
  } catch (error) {
    console.error('Error loading config.json:', error);
  }

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
});
