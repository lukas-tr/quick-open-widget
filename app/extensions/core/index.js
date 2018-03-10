const { registerCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

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
