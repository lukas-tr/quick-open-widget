const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Exit Application",
  description: "Closes this application",
  type: "action",
  icon: "PowerSettingsNew",
  id: "core.exit",
  action: async callbacks => {
    require("electron").ipcRenderer.send("exit-application");
  }
});
