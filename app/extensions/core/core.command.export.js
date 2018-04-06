let { registerCommand, removeCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;
const icons = require("material-ui-icons");
const LZString = require("lz-string");

// a command has:
// - type
// - description
// - name
// - icon
// - id
// - type specific fields

registerCommand({
  name: "Export commands",
  icon: "ImportExport",
  description: "Create a package for sharing your commands",
  id: "core.command.export",
  action: async callbacks => {
    try {
      const packageToExport = {
        commands: []
      };
      const exportMethods = [
        {
          display: "Copy sharing string (for submitting to the store)",
          execute: async () => {
            await callbacks.copyToClipboard(
              LZString.compressToUTF16(JSON.stringify(packageToExport))
            );
            return await callbacks.alertBox(
              "Sharing string copied to clipboard"
            );
          }
        },
        {
          display: "Copy JSON",
          execute: async () => {
            await callbacks.copyToClipboard(JSON.stringify(packageToExport));
            return await callbacks.alertBox("JSON copied to clipboard");
          }
        }
        // {
        //   display: "Export as quickopenjson (recommended)"
        // },
        // {
        //   display: "Export as quickopencsv"
        // }
      ];
      do {
        packageToExport.name = await callbacks.textBox(
          "Type your package name"
        );
      } while (packageToExport.name.length == 0);
      do {
        packageToExport.version = await callbacks.textBox(
          "Type your package version"
        );
      } while (packageToExport.version.length == 0);
      do {
        packageToExport.id = await callbacks.textBox("Type your package id");
      } while (packageToExport.id.length == 0);
      do {
        packageToExport.author = await callbacks.textBox("Type your name");
      } while (packageToExport.author.length == 0);
      let stillChoosing = true;
      let allCommands = require("CommandManager").commands;
      while (stillChoosing) {
        let chosenCommand = await callbacks.enumBox(
          "Choose a command to be exported",
          allCommands.filter(
            cmd => !cmd.id.startsWith("core.") && !cmd.id.startsWith("user.")
          ),
          arrayEntry => arrayEntry.id
        );
        packageToExport.commands.push(chosenCommand);
        stillChoosing = await callbacks.confirmBox(
          "Do you want to add additional commands?"
        );
      }
      const exportMethod = await callbacks.enumBox(
        "Choose a export method",
        exportMethods,
        method => method.display
      );
      await exportMethod.execute();
    } catch (error) {
      if (error != "abort") callbacks.error(error);
    }
  }
});
