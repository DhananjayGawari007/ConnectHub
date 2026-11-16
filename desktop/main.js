const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow;

function checkServerReady(url, maxRetries = 30, interval = 500) {
  return new Promise((resolve) => {
    let retries = 0;
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 304) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };

    const retry = () => {
      retries++;
      if (retries >= maxRetries) {
        resolve(false);
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    title: 'ConnectHub',
    backgroundColor: '#111214',
    autoHideMenuBar: true,
    show: false, // Show when ready to prevent white flash
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Check if frontend dev server is up on port 3000, otherwise load backend 5000
  const isViteUp = await checkServerReady('http://localhost:3000');
  const targetUrl = isViteUp ? 'http://localhost:3000' : 'http://localhost:5000';

  console.log(`[ConnectHub Desktop] Loading ${targetUrl}`);
  mainWindow.loadURL(targetUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default OS browser instead of Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
