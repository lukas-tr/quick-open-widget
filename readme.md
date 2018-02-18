# QuickOpenWidget

## Features and planned features

* [x] Use the keyboard or mouse to execute commands (except textBox)
* [x] Automatic updates
* [x] <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Space</kbd> or taskbar icon to toggle
* [x] Customizeable theme
* [x] Commands can be written in JavaScript, CSV or JSON
* [x] Multi-monitor support (always shows up on the monitor where the cursor is)
* [x] Full screen mode
* [x] Autostart
* [ ] Importing custom commands from any folder on the system
* [ ] A command to add custom URL commands while running
* [ ] More commands
  * [ ] Control palen
  * [ ] Computer
  * [ ] Hide/Show all windows
  * [ ] Installed programs
  * [ ] Installed games (maybe read /path/to/Steam/steamapps and find appmanifest\_&lt;id&gt;.act)

## Known bugs

* Scrollbar doesn't change color when changing theme type color
* Automatic updates start downloading without user consent (user has to accept installation)

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

Have a look at the [example](./blob/master/LICENSE) directory for more.

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
registerCommand({
  name: "Confirm me",
  description: "Displays a confirm box",
  action: async callbacks => {
    await callbacks.alertBox(
      "You answered " + (await callbacks.confirmBox("Are you sure?"))
    );
    callbacks.hide();
  }
});
```

The callbacks object contains following functions (ALL of these are Promises):

| Callback                                          | Resolve   | Reject   | Description                                                                                                                                               |
| ------------------------------------------------- | --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hide()                                            | `boolean` | never    | Hides the window. Only returns false when in developer mode (Because window stays open)                                                                   |
| error(message)                                    | `true`    | never    | Displays an error message                                                                                                                                 |
| alertBox(message)                                 | `true`    | never    | Displays an alert box                                                                                                                                     |
| confirmBox(message)                               | `boolean` | `string` | Returns a boolean when user accepts or declines. Rejects with a string containing `abort` when pressing <kbd>Esc</kbd>                                    |
| textBox(message)                                  | `string`  | `string` | Returns a string containing the user response. Rejects with a string containing `abort` when pressing <kbd>Esc</kbd>                                      |
| enumBox(message,enumArray,arrayEntryToStringFunc) | `object`  | `string` | Returns an array entry. The arrayEntryToStringFunc function has to return a string. Rejects with a string containing `abort` when pressing <kbd>Esc</kbd> |
| updateDescription (newDescription)                | `null`    | never    | Updates the description (has to be string) for the command in the command list.                                                                           |
| openURL                                           | `null`    | `string` | Opens a URL (and URI). Rejects with `not a uri` when the provided string isn't a valid URI.                                                               |
