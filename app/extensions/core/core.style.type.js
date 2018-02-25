const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Toggle theme type color",
  description: "Changes the type color",
  icon: "Style",
  id: "core.style.type",
  action: async callbacks => {
    if (settings.get("color.type", "dark") == "dark") {
      settings.set("color.type", "light");
    } else {
      settings.set("color.type", "dark");
    }
    callbacks.hide();
  }
});
