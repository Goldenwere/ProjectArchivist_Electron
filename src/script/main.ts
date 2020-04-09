import { app, BrowserWindow } from "electron";
import * as path from "path";
let mainWindow: Electron.BrowserWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    backgroundColor: "#141414",
    width: 620,
    height: 580,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  });
  const indexPath = path.resolve(__dirname, '../index.html')
  mainWindow.loadFile(indexPath);
  mainWindow.webContents.openDevTools();
})
