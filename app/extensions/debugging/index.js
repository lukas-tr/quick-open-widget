const { registerCommand } = require("CommandManager");
// const settings = require("electron-settings");
const settings = require('electron').remote.require('electron-settings');
const { app } = require("electron").remote;

registerCommand({
  name: "Show command line arguments",
  action: async callbacks => {
    callbacks.alertBox(process.argv.join(" "))
  }
});
