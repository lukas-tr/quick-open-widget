"use babel";
import React from "react";
import { MuiThemeProvider } from "material-ui/styles";
import { createMuiTheme } from "material-ui/styles";
import * as colors from "material-ui/colors";
import Utilities from "./util";
import Reboot from "material-ui/Reboot";
import settings from "electron-settings";
import { FormControlLabel, FormGroup } from "material-ui/Form";
import Switch from "material-ui/Switch";
import { MenuItem } from "material-ui/Menu";
import { FormControl, FormHelperText } from "material-ui/Form";
import Select from "material-ui/Select";
import Input, { InputLabel } from "material-ui/Input";
import TextField from "material-ui/TextField";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "material-ui/Dialog";
import Typography from "material-ui/Typography";
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  ListItemAvatar
} from "material-ui/List";
import Avatar from "material-ui/Avatar";
import ThemeTypeIcon from "material-ui-icons/InvertColors";
import AutostartIcon from "material-ui-icons/PowerSettingsNew";
import BaseURLIcon from "material-ui-icons/Web";
import Button from "material-ui/Button";
import AutocheckinIcon from "material-ui-icons/Cached";

window.settings = settings; // for access in devTools
window.colors = colors;

const colorOptions = {
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

class ColorOptions extends React.Component {
  state = {
    primaryOpen: false,
    secondaryOpen: false
  };
  handleThemeColorChange = name => value => {
    settings.set("theme." + name, value);
    this.setState({ primaryOpen: false, secondaryOpen: false });
  };
  componentWillMount() {
    this.setState({ themeSettings: settings.get("theme") });
    this.themeObserver = settings.watch("theme", theme => {
      this.setState({ themeSettings: theme });
    });
  }

  componentWillUnmount() {
    this.themeObserver.dispose();
  }
  toggleThemeType = (event, checked) => {
    settings.set("theme.type", checked ? "dark" : "light");
  };
  render() {
    return (
      <div>
        <List
          subheader={
            <ListSubheader style={{ backgroundColor: "inherit" }}>
              Color settings
            </ListSubheader>
          }
        >
          <ListItem>
            <ListItemIcon>
              <ThemeTypeIcon />
            </ListItemIcon>
            <ListItemText primary="Dark mode" />
            <ListItemSecondaryAction>
              <Switch
                checked={this.state.themeSettings.type == "dark"}
                onChange={this.toggleThemeType}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem button onClick={() => this.setState({ primaryOpen: true })}>
            <ListItemAvatar>
              <Avatar
                style={{
                  backgroundColor: colors[this.state.themeSettings.primary][500]
                }}
              >
                {colorOptions[this.state.themeSettings.primary].charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Primary"
              secondary={colorOptions[this.state.themeSettings.primary]}
            />
          </ListItem>
          <ListItem
            button
            onClick={() => this.setState({ secondaryOpen: true })}
          >
            <ListItemAvatar>
              <Avatar
                style={{
                  backgroundColor:
                    colors[this.state.themeSettings.secondary][500]
                }}
              >
                {colorOptions[this.state.themeSettings.secondary].charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Secondary"
              secondary={colorOptions[this.state.themeSettings.secondary]}
            />
          </ListItem>
        </List>
        <ColorSelectDialog
          selectedValue={this.state.themeSettings.primary}
          open={this.state.primaryOpen}
          onClose={this.handleThemeColorChange("primary")}
        />
        <ColorSelectDialog
          selectedValue={this.state.themeSettings.secondary}
          open={this.state.secondaryOpen}
          onClose={this.handleThemeColorChange("secondary")}
        />
      </div>
    );
  }
}
class ConnectOptions extends React.Component {
  state = {
    baseOpen: false
  };
  componentWillMount() {
    this.setState({ connectSettings: settings.get("connect") });
    this.connectObserver = settings.watch("connect", connect => {
      this.setState({ connectSettings: connect });
    });
  }
  componentWillUnmount() {
    this.connectObserver.dispose();
  }
  handleConnectChange = name => value => {
    settings.set("connect." + name, value);
    this.setState({ baseOpen: false });
  };
  toggleAutocheckin = (event, checked) => {
    settings.set("connect.autocheckin", checked);
  };
  render() {
    return (
      <div>
        <List subheader={<ListSubheader>Connect settings</ListSubheader>}>
          <ListItem button onClick={() => this.setState({ baseOpen: true })}>
            <ListItemIcon>
              <BaseURLIcon />
            </ListItemIcon>
            <ListItemText
              primary="Base URL"
              secondary={this.state.connectSettings.base}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AutocheckinIcon />
            </ListItemIcon>
            <ListItemText primary="Automatic check-in" />
            <ListItemSecondaryAction>
              <Switch
                checked={this.state.connectSettings.autocheckin}
                onChange={this.toggleAutocheckin}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <TextDialog
          value={this.state.connectSettings.base}
          open={this.state.baseOpen}
          onClose={this.handleConnectChange("base")}
        />
      </div>
    );
  }
}
class GeneralOptions extends React.Component {
  componentWillMount() {
    this.setState({ generalSettings: settings.get("general") });
    this.generalObserver = settings.watch("general", general => {
      this.setState({ generalSettings: general });
    });
  }
  componentWillUnmount() {
    this.generalObserver.dispose();
  }
  toggleAutostart = (event, checked) => {
    settings.set("general.autostart", checked);
  };
  render() {
    return (
      <List subheader={<ListSubheader>General settings</ListSubheader>}>
        <ListItem>
          <ListItemIcon>
            <AutostartIcon />
          </ListItemIcon>
          <ListItemText primary="Start with OS" />
          <ListItemSecondaryAction>
            <Switch
              checked={this.state.generalSettings.autostart}
              onChange={this.toggleAutostart}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  }
}

export default class App extends React.Component {
  state = {
    theme: createMuiTheme({
      palette: {
        primary: colors[settings.get("theme.primary")],
        secondary: colors[settings.get("theme.secondary")],
        type: settings.get("theme.type")
      }
    })
  };
  componentWillMount() {
    this.themeObserver = settings.watch("theme", theme => {
      this.setState({
        theme: createMuiTheme({
          palette: {
            primary: colors[theme.primary],
            secondary: colors[theme.secondary],
            type: theme.type
          }
        })
      });
    });
  }
  componentWillUnmount() {
    this.themeObserver.dispose();
  }
  render() {
    return (
      <MuiThemeProvider theme={this.state.theme}>
        <div style={{ padding: 16, overflowY: "auto", height: "100vh" }}>
          <Reboot />
          <ColorOptions />
          <ConnectOptions />
          <GeneralOptions />
        </div>
      </MuiThemeProvider>
    );
  }
}

class ColorSelectDialog extends React.Component {
  handleClose = () => {
    this.props.onClose(this.props.selectedValue);
  };
  handleListItemClick = value => {
    this.props.onClose(value);
  };
  render() {
    const { classes, onClose, selectedValue, ...other } = this.props;
    return (
      <Dialog onClose={this.handleClose} fullWidth {...other}>
        <DialogTitle>Please select a color</DialogTitle>
        <div>
          <List>
            {Object.entries(colorOptions).map(color => (
              <ListItem
                button
                onClick={() => this.handleListItemClick(color[0])}
                key={color[0]}
              >
                <ListItemAvatar>
                  <Avatar style={{ backgroundColor: colors[color[0]][500] }}>
                    {color[1].charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={color[1]} />
              </ListItem>
            ))}
          </List>
        </div>
      </Dialog>
    );
  }
}

class TextDialog extends React.Component {
  handleClose = () => {
    this.props.onClose(this.props.value);
  };

  handleSubmit = () => {
    this.props.onClose(this.state.value);
  };

  componentWillMount() {
    this.setState({ value: this.props.value });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value != this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  handleChange = event => {
    this.setState({ value: event.target.value });
  };

  render() {
    const { value, ...other } = this.props;
    return (
      <Dialog onClose={this.handleClose} fullWidth {...other}>
        <DialogTitle>Please type in text</DialogTitle>
        <DialogContent>
          <DialogContentText>asdfasdf</DialogContentText>
          <FormGroup>
            <TextField
              value={this.state.value}
              onChange={this.handleChange}
              margin="normal"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
