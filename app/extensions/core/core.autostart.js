const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Toggle autostart",
  icon: "Autorenew",
  description:
    "Enables or disables autostart (currently " +
    (settings.get("autostart", false) ? "disabled" : "enabled") +
    ")",
  id: "core.autostart",
  action: async callbacks => {
    if (!settings.get("autostart", false)) {
      settings.set("autostart", true);
      await callbacks.updateDescription(
        "Enables or disables autostart (currently enabled)"
      );
      await callbacks.alertBox(
        "Make sure autostart isn't disabled in task manager"
      );
    } else {
      settings.set("autostart", false);
      await callbacks.updateDescription(
        "Enables or disables autostart (currently disabled)"
      );
    }
    callbacks.hide();
  }
});
