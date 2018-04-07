const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Help",
  description: "Opens the help page",
  type: "action",
  icon: "HelpOutline",
  id: "core.help",
  action: async callbacks => {
    await callbacks.openURL("https://github.com/lukas-tr/quick-open-widget");
    callbacks.hide();
  }
});