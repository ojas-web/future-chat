const { app, BrowserWindow } = require("electron");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false
        }
    });

    // IMPORTANT: load your Render URL here
    win.loadURL("https://future-chat-production.up.railway.app/chat");
}

app.whenReady().then(createWindow);