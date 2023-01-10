const { app, BrowserWindow, ipcMain, dialog } = require('electron');

require('./index')
const path = require('path')
const os = require('os')
const fs = require('fs')
const Store = require('electron-store')
const store = new Store()

let mainWindow;
const rootUrl = "http://localhost:3000"

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
        },
    });

    ipcMain.handle('dialog:openDirectory', async () => {
        let properties, filters

        if (os.platform() === "darwin") {
            properties = ['openFile']
            filters = [{extensions: ['app']}]
        } else {
            properties = ['openDirectory']
            filters = []
        }

        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: properties,
            filters: filters
        })
        if (!canceled) {
            if (fs.existsSync(filePaths[0])) {
                store.set("app_path", filePaths[0])
                return
            } else {
                throw "Path doesn't exist"
            }
        } else {
            throw "Cancelled"
        }
    })

    ipcMain.on("app:redirect", (event, url) => {
        mainWindow.loadURL(rootUrl + url);
    })

    mainWindow.loadURL(rootUrl);
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

app.on("resize", function (e, x, y) {
    mainWindow.setSize(x, y);
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});