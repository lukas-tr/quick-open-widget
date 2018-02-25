const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Toggle fullscreen",
  icon: "Fullscreen",
  description:
    "Enables or disables fullscreen (currently " +
    (settings.get("fullscreen", false) ? "disabled" : "enabled") +
    ")",
  id: "core.fullscreen",
  action: async callbacks => {
    if (!settings.get("fullscreen", false)) {
      settings.set("fullscreen", true);
      await callbacks.updateDescription(
        "Enables or disables fullscreen (currently enabled)"
      );
    } else {
      settings.set("fullscreen", false);
      await callbacks.updateDescription(
        "Enables or disables fullscreen (currently disabled)"
      );
    }
    callbacks.hide();
  }
});
