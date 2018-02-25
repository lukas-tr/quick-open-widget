let { registerCommand, removeCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

registerCommand({
  name: "Delete (Remove) a command",
  icon: "RemoveCircleOutline",
  description: "Removes a command added by a package or the store",
  id: "core.command.delete",
  action: async callbacks => {
    try {
      let allCommands = require("CommandManager").commands;
      let commandID = await callbacks.enumBox(
        "Choose a command to be removed",
        allCommands.map(cmd => cmd.id).filter(id => !id.startsWith("core.")),
        arrayEntry => arrayEntry
      );
      removeCommand(commandID);
    } catch (error) {
      if (error != "abort") callbacks.error(error);
    }
  }
});
