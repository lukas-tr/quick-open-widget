# QuickOpenWidget

Press `CTRL+SHIFT+SPACE` to toggle.

## Adding custom commands

Adding custom commands is easy. They can be importet from JSON, CSV or JavaScript files. JSON and CSV both support basic commands, while JavaScript allows for custom logic.

### Available Types

| Import option | Action | URL |
| ------------- | ------ | --- |
| JavaScript    | ✔      | ❌  |
| CSV           | ❌     | ✔   |
| JSON          | ❌     | ✔   |

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
