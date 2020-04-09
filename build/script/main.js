"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
let mainWindow;
electron_1.app.on('ready', () => {
    mainWindow = new electron_1.BrowserWindow({
        backgroundColor: "#141414",
        width: 620,
        height: 580,
        webPreferences: {
            webSecurity: true,
            nodeIntegration: true
        }
    });
    const indexPath = path.resolve(__dirname, '../index.html');
    mainWindow.loadFile(indexPath);
    mainWindow.webContents.openDevTools();
});
//# sourceMappingURL=main.js.map