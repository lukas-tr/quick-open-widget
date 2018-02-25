const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Toggle icons",
  icon: "Style",
  description: "Turns on or off icons",
  id: "core.style.icons",
  action: async callbacks => {
    if (settings.get("icons.show", true)) {
      settings.set("icons.show", false);
    } else {
      settings.set("icons.show", true);
    }
    callbacks.hide();
  }
});
