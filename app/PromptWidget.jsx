import React from "react";
import { withStyles } from "material-ui/styles";
import Reboot from "material-ui/Reboot";
import TextField from "material-ui/TextField";
import { filterList, formatQueryText } from "./functions";
import MaterialList from "./MaterialList";
import PropTypes from "prop-types";

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
  }
});

class PromptWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      highlight: 0,
      items: [...props.items],
      inactiveItems: []
    };
  }
  componentWillMount() {
    if (this.props.readOnly) this.setState({ query: this.props.placeholder });
  }
  filterList = (queryGotLonger, newQuery) => {
    let items = this.state.items;
    let inactiveItems = this.state.inactiveItems;
    filterList(
      items,
      inactiveItems,
      newQuery,
      queryGotLonger,
      this.props.mapItem
    );
    this.setState({
      items: items,
      inactiveItems: inactiveItems
    });
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.items != this.props.items) {
      this.setState({ items: [...this.props.items], highlight: 0 });
      this.filterList(true, this.state.query);
      this.filterList(false, this.state.query);
    }
    if (this.props.readOnly) this.setState({ query: this.props.placeholder });
  }
  handleChange = event => {
    if (this.props.readOnly) return;
    //text field change
    let oldQuery = this.state.query;
    let newQuery = event.target.value;
    if (oldQuery.length == newQuery.length) {
      this.filterList(true, newQuery);
      this.filterList(false, newQuery);
    } else {
      this.filterList(oldQuery.length < newQuery.length, newQuery); //specify if more or less letters in query
    }
    this.setState({ query: newQuery, highlight: 0 });
  };
  onKeyDown = event => {
    if (event.keyCode == 40) {
      //down
      event.preventDefault();
      this.setState({
        highlight: (this.state.highlight + 1) % this.state.items.length
      });
    } else if (event.keyCode == 38) {
      //up
      event.preventDefault();
      this.setState({
        highlight:
          (this.state.items.length + this.state.highlight - 1) %
          this.state.items.length
      });
    } else if (event.keyCode == 13) {
      //enter
      event.preventDefault();
      if (this.props.querySubmit) {
        this.props.onSubmit(this.state.query);
      } else {
        this.props.onSubmit(this.state.items[this.state.highlight]);
      }
    } else if (event.keyCode == 27) {
      //esc
      event.preventDefault();
      this.props.onAbort();
    }
  };
  render() {
    return (
      <div>
        <TextField
          onBlur={event => event.target.focus()} //keep focus
          onKeyDown={this.onKeyDown}
          autoFocus
          value={this.state.query}
          onChange={this.handleChange}
          margin="normal"
          placeholder={this.props.placeholder}
          className={this.props.classes.textField}
        />
        <div className={this.props.classes.list}>
          <MaterialList
            items={this.state.items}
            onItemClick={index => this.props.onSubmit(this.state.items[index])}
            highlighted={this.state.highlight}
            formatPrimary={item =>
              formatQueryText(
                this.state.query,
                this.props.mapItem(item),
                this.props.classes.highlight
              )
            }
            formatSecondary={item => false}
            noMatchText={"No matches"}
          />
        </div>
      </div>
    );
  }
}

PromptWidget.propTypes = {
  classes: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  mapItem: PropTypes.func.isRequired,
  onAbort: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  querySubmit: PropTypes.bool // submit query, not matched item
};

export default withStyles(styles)(PromptWidget);
