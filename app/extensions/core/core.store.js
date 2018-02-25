const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Open Store",
  description: "Opens the Store in the default browser",
  icon: "Shop",
  id: "core.store",
  action: async callbacks => {
    await callbacks.openURL("https://quick-open-widget.firebaseapp.com/");
    callbacks.hide();
  }
});
