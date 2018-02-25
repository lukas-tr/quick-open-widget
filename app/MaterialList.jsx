/**
 * MaterialList handles representation and scrolling of list
 */

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
import { filterList } from "./functions";
import scrollIntoView from "scroll-into-view";
import PropTypes from "prop-types";
import classNames from "classnames";
import Avatar from "material-ui/Avatar";

const scrollIntoViewIfNeeded = require("scroll-into-view-if-needed");

// theme.palette.action.active
// theme.palette.action.selected
// theme.palette.action.hover
// theme.palette.background.default
// theme.palette.background.paper
// theme.palette.primary|secondary.dark|light|main|contrastText
// theme.palette.primary|secondary[50|100-900]

const styles = theme => ({
  highlighted: {
    backgroundColor: theme.palette.action.selected
  },
  listItem: {
    transitionProperty: "none"
  },
  avatar: {
    backgroundColor: theme.palette.primary.light
  }
});

class MaterialList extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    let domNode = ReactDOM.findDOMNode(this.highlightedElementRef);
    if (domNode)
      scrollIntoViewIfNeeded(domNode, { duration: 0, easing: "easeInOut" });
  }
  render() {
    return (
      <List dense disablePadding>
        {this.props.items.map((item, index) => (
          <ListItem
            title={this.props.formatTitle(item)}
            key={index}
            button
            onClick={() => this.props.onItemClick(index)}
            dense
            ref={ref => {
              if (index == this.props.highlighted)
                this.highlightedElementRef = ref;
            }}
            className={classNames({
              [this.props.classes.listItem]: true,
              [this.props.classes.highlighted]: this.props.highlighted == index
            })}
          >
            {this.props.hasImage && (
              <ListItemAvatar>
                <Avatar className={this.props.classes.avatar}>
                  {this.props.formatImage(item)}
                </Avatar>
              </ListItemAvatar>
            )}
            <ListItemText
              primary={this.props.formatPrimary(item)}
              secondary={this.props.formatSecondary(item)}
            />
          </ListItem>
        ))}
        {this.props.items.length == 0 && (
          <ListItem button disabled dense>
            <ListItemText primary={this.props.noMatchText} />
          </ListItem>
        )}
      </List>
    );
  }
}

MaterialList.propTypes = {
  classes: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  onItemClick: PropTypes.func.isRequired, //supplies index
  highlighted: PropTypes.number.isRequired, //for keyboard highlight
  formatPrimary: PropTypes.func.isRequired, //called with
  formatSecondary: PropTypes.func.isRequired,
  noMatchText: PropTypes.string.isRequired,
  formatImage: PropTypes.func,
  hasImage: PropTypes.bool.isRequired,
  formatTitle: PropTypes.func
};
MaterialList.defaultProps = {
  formatString: () => false,
  formatTitle: () => undefined,
  hasImage: false
};
export default withStyles(styles)(MaterialList);
