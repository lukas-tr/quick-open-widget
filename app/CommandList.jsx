import React from "react";
import { MuiThemeProvider } from "material-ui/styles";
import { createMuiTheme, withStyles } from "material-ui/styles";
import * as colors from "material-ui/colors";
import Reboot from "material-ui/Reboot";
import { FormControlLabel, FormGroup } from "material-ui/Form";
import Switch from "material-ui/Switch";
import { FormControl, FormHelperText } from "material-ui/Form";
import Input, { InputLabel } from "material-ui/Input";
import TextField from "material-ui/TextField";
import Typography from "material-ui/Typography";
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  ListItemAvatar
} from "material-ui/List";
import Button from "material-ui/Button";
import ReactDOM from "react-dom";

import { commands, onCommandsChange } from "./CommandManager";
import { filterList, formatQueryText } from "./functions";
import scrollIntoView from "scroll-into-view";
import PropTypes from "prop-types";
import MaterialList from "./MaterialList";

const styles = theme => ({
  highlight: {
    color: theme.palette.primary.main
  }
});

class CommandList extends React.Component {
  render() {
    return false;
  }
}
export default withStyles(styles)(CommandList);
