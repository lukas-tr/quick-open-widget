const electron = require("electron");
const {
  BrowserWindow,
  app,
  Tray,
  Menu,
  ipcMain,
  globalShortcut,
  appUserModelId,
  protocol
} = electron;
const AutoLaunch = require("auto-launch");
const path = require("path");
const url = require("url");
const iconpath = path.join(__dirname, "icon.ico");
const settings = require("electron-settings");
const request = require("request-promise-native");
const { autoUpdater } = require("electron-updater");
const notify = require("electron-main-notification");
const axios = require("axios");
const csv = require("csvtojson");
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

function logInDevTools(s) {
  console.log(s);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.executeJavaScript(
      `console.log("${s
        .toString()
        .split("\\")
        .join("\\\\")}")`
    );
  }
}

const isSecondInstance = app.makeSingleInstance((argv, workingDirectory) => {
  log.log("Second instance detected");
  if (mainWindow) {
    handleFilesAndProtocols(argv);
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
if (isSecondInstance) {
  app.quit();
}

const addCommand = (command, list) => {
  //returns new list
  if (!command.id) {
    log.error("Command has no id");
    return list;
  }
  if (command.id.toLowerCase().startsWith("core.")) {
    //disallow commands starting with core (to prevent overriding)
    log.error("Command can't override core commands");
    return list;
  }
  //override previous command with same id
  list = list.filter(c => c.id != command.id);
  log.log("Pushing command: ", command);
  list.push(command);
  settings.set("user.commands", list); //update it in case of a parse error later on
  return list;
};

const handleFilesAndProtocols = async args => {
  log.log("handling files and protocols");
  let existingCommands = settings.get("user.commands", []);
  try {
    for (let arg of args) {
      log.log("Processing arg: ", arg);
      if (arg.toLowerCase().startsWith("quickopenwidget://")) {
        log.log("Detected protocol");
        let url = arg.replace(/^(quickopenwidget:\/\/)/, "");
        try {
          let { data } = await axios.get(url); //automatic json transform
          try {
            data.commands.forEach(
              command =>
                (existingCommands = addCommand(command, existingCommands))
            );
          } catch (error) {
            log.error(error);
            csv()
              .fromString(data)
              .on("json", command => {
                existingCommands = addCommand(command, existingCommands);
              });
          }
        } catch (error) {
          log.error(error);
        }
      } else if (arg.toLowerCase().endsWith("quickopenjson")) {
        log.log("Detected json");
        var fs = require("fs");
        var obj;
        fs.readFile(arg, "utf8", function(err, data) {
          if (err) {
            log.error(err);
            return;
          }
          obj = JSON.parse(data);
          obj.commands.forEach(command => {
            existingCommands = addCommand(command, existingCommands);
          });
        });
      } else if (arg.toLowerCase().endsWith("quickopencsv")) {
        log.log("Detected csv");
        csv()
          .fromFile(arg)
          .on("json", command => {
            existingCommands = addCommand(command, existingCommands);
          });
      }
    }
  } catch (error) {
    log.error(error);
  }
  if (!isDev)
    log.log(
      "Default protocol client succeeded: " +
        app.setAsDefaultProtocolClient("quickopenwidget")
    );
};

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
  handleFilesAndProtocols(process.argv);
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

ipcMain.on("add-command", (event, command) => {
  let existingCommands = settings.get("user.commands", []);
  log.info("adding command: ", command);
  addCommand(command, existingCommands);
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
