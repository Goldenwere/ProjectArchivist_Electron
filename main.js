/* Using electron-window for initialization */

const { app } = require('electron')
const path = require('path')
const window = require('electron-window')
/*
app.on('ready', () => {
  const mainWindow = window.createWindow({
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
*/
/* To be removed */
app.on('ready', () => {
  const mainWindow = window.createWindow({
    backgroundColor: "#141414",
    width: 800,
    height: 400,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  });
  const someArgs = { data: 'hi' }
  const indexPath = path.resolve(__dirname, 'itemprop.html')

  mainWindow.showUrl(indexPath, someArgs, () => {
    console.log('window is now visible!')
  })
})
