/* Using electron-window for initialization */

const { app } = require('electron')
const path = require('path')
const window = require('electron-window')

app.on('ready', () => {
  const mainWindow = window.createWindow({ width: 600, height: 500, webPreferences: { webSecurity: true, nodeIntegration: true } })
  const someArgs = { data: 'hi' }
  const indexPath = path.resolve(__dirname, 'index.html')

  mainWindow.showUrl(indexPath, someArgs, () => {
    console.log('window is now visible!')
  })
})
