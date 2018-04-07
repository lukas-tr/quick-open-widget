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
      type: "action",
      icon: "InfoOutline",
      id: "custom.asldfkjslakfj." + i,
      action: async callbacks => {}
    });
  }
}

require("./core.exit");
require("./core.autostart");
require("./core.fullscreen");
require("./core.store");

// Command management
require("./core.command.delete");
require("./core.command.add");
require("./core.command.export");

// Customization
require("./core.style.color");
require("./core.style.type");

// Information and debugging
require("./core.version");
require("./core.help");
require("./core.devtools");
