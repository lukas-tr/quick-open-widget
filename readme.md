# Quick Open Widget

  <img alt="Quick Open Widget Logo" width="200" height="100" align="right" src="https://cdn.rawgit.com/lukas-tr/quick-open-widget/c15f869d/readme/logo.svg" />

> A simple program to execute custom commands

Download the latest installer [here](https://github.com/lukas-tr/quick-open-widget/releases/latest). Updates will be installed automatically.

How to install additional commands: Double click any .quickopencsv or .quickopenjson and the commands will be added or updated. You can also download them directly from https://quick-open-widget.firebaseapp.com/ (click "install" with Quick Open Widget installed);

## Features and planned features

* [x] Use the keyboard or mouse to execute commands (except textBox)
* [x] Automatic updates
* [x] <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Space</kbd> or taskbar icon to toggle
* [x] Customizeable theme
* [x] Commands can be written in JavaScript, CSV or JSON
* [x] Multi-monitor support (always shows up on the monitor where the cursor is)
* [x] Full screen mode
* [x] Autostart
* [x] Material icons
* [ ] Importing custom commands from any folder on the system
* [ ] A command to add custom commands
* [ ] More commands

## The Store

The store is located [here](https://quick-open-widget.firebaseapp.com/ "Quick Open Widget Store"). If you want your package featured in the store, send me a message on GitHub.

## Known bugs

* Scrollbar doesn't change color when changing theme type color
* Automatic updates start downloading without user consent (user has to accept installation)

## Screenshots

<p align="center">
  <img alt="Typing in a command" width="600" src="https://github.com/lukas-tr/quick-open-widget/raw/master/readme/command.png" />
</p>

<p align="center">
  <img alt="A confirmBox dialog" width="600" src="https://github.com/lukas-tr/quick-open-widget/raw/master/readme/dialogs.png" />
</p>

<p align="center">
  <img alt="The color change dialog" width="600" src="https://github.com/lukas-tr/quick-open-widget/raw/master/readme/colors.png" />
</p>

## Adding custom commands

To see example files, to to the /readme folder.

Adding custom commands is easy. They can be importet from JSON or CSV (with a `.quickopenjson` or `.quickopencsv` extension). JSON and CSV both support basic commands.

IMPORTANT: IDs are required (can't start with "core"), if two commands with the same ids are encountered, the old command will be overwritten.

### Available Types

| Import option | Action (execute JavaScript) | URL (opens URL in browser) | Program (starts a program) | Folder (opens a folder) | Snippet (copies text to the clipboard | 
| ------------- | ------ | --------------- | --- | --- | --- | 
| JavaScript    | ✔      | ✔ (via actions) | ✔ (via actions) | ✔ (via actions) | ✔ (via actions) |
| CSV           | ❌     | ✔               | ✔ | ✔ | ✔ |
| JSON          | ❌     | ✔               | ✔ | ✔ | ✔ |

### URL Examples

You can arrange the colums howevery you like. If description is not set, it shows the url.

```csv
id,type,name,url,description
custom.urls.open.yt,url,Open YouTube,https://youtube.com,Opens the YouTube website
custom.urls.open.g,url,Open Google,https://google.com,Opens the Google website
```

```json
{
  "commands": [
    {
      "name": "Open YouTube",
      "description": "Opens the YouTube website",
      "type": "url",
      "url": "https://youtube.com",
      "id": "custom.urls.open.yt"
    },
    {
      "name": "Open Google",
      "description": "Opens the Google website",
      "type": "url",
      "url": "https://google.com",
      "id": "custom.urls.open.g"
    }
  ]
}
```

### Action Example

Have a look at the [example](./app/extensions/examples/index.js) directory for more.

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

| Callback                                               | Resolve   | Reject   | Description                                                                                                                                               |
| ------------------------------------------------------ | --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hide ()`                                              | `boolean` | never    | Hides the window. Only returns false when in developer mode (Because window stays open)                                                                   |
| `error (message)`                                      | `true`    | never    | Displays an error message                                                                                                                                 |
| `alertBox (message)`                                   | `true`    | never    | Displays an alert box                                                                                                                                     |
| `confirmBox (message)`                                 | `boolean` | `string` | Returns a boolean when user accepts or declines. Rejects with a string containing `abort` when pressing <kbd>Esc</kbd>                                    |
| `textBox (message)`                                    | `string`  | `string` | Returns a string containing the user response. Rejects with a string containing `abort` when pressing <kbd>Esc</kbd>                                      |
| `enumBox (message, enumArray, arrayEntryToStringFunc)` | `object`  | `string` | Returns an array entry. The arrayEntryToStringFunc function has to return a string. Rejects with a string containing `abort` when pressing <kbd>Esc</kbd> |
| `updateDescription (newDescription)`                   | `null`    | never    | Updates the description (has to be string) for the command in the command list.                                                                           |
| `openURL`                                              | `null`    | `string` | Opens a URL (and URI). Rejects with `not a uri` when the provided string isn't a valid URI.                                                               |

## Help

### The installer can't download the archive from GitHub

If the installer can't download required files, download the 7z archive manually and place it in the same directory as the installer.
