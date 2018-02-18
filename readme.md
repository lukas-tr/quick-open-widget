# QuickOpenWidget

## Features and planned features

* [x] Automatic updates
* [x] <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Space</kbd> or taskbar icon to toggle
* [x] Customizeable theme
* [x] Commands can be written in JavaScript, CSV or JSON
* [x] Multi-monitor support (always shows up on the monitor where the cursor is)
* [x] Full screen mode
* [x] Autostart
* [ ] Importing custom commands from any folder on the system (coming soon)
* [ ] A command to add custom URL commands while running
* [ ] Shortcut commands
  * [ ] Control palen
  * [ ] Computer
  * [ ] Hide/Show all windows
  * [ ] Installed programs
  * [ ] Installed games (maybe read /path/to/Steam/steamapps and find appmanifest\_&lt;id&gt;.act)

## Screenshots

![command](https://github.com/lukas-tr/quick-open-widget/raw/master/readme/command.png "Typing in a command")

![command](https://github.com/lukas-tr/quick-open-widget/raw/master/readme/colors.png "The color change dialog")

![command](https://github.com/lukas-tr/quick-open-widget/raw/master/readme/command.png "A confirmBox dialog")

## Adding custom commands

Adding custom commands is easy. They can be importet from JSON, CSV or JavaScript files. JSON and CSV both support basic commands, while JavaScript allows for custom logic.

### Available Types

| Import option | Action | URL             |
| ------------- | ------ | --------------- |
| JavaScript    | ✔      | ✔ (via actions) |
| CSV           | ❌     | ✔               |
| JSON          | ❌     | ✔               |

#### URL Examples

You can arrange the colums howevery you like. If description is not set, it shows the url.

```csv
type,name,url,description
url,Open YouTube,https://youtube.com,Opens the YouTube website
url,Open Google,https://google.com,Opens the Google website
```

```json
{
  "commands": [
    {
      "name": "Open YouTube",
      "description": "Opens the YouTube website",
      "type": "url",
      "url": "https://youtube.com"
    },
    {
      "name": "Open Google",
      "description": "Opens the Google website",
      "type": "url",
      "url": "https://google.com"
    }
  ]
}
```

### Action Example

Have a look at the example directory for more.

```javascript
const { registerCommand } = require("CommandManager");
registerCommand({
  name: "Say Hi",
  description: "Displays a message",
  action: async callbacks => {
    await callbacks.alertBox("Hello!");
    callbacks.hide();
  }
});
```

The callbacks object contains following functions (ALL of these are Promises):

```javascript
{
    hide: () => boolean, // false if in dev mode
    error: message => true,
    alertBox: message => true,
    confirmBox: message => boolean,
    textBox: message => string,
    enumBox: (message, enumArray, arrayEntryToStringMap) => object, // array entry
    updateDescription: text => void,
    openURL: uri => void
}
```
