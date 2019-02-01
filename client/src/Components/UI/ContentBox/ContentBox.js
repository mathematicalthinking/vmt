import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import classes from "./contentBox.css";
import Icons from "./Icons/Icons";
import Aux from "../../HOC/Auxil";
import Expand from "./expand.js";

class ContentBox extends PureComponent {
  state = {
    showOverlay: false,
    selectAnimation: false,
    selected: false,
    expanded: false
  };

  toggleExpand = event => {
    event.preventDefault();
    let prevState = this.state.expanded;
    this.setState({
      expanded: !prevState
    });
  };

  hoverOnSelect = () => {
    this.setState({ showOverlay: true });
  };

  select = () => {
    if (this.state.selected) return;
    this.setState({ selectAnimation: true });
    this.props.select(this.props.id);
    setTimeout(this.setState({ selected: true }), 400);
  };
  render() {
    let { selecting } = this.props;
    // let alignClass = classes.Center;
    let animatedClass = "";
    let selectedClass = "";
    let selectedClassPlus = "";
    // if (this.props.align === 'left') alignClass = classes.Left;
    // if (this.props.align === 'right') alignClass = classes.Right;
    if (this.state.selectAnimation) animatedClass = classes.Selecting;
    if (this.state.selected) {
      selectedClassPlus = classes.SelectedPlus;
      selectedClass = classes.Selected;
    }
    const notifications =
      this.props.notifications > 0 ? (
        <div className={classes.Notification} data-testid="content-box-ntf">
          <span className={classes.NotificationCount}>
            {this.props.notifications}
          </span>
        </div>
      ) : null;
    return (
      <Aux>
        <Link
          to={selecting ? "#" : this.props.link}
          className={[classes.Container, selectedClass].join(" ")}
          style={{ height: this.state.expanded ? 150 : 50 }}
        >
          <div
            data-testid={`content-box-${this.props.title}`}
            className={classes.SubContainer}
            onClick={selecting ? this.select : null}
            onMouseEnter={selecting ? this.hoverOnSelect : null}
            onMouseLeave={
              selecting
                ? () => {
                    this.setState({ showOverlay: false });
                  }
                : null
            }
          >
            {this.state.showOverlay ? (
              <div
                className={classes.SelectOverlay}
                data-testid={`overlay-${this.props.title}`}
              >
                <i
                  className={[
                    classes.Plus,
                    "fas fa-plus",
                    animatedClass,
                    selectedClassPlus
                  ].join(" ")}
                />
              </div>
            ) : null}
            <div className={classes.TopBanner}>
              <div className={classes.BannerLeft}>
                <div className={classes.Icons}>
                  <Icons
                    image={this.props.image}
                    lock={this.props.locked}
                    roomType={this.props.roomType}
                    listType={this.props.listType}
                  />
                </div>
                <div className={classes.Title} data-testid="">
                  {this.props.title}
                </div>
                {notifications}
              </div>
              <div
                className={classes.Expand}
                style={{
                  transform: this.state.expanded
                    ? `rotate(180deg)`
                    : `rotate(0)`
                }}
              >
                <Expand clickHandler={this.toggleExpand} />
              </div>
            </div>
            <div className={classes.Content}>
              {this.props.details && this.state.expanded ? (
                <div className={classes.Expanded}>
                  <div>{this.props.details.description || ""}</div>
                  {this.props.details.facilitators.length > 0 ? (
                    <div>
                      Facilitators:{" "}
                      {this.props.details.facilitators.map(
                        facilitator => facilitator
                      )}
                    </div>
                  ) : null}
                  {this.props.details.entryCode ? (
                    <div>Entry Code: {this.props.details.entryCode}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Link>
      </Aux>
    );
  }
}

export default ContentBox;
