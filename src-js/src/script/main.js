const {app, BrowserWindow} = require('electron');
const path = require('path');

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    backgroundColor: "#141414",
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  });
  //mainWindow.webContents.toggleDevTools();
  const indexPath = path.resolve(__dirname, '../index.html')
  mainWindow.loadFile(indexPath);
})
