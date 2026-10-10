const { app, BrowserWindow, Menu, powerSaveBlocker, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let powerSaveId = null;

function createWindow() {
  const appIcon = process.platform === 'win32'
    ? path.join(__dirname, '../public/icon.ico')
    : path.join(__dirname, '../public/logo.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Military Canteen Services - KOT Kitchen POS Terminal',
    backgroundColor: '#16201c',
    icon: appIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    autoHideMenuBar: true
  });

  // Block Windows sleep while KOT POS is open
  try {
    powerSaveId = powerSaveBlocker.start('prevent-app-suspension');
    console.log('[ELECTRON] Power save blocker active (ID:', powerSaveId, ')');
  } catch (e) {
    console.warn('[ELECTRON] Power save blocker warning:', e.message);
  }

  // Load URL or local build
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const startUrl = process.env.KOT_SERVER_URL || (isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist/index.html')}`);

  console.log('[ELECTRON] Loading KOT POS from:', startUrl);

  if (isDev && !process.env.KOT_SERVER_URL) {
    mainWindow.loadURL(startUrl).catch(() => {
      // If dev server not running, fallback to built dist
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (powerSaveId !== null && powerSaveBlocker.isStarted(powerSaveId)) {
    powerSaveBlocker.stop(powerSaveId);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
