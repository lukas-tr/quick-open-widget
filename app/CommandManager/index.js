const { lstatSync, readdirSync } = require("fs");
const { join, dirname } = require("path");
require("app-module-path").addPath(dirname(__dirname));
const opn = require("opn");
const csv = require("csvtojson");
const validUrl = require("valid-url");
const settings = require("electron").remote.require("electron-settings");

const modulePaths = [dirname(__dirname) + "/extensions"];
let commands = [];
let commandChangeHandlers = [];

import { isDirectory, getDirectories } from "./util";

//registerCommand is used by extensions in the extensions folder (commands from web pages shouldn't be allowed to execute arbitrary code)
exports.registerCommand = command => {
  try {
    let idx = commands.findIndex(cmd => cmd.id == command.id);
    if (idx != -1) {
      commands.splice(idx, 1);
    }
    commands.push(command);
    commandChangeHandlers.map(handler => handler(command, commands));
  } catch (error) {
    console.log(error);
  }
};

//only removes non core commands
exports.removeCommand = id => {
  let idx = commands.findIndex(
    cmd => !cmd.id.startsWith("core.") && cmd.id == id
  );
  if (idx != -1) {
    commands.splice(idx, 1);
    commandChangeHandlers.map(handler => handler(null, commands)); //no new commands
    settings.set(
      "user.commands",
      settings.get("user.commands").filter(cmd => cmd.id != id)
    );
  } else {
    console.log("command ", id, "couldn't be removed");
  }
};

//this is safe to use for unknown sources, as only links can be passed (for now)
exports.registerJSONCommand = json => {
  // accepts json strings and js objects
  try {
    if (typeof json == "string") {
      json = JSON.parse(json);
    }
    if (!json.name) {
      console.log("JSON command without name, aborting");
      return;
    }
    if (!json.id) {
      console.log("JSON command without id, aborting");
      return;
    }
    if (json.id.startsWith("core.")) {
      console.log("JSON command cannot be a core command, aborting");
      return;
    }
    switch (json.type.toLowerCase()) {
      case "url":
        if (!validUrl.isUri(json.url)) break;
        if (!json.id || json.id.length == 0) {
          console.log("not a valid id");
          return;
        }
        exports.registerCommand({
          name: json.name,
          description: json.description || "Opens " + json.url,
          icon: json.icon || "OpenInNew",
          id: json.id,
          action: async callbacks => {
            try {
              await callbacks.openURL(json.url);
            } catch (error) {
              console.log(error);
            } finally {
              callbacks.hide();
            }
          }
        });
        break;
      case "snippet":
        exports.registerCommand({
          name: json.name,
          description: json.description || "Snippet",
          icon: json.icon || "FormatQuote",
          id: json.id,
          action: async callbacks => {
            try {
              await callbacks.copyToClipboard(json.text);
            } catch (error) {
              console.log(error);
            } finally {
              callbacks.hide();
            }
          }
        });
        break;
      case "folder":
        exports.registerCommand({
          name: json.name,
          description: json.description || "Opens a folder",
          icon: json.icon || "FolderOpen",
          id: json.id,
          action: async callbacks => {
            try {
              await callbacks.openFile(json.folder);
            } catch (error) {
              console.log(error);
            } finally {
              callbacks.hide();
            }
          }
        });
        break;
      case "program":
        exports.registerCommand({
          name: json.name,
          description: json.description || "Opens a program",
          icon: json.icon || "Apps",
          id: json.id,
          action: async callbacks => {
            try {
              await callbacks.launchProgram(json.program);
            } catch (error) {
              console.log(error);
            } finally {
              callbacks.hide();
            }
          }
        });
        break;
      default:
        console.error("Unrecognized command type");
        break;
    }
  } catch (error) {
    console.log(error);
  }
};

for (let command of settings.get("user.commands")) {
  console.log("registering command: ", command);
  exports.registerJSONCommand(command);
}

//tries to load all modulePaths in following order: modulePath/modulename/index.js > modulePath/modulename/index.json > modulePath/modulename/index.csv
modulePaths.forEach(modulePath => {
  try {
    getDirectories(modulePath).forEach(path => {
      //load js
      try {
        require(path + "/index.js");
      } catch (error) {
        //load json
        console.log(error);
        try {
          let json = require(path + "/index.json");
          json.commands.forEach(command =>
            exports.registerJSONCommand(command)
          );
        } catch (error) {
          //load csv
          try {
            csv()
              .fromFile(path + "/index.csv")
              .on("json", command => exports.registerJSONCommand(command))
              .on("done", error => {
                if (error) {
                  console.error(error);
                }
              });
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
  } catch (error) {
    //not a javascript module (try to find index.json)
    console.log(error);
  }
});

exports.commands = commands;

exports.onCommandsChange = callback => {
  commandChangeHandlers.push(callback);
  return /*function to unsubscribe */ () => {
    let idx = commandChangeHandlers.indexOf(callback);
    if (idx != -1) {
      commandChangeHandlers.splice(idx, 1);
    }
  };
};

settings.watch("user.commands", newCommands => {
  for (let command of newCommands) {
    exports.registerJSONCommand(command);
  }
});

// adding all start menu programs as commands

const getFiles = source => readdirSync(source).map(name => join(source, name));

const addShortcuts = (folder, displayPath) => {
  getFiles(folder).forEach(file => {
    if (isDirectory(file)) {
      addShortcuts(file, displayPath + " > " + require("path").basename(file));
    } else {
      if (
        /^.*(\b(uninstall)|(help)|(desktop\.ini)|(license)|(eula)|(release\s+notes?)|(updates?)|(documentation)|(change\s*log)|(support)|(readme)|(setup)|(user\s+manual)|(configure)|(website)|(about)\b).*/gi.test(
          file
        )
      ) {
        return;
      }
      if (!/^.*\.(lnk|exe|url)/gi.test(file)) {
        return;
      }
      const filename = require("path").basename(file);
      let displayName = filename;
      if (filename.lastIndexOf(".") != -1) {
        displayName = filename.substring(0, filename.lastIndexOf("."));
      }
      exports.registerJSONCommand({
        name: displayName,
        description: displayPath,
        type: "program",
        program: file,
        id: `test.startmenu.program.${file}`,
        icon: "DeviceHub"
      });
    }
  });
};

[
  `${process.env.ProgramData}/Microsoft/Windows/Start Menu/Programs`,
  `${process.env.AppData}/Microsoft/Windows/Start Menu/Programs`
].forEach(folder => addShortcuts(folder, "Start Menu"));
