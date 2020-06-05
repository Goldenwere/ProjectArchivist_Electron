const {app, BrowserWindow} = require('electron');
const path = require('path');

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    backgroundColor: "#141414",
    width: 800,
    height: 600,
    icon: __dirname + '/../media/icon.png',
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  });

  const indexPath = path.resolve(__dirname, '../index.html')
  mainWindow.loadFile(indexPath);
})
