const { registerCommand } = require("CommandManager");

const includeExamples = false;

if (includeExamples) {
  registerCommand({
    name: "Example: Confirm box",
    description: "Displays a confirm box",
    id: "example.confirm",
    action: async callbacks => {
      await callbacks.alertBox(
        "You answered " + (await callbacks.confirmBox("Are you sure?"))
      );
      callbacks.hide();
    }
  });

  registerCommand({
    name: "Example: Text box with error",
    description: "This will throw an error",
    id: "example.error",
    action: async callbacks => {
      await callbacks.thispropertydoesntexist(
        "The answer '" +
          (await callbacks.textBox("What do you want to know?")) +
          "' is wrong"
      );
    }
  });

  setTimeout(() => {
    registerCommand({
      name: "Example: Timeout",
      id: "example.timeout",
      description: "This was added 5 seconds after initialisation"
    });
  }, 5000);
}
