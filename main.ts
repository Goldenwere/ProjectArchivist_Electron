/* Using electron-window for initialization */

import { app, BrowserWindow } from 'electron'
import path = require('path');
import window = require('electron-window');

app.on('ready', () => {
  const mainWindow: BrowserWindow = window.createWindow({
    backgroundColor: "#141414",
    width: 620,
    height: 580,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  });
  const someArgs = { data: 'hi' }
  const indexPath = path.resolve(__dirname, 'index.html')
})
