import React from "react";
import { MuiThemeProvider } from "material-ui/styles";
import { createMuiTheme, withStyles } from "material-ui/styles";
import * as colors from "material-ui/colors";
import Reboot from "material-ui/Reboot";
import QuickOpenWidget from "./QuickOpenWidget";
// import settings from "electron-settings";
const settings = require("electron").remote.require("electron-settings");

const styles = theme => ({
  main: { height: "100vh", width: "100vw", position: "absolute" }
});

class App extends React.Component {
  state = {
    theme: createMuiTheme({
      palette: {
        primary: colors[settings.get("color.primary", "blue")],
        secondary: colors[settings.get("color.secondary", "orange")],
        type: settings.get("color.type", "dark")
      }
    }),
    showIcons: settings.get("icons.show", true)
  };
  componentDidMount() {
    this.themeObserver = settings.watch("color", newTheme => {
      this.setState({
        theme: createMuiTheme({
          palette: {
            primary: colors[newTheme.primary || "blue"],
            secondary: colors[newTheme.secondary || "orange"],
            type: newTheme.type || "dark"
          }
        })
      });
    });
    this.iconObserver = settings.watch("icons.show", show => {
      this.setState({ showIcons: show });
    });
  }
  componentWillUnmount() {}

  render() {
    return (
      <MuiThemeProvider theme={this.state.theme}>
        <div
          className={
            this.props.classes.main + " " + settings.get("color.type", "dark")
          }
        >
          <Reboot />
          <QuickOpenWidget
            className={this.props.classes.main}
            showIcons={this.state.showIcons}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}
export default withStyles(styles)(App);
