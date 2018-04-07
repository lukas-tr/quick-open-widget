const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Version",
  icon: "InfoOutline",
  type: "action",
  description: "Displays app version information",
  id: "core.version",
  action: async callbacks => {
    await callbacks.alertBox(app.getName() + " v" + app.getVersion());
    callbacks.hide();
  }
});
