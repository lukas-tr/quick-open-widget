const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Toggle Dev Tools",
  description: "Toggles the integrated Developer Tools for debugging",
  icon: "BugReport",
  id: "core.devtools",
  action: async callbacks => {
    require("electron")
      .remote.getCurrentWindow()
      .toggleDevTools();
  }
});
