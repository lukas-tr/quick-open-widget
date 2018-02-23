const { registerCommand } = require("CommandManager");
// const settings = require("electron-settings");
const settings = require("electron").remote.require("electron-settings");
const { app } = require("electron").remote;

let colorOptions = {
  red: "Red",
  pink: "Pink",
  purple: "Purple",
  deepPurple: "Deep purple",
  indigo: "Indigo",
  blue: "Blue",
  lightBlue: "Light blue",
  cyan: "Cyan",
  teal: "Teal",
  green: "Green",
  lightGreen: "Light green",
  lime: "Lime",
  yellow: "Yellow",
  amber: "Amber",
  orange: "Orange",
  deepOrange: "Deep orange",
  brown: "Brown",
  grey: "Grey",
  blueGrey: "Blue grey"
};

registerCommand({
  name: "Exit Application",
  description: "Closes this application",
  icon: "PowerSettingsNew",
  action: async callbacks => {
    require("electron").ipcRenderer.send("exit-application");
  }
});

registerCommand({
  name: "Help",
  description: "Opens the help page",
  icon: "HelpOutline",
  action: async callbacks => {
    await callbacks.openURL("https://github.com/lukas-tr/quick-open-widget");
    callbacks.hide();
  }
});

registerCommand({
  name: "Toggle Dev Tools",
  description: "Toggles the integrated Developer Tools for debugging",
  icon: "BugReport",
  action: async callbacks => {
    require("electron")
      .remote.getCurrentWindow()
      .toggleDevTools();
  }
});

registerCommand({
  name: "Toggle theme type color",
  description: "Changes the type color",
  icon: "Style",
  action: async callbacks => {
    if (settings.get("color.type", "dark") == "dark") {
      settings.set("color.type", "light");
    } else {
      settings.set("color.type", "dark");
    }
    callbacks.hide();
  }
});

registerCommand({
  name: "Toggle autostart",
  icon: "Autorenew",
  description:
    "Enables or disables autostart (currently " +
    (settings.get("autostart", false) ? "disabled" : "enabled") +
    ")",
  action: async callbacks => {
    if (!settings.get("autostart", false)) {
      settings.set("autostart", true);
      await callbacks.updateDescription(
        "Enables or disables autostart (currently enabled)"
      );
      await callbacks.alertBox(
        "Make sure autostart isn't disabled in task manager"
      );
    } else {
      settings.set("autostart", false);
      await callbacks.updateDescription(
        "Enables or disables autostart (currently disabled)"
      );
    }
    callbacks.hide();
  }
});

registerCommand({
  name: "Version",
  icon: "InfoOutline",
  description: "Displays app version information",
  action: async callbacks => {
    await callbacks.alertBox(app.getName() + " v" + app.getVersion());
    callbacks.hide();
  }
});

registerCommand({
  name: "Toggle fullscreen",
  icon: "Fullscreen",
  description:
    "Enables or disables fullscreen (currently " +
    (settings.get("fullscreen", false) ? "disabled" : "enabled") +
    ")",
  action: async callbacks => {
    if (!settings.get("fullscreen", false)) {
      settings.set("fullscreen", true);
      await callbacks.updateDescription(
        "Enables or disables fullscreen (currently enabled)"
      );
    } else {
      settings.set("fullscreen", false);
      await callbacks.updateDescription(
        "Enables or disables fullscreen (currently disabled)"
      );
    }
    callbacks.hide();
  }
});

registerCommand({
  name: "Change primary theme color",
  icon: "Style",
  description:
    "Changes the primary theme (currently " +
    colorOptions[settings.get("color.primary", "blue")] +
    ")",
  action: async callbacks => {
    try {
      // can also throw errors (promise rejections)
      // important! "abort" needs to be catched if the error dialog shouldn't show up
      let newColor = await callbacks.enumBox(
        "Choose a primary color",
        Object.entries(colorOptions),
        arrayEntry => arrayEntry[1] //use value as string
      ); //newColor is ["color","color name"]
      settings.set("color.primary", newColor[0]);
      await callbacks.updateDescription(
        `Changes the primary theme (currently ${newColor[1]})`
      );
    } catch (error) {
      if (error != "abort") callbacks.error(error);
    } finally {
      callbacks.hide();
    }
  }
});

registerCommand({
  name: "Toggle icons",
  icon: "Style",
  description: "Turns on or off icons",
  action: async callbacks => {
    if (settings.get("icons.show", true)) {
      settings.set("icons.show", false);
    } else {
      settings.set("icons.show", true);
    }
    callbacks.hide();
  }
});
