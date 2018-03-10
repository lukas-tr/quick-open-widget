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

const rowHeight = 56;

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
  state = {
    availableHeight: 0,
    scrollTop: 0
  };
  componentDidMount() {
    window.addEventListener("resize", this.handleWindowResize);
    this.handleWindowResize();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
  }
  handleWindowResize = event => {
    this.setState({ availableHeight: ReactDOM.findDOMNode(this).clientHeight });
  };
  handleScroll = event => {
    this.setState({ scrollTop: event.target.scrollTop });
  };
  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.scrollTop == this.state.scrollTop ||
      this.state.forceUpdateActive
    ) {
      let domNode = ReactDOM.findDOMNode(this.highlightedElementRef);
      if (prevProps.highlighted != this.props.highlighted) {
        if (this.props.highlighted == this.props.items.length - 1) {
          this.setState({
            scrollTop: this.props.items.length * rowHeight,
            forceUpdateActive: true
          });
          return;
        } else if (this.props.highlighted == 0) {
          this.setState({ scrollTop: 0, forceUpdateActive: true });
          return;
        }
      }
      if (domNode) {
        scrollIntoViewIfNeeded(domNode, { duration: 0, easing: "easeInOut" });
      }
      if (this.state.forceUpdateActive)
        this.setState({ forceUpdateActive: false });
    }
  }
  renderItem = (item, index) => (
    <ListItem
      title={this.props.formatTitle(item)}
      key={JSON.stringify(item)}
      button
      onClick={() => this.props.onItemClick(index)}
      dense
      style={{ height: 56, overflow: "hidden", textOverflow: "ellipsis" }}
      ref={ref => {
        if (index == this.props.highlighted) this.highlightedElementRef = ref;
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
  );
  render() {
    const numRows = this.props.items.length;
    const totalHeight = rowHeight * numRows;
    const { availableHeight, scrollTop } = this.state;
    const additional = 10; // for fast scrolling (displaying additional+viewport+additional)
    const scrollBottom = scrollTop + availableHeight;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / rowHeight) - additional
    );
    const endIndex = Math.min(
      numRows,
      Math.ceil(scrollBottom / rowHeight) + additional
    );
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push(this.renderItem(this.props.items[i], i));
    }
    return (
      <div
        style={{ height: "100%", overflowY: "scroll" }}
        onScroll={this.handleScroll}
      >
        <List
          dense
          disablePadding
          style={{ paddingTop: startIndex * rowHeight, height: totalHeight }}
        >
          {items}
          {this.props.items.length == 0 && (
            <ListItem button disabled dense>
              <ListItemText primary={this.props.noMatchText} />
            </ListItem>
          )}
        </List>
      </div>
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
