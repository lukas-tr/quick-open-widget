const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

const performanceTest = false;
if (performanceTest) {
  let i = 0;
  while (i < 10000) {
    // render 10000 commands
    i++;
    registerCommand({
      name: "Performance test " + i,
      icon: "InfoOutline",
      id: "custom.asldfkjslakfj." + i,
      action: async callbacks => {}
    });
  }
}

require("./core.exit");
require("./core.help");
require("./core.devtools");
require("./core.style.type");
require("./core.autostart");
require("./core.version");
require("./core.fullscreen");
require("./core.style.color");
require("./core.command.delete");
require("./core.store");
require("./core.command.add");
