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

const isDirectory = source => lstatSync(source).isDirectory();

const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);

//registerCommand is used by extensions in this repository (commands from web pages shouldn't be allowed to execute arbitrary code)
exports.registerCommand = command => {
  try {
    commands.push(command);
    commandChangeHandlers.map(handler => handler(command, commands));
  } catch (error) {
    console.log(error);
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

settings.watch("user.commands", newVal => {
  for (let command of newVal) {
    exports.registerJSONCommand(command);
  }
});
