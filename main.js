
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
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

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

app.whenReady().then(() => {

    createWindow();

    // Check for updates automatically
    autoUpdater.checkForUpdatesAndNotify();

});

autoUpdater.on("update-available", () => {
    console.log("Update available");
});

autoUpdater.on("update-downloaded", () => {

    console.log("Update downloaded");

    autoUpdater.quitAndInstall();

});

app.whenReady().then(createWindow);