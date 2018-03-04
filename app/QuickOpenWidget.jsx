import React from "react";
import { withStyles } from "material-ui/styles";
import Reboot from "material-ui/Reboot";
import TextField from "material-ui/TextField";
import { commands, onCommandsChange } from "./CommandManager";
import { filterList, formatQueryText } from "./functions";
import MaterialList from "./MaterialList";
import PromptWidget from "./PromptWidget";
import * as icons from "material-ui-icons";
const opn = require("opn");
const validUrl = require("valid-url");
const { ipcRenderer } = require("electron");
const isDev = require("electron-is-dev");

const styles = theme => ({
  highlight: {
    color: theme.palette.primary.main
  },
  listItem: {
    transitionProperty: "none"
  },
  textField: {
    width: "100%",
    padding: 10,
    position: "relative",
    top: -10
  },
  list: {
    height: "calc(100vh - 60px)",
    width: "100vw",
    position: "absolute",
    overflowY: "scroll",
    bottom: 0
  },
  main: { height: "100vh", width: "100vw", position: "absolute" }
});

class QuickOpenWidget extends React.Component {
  state = {
    commandText: "",
    highlight: 0, //currently selected command (keyboard)
    commands: [...commands], // all commands you can see in the list
    inactiveCommands: [], // all commands you can't see in the list
    promptType: "none"
  };
  componentDidMount() {
    this.unsubscribeCommandsChange = onCommandsChange(
      (newCommand, allCommands) => {
        this.setState({
          commands: [...allCommands],
          inactiveCommands: []
        });
        this.filterList(true, this.state.commandText);
        // this.state.inactiveCommands.push(newCommand); //was fine until protcols and files were supported
        // this.filterList(false, this.state.commandText);
      }
    );
  }
  filterList = (queryGotLonger, newQuery) => {
    let activeCommands = this.state.commands;
    let inactiveCommands = this.state.inactiveCommands;
    filterList(
      activeCommands,
      inactiveCommands,
      newQuery,
      queryGotLonger,
      command => command.name
    );
    this.setState({
      commands: activeCommands,
      inactiveCommands: inactiveCommands
    });
  };
  componentWillUnmount() {
    this.unsubscribeCommandsChange();
  }
  handleChange = event => {
    //text field change
    let oldQuery = this.state.commandText;
    let newQuery = event.target.value;
    if (oldQuery.length == newQuery.length) {
      this.filterList(true, newQuery);
      this.filterList(false, newQuery);
    } else {
      this.filterList(oldQuery.length < newQuery.length, newQuery); //specify if more or less letters in query
    }
    this.setState({ commandText: newQuery, highlight: 0 });
  };
  onKeyDown = event => {
    if (event.keyCode == 40) {
      //down
      event.preventDefault();
      this.setState({
        highlight:
          Math.abs(this.state.highlight + 1) % this.state.commands.length
      });
    } else if (event.keyCode == 38) {
      //up
      event.preventDefault();
      this.setState({
        highlight:
          (this.state.commands.length + this.state.highlight - 1) %
          this.state.commands.length
      });
    } else if (event.keyCode == 13) {
      //enter
      event.preventDefault();
      this.executeCommand(this.state.commands[this.state.highlight]);
    }
  };
  executeCommand = async command => {
    try {
      await command.action(this.callbacks(command));
    } catch (error) {
      console.log("Error in command: ", error);
      this.callbacks(command).error(error);
    }
  };
  callbacks = command => ({
    hide: () => {
      //stay open when developing
      return new Promise((resolve, reject) => {
        //true->hidden, false->not hidden (because of development)
        if (isDev) {
          resolve(false);
          return;
        }
        // ipcRenderer.send("hide-window");
        // resolve(true);
        resolve(false); //maybe staying open is better after all (may be enabled when feature gets better)
      });
    },
    error: error => {
      return new Promise((resolve, reject) => {
        // always resolves with true
        if (!error) error = "Unknown error";
        if (error.message) error = error.message;
        if (typeof error != "string") error = "Unknown error";
        console.log(error);
        this.setState({
          promptType: "enum",
          onEnumBoxClosed: resolve,
          promptEnum: [true],
          promptMapItem: bool => "OK",
          onEnumBoxAbort: resolve, //no reject
          enumPlaceholder: "Error: " + error,
          enumReadOnly: true,
          enumCustomSubmit: false
        });
      });
    },
    alertBox: message => {
      return new Promise((resolve, reject) => {
        // always resolves with true
        this.setState({
          promptType: "enum",
          onEnumBoxClosed: resolve,
          promptEnum: [true],
          promptMapItem: bool => "OK",
          onEnumBoxAbort: resolve, //no reject
          enumPlaceholder: message,
          enumReadOnly: true,
          enumCustomSubmit: false
        });
      });
    },
    confirmBox: message => {
      return new Promise((resolve, reject) => {
        this.setState({
          promptType: "enum",
          onEnumBoxClosed: resolve,
          promptEnum: [true, false],
          promptMapItem: bool => (bool ? "Accept" : "Decline"),
          onEnumBoxAbort: reject,
          enumPlaceholder: message,
          enumReadOnly: false,
          enumCustomSubmit: false
        });
      });
    },
    textBox: message => {
      return new Promise((resolve, reject) => {
        this.setState({
          promptType: "enum",
          onEnumBoxClosed: resolve,
          promptEnum: [],
          promptMapItem: item => item,
          onEnumBoxAbort: reject,
          enumPlaceholder: message,
          enumReadOnly: false,
          enumCustomSubmit: true
        });
      });
    },
    enumBox: (message, enumArray, arrayEntryToStringMap) => {
      return new Promise((resolve, reject) => {
        this.setState({
          promptType: "enum",
          onEnumBoxClosed: resolve,
          promptEnum: enumArray,
          promptMapItem: arrayEntryToStringMap,
          onEnumBoxAbort: reject,
          enumPlaceholder: message,
          enumReadOnly: false,
          enumCustomSubmit: false
        });
      });
    },
    updateDescription: text => {
      return new Promise((resolve, reject) => {
        command.description = text;
        this.setState({});
        resolve(null);
      });
    },
    openURL: uri => {
      return new Promise((resolve, reject) => {
        if (!validUrl.isUri(uri)) reject("not a uri");
        opn(uri);
        resolve(null);
      });
    },
    copyToClipboard: text => {
      return new Promise((resolve, reject) => {
        const { clipboard } = require("electron");
        clipboard.writeText(text);
      });
    }
  });
  render() {
    switch (this.state.promptType) {
      case "enum":
        return (
          <PromptWidget
            className={this.props.classes.main}
            items={this.state.promptEnum}
            mapItem={this.state.promptMapItem}
            onSubmit={item => {
              this.setState({ promptType: "none" });
              this.state.onEnumBoxClosed(item);
            }}
            onAbort={() => {
              this.setState({ promptType: "none" });
              this.state.onEnumBoxAbort("abort"); //"abort" is the reason
            }}
            placeholder={this.state.enumPlaceholder}
            readOnly={this.state.enumReadOnly}
            querySubmit={this.state.enumCustomSubmit}
          />
        );
      default:
        return (
          <div>
            <TextField
              onBlur={event => event.target.focus()} //keep focus
              onKeyDown={this.onKeyDown}
              autoFocus
              value={this.state.commandText}
              onChange={this.handleChange}
              margin="normal"
              className={this.props.classes.textField}
            />
            <div className={this.props.classes.list}>
              <MaterialList
                items={this.state.commands}
                onItemClick={index =>
                  this.executeCommand(this.state.commands[index])
                }
                highlighted={this.state.highlight}
                formatPrimary={command =>
                  formatQueryText(
                    this.state.commandText,
                    command.name,
                    this.props.classes.highlight
                  )
                }
                formatSecondary={command =>
                  command.description || "Executes the command"
                }
                hasImage={this.props.showIcons}
                formatImage={command => {
                  let Icon = icons[command.icon];
                  if (!Icon) return false;
                  return <Icon />;
                }}
                noMatchText={"No commands matching your query"}
                formatTitle={command => command.id}
              />
            </div>
          </div>
        );
    }
  }
}

export default withStyles(styles)(QuickOpenWidget);
