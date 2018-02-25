const { registerCommand } = require("CommandManager");
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
  name: "Change primary theme color",
  icon: "Style",
  description:
    "Changes the primary theme (currently " +
    colorOptions[settings.get("color.primary", "blue")] +
    ")",
  id: "core.style.color",
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
