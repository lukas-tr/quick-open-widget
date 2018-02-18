const electron = require("electron");
const {
  BrowserWindow,
  app,
  Tray,
  Menu,
  ipcMain,
  globalShortcut,
  appUserModelId
} = electron;
const AutoLaunch = require("auto-launch");
const path = require("path");
const url = require("url");
const iconpath = path.join(__dirname, "icon.ico");
const settings = require("electron-settings");
const request = require("request-promise-native");
const { autoUpdater } = require("electron-updater");
const notify = require("electron-main-notification");

const isDev = require("electron-is-dev");
const log = require("electron-log");

require("electron-debug")({ showDevTools: true });
if (isDev) require("electron-reload")(__dirname);

log.info("App starting...");

let mainWindow: Electron.BrowserWindow; // popup window for tray
let trayIcon: Electron.Tray;
let trayContextMenu: Electron.Menu;
let mainHeight = 400;
let mainWidth = 600;

const isSecondInstance = app.makeSingleInstance(
  (commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  }
);
if (isSecondInstance) {
  app.quit();
}

const initializeTray = () => {
  trayIcon = new Tray(iconpath);
  trayContextMenu = Menu.buildFromTemplate([
    {
      label: "Show",
      click: () => {
        showMainWindow();
      }
    },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        globalShortcut.unregisterAll();
        app.quit();
      }
    }
  ]);
  trayIcon.setContextMenu(trayContextMenu);
  trayIcon.setToolTip("CTRL + SHIFT + SPACE to toggle");
  trayIcon.on("click", event => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      showMainWindow();
    }
  });
};
//#endregion

const setSettings = () => {
  const defaultSettings = [
    ["theme.primary", "blue"],
    ["theme.secondary", "green"],
    ["theme.type", "light"],
    ["autostart", false],
    ["connect.autocheckin", false]
  ];
  const setDefaults = () =>
    defaultSettings.forEach(element => {
      if (!settings.has(element[0])) {
        settings.set(element[0], element[1]);
        console.log("set ", element[0]);
      }
      settings.watch(element[0], (newVal, oldVal) => {
        console.log(element[0], ":", oldVal, "=>", newVal);
        if (newVal == undefined) {
          settings.set(element[0], oldVal); //todo: find bug that causes reset and remove this
        }
      });
    });
  setDefaults();
  //listen for settings changes
  settings.watch("autostart", async enable => {
    let applicationAutoLauncher = new AutoLaunch({
      name: "Quick Open Widget"
    });
    if (enable) {
      applicationAutoLauncher.enable();
    } else {
      applicationAutoLauncher.disable();
    }
    let isEnabled = await applicationAutoLauncher.isEnabled();
    if (isEnabled == enable) {
      return;
    }
    if (enable) {
      applicationAutoLauncher.enable();
    } else {
      applicationAutoLauncher.disable();
    }
  });
};

const createGlobalShortcuts = () => {
  globalShortcut.register("CommandOrControl+Shift+Space", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      showMainWindow();
    }
  });
};

const showMainWindow = () => {
  const { screen } = require("electron");
  let fullscreen = settings.get("fullscreen", false);
  let cursorPoint = screen.getCursorScreenPoint();
  let display = screen.getDisplayNearestPoint(cursorPoint);
  if (fullscreen) {
    mainWindow.setBounds(display.bounds);
  } else {
    let bounds = display.bounds;
    bounds.x = bounds.x + bounds.width / 2 - mainWidth / 2;
    bounds.y = bounds.y + bounds.height / 2 - mainHeight / 2;
    bounds.width = mainWidth;
    bounds.height = mainHeight;
    mainWindow.setBounds(bounds);
  }
  mainWindow.show();
  mainWindow.focus();
};

const createWindow = () => {
  setSettings();
  listenForUpdate();
  mainWindow = new BrowserWindow({
    width: mainWidth,
    height: mainHeight,
    icon: iconpath,
    acceptFirstMouse: true,
    alwaysOnTop: true,
    frame: false,
    movable: true,
    thickFrame: false,
    resizable: false,
    skipTaskbar: true
  });
  mainWindow.hide();
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );
  createGlobalShortcuts();
  initializeTray();

  mainWindow.on("close", event => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on("minimize", event => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("blur", event => {
    if (isDev) return;
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("show", () => {
    trayIcon.setHighlightMode("always");
  });
};

app.on("ready", createWindow);

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("exit-application", () => {
  app.isQuitting = true;
  globalShortcut.unregisterAll();
  app.quit();
});

ipcMain.on("hide-window", () => {
  mainWindow.hide();
});

const listenForUpdate = () => {
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
  });
  autoUpdater.on("update-available", info => {
    log.info("Update available.", info);
  });
  autoUpdater.on("update-not-available", info => {
    log.info("Update not available.", info);
  });
  autoUpdater.on("error", err => {
    log.info("Error in auto-updater. ", err);
  });
  autoUpdater.on("download-progress", progressObj => {
    log.info("Download progress: ", progressObj);
  });
  autoUpdater.on("update-downloaded", info => {
    log.info("Update downloaded: ", info);
    autoUpdater.quitAndInstall();
  });
  autoUpdater.checkForUpdatesAndNotify();
};
