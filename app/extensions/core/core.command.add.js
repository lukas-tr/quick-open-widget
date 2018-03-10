let { registerCommand, removeCommand } = require("CommandManager");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;
const icons = require("material-ui-icons");
// const md5 = require("md5");

let commandTypes = [
  {
    type: "url",
    display: "Open a URL",
    fields: [
      {
        name: "url",
        display: "URL (with protocol)"
      }
    ]
  },
  {
    type: "program",
    display: "Execute a program",
    fields: [
      {
        name: "program",
        display: "Executable name (or full path if not in %Path%)"
      }
    ]
  },
  {
    type: "folder",
    display: "Open a folder",
    fields: [
      {
        name: "folder",
        display: "Full path to folder"
      }
    ]
  },
  {
    type: "snippet",
    display: "Copy a snippet to clipboard",
    fields: [
      {
        name: "text",
        display: "The text to copy"
      }
    ]
  }
];

// a command has:
// - type
// - description
// - name
// - icon
// - id
// - type specific fields

registerCommand({
  name: "Create (Add) a command",
  icon: "AddCircleOutline",
  description: "Add a new command",
  id: "core.command.add",
  action: async callbacks => {
    try {
      let command = {};
      let type = await callbacks.enumBox(
        "Choose a command type",
        commandTypes,
        type => type.display
      );
      command.type = type.type;
      command.name = await callbacks.textBox("Type in a name");
      if (
        await callbacks.confirmBox("Do you want to add a custom description?")
      ) {
        command.description = await callbacks.textBox("Type in a description");
      }
      if (await callbacks.confirmBox("Do you want to add a custom icon?")) {
        command.icon = await callbacks.enumBox(
          "Choose a icon",
          Object.entries(icons).map(icon => icon[0]),
          iconName => iconName
        );
      }
      command.id = `custom.command.${Math.random()
        .toString(36)
        .substring(7)
        .toUpperCase()}.${command.name
        .replace(/[ ]/g, ".")
        .toLowerCase()
        .replace(/[^a-z0-9_\.\+\-]/g, "")}`;
      for (let field of type.fields) {
        let value = await callbacks.textBox(field.display);
        command[field.name] = value;
      }
      require("electron").ipcRenderer.send("add-command", command);
    } catch (error) {
      if (error != "abort") callbacks.error(error);
    }
  }
});
