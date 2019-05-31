/* eslint-disable react/no-did-update-set-state */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Aux from '../HOC/Auxil';
import Button from '../UI/Button/Button';
import classes from './editableText.css';
import {
  updateRoomTab,
  updateActivity,
  updateCourse,
  updateActivityTab,
} from '../../store/actions';

class EditableText extends Component {
  constructor(props) {
    super(props);
    const { children } = this.props;
    this.state = {
      text: children,
      editing: false,
    };
  }

  // componentDidMount(){
  //   this.setState({
  //     text: this.props.children
  //   })
  // }
  componentDidUpdate(prevProps, prevState) {
    const { children } = this.props;
    if (prevState === this.state && prevProps.children !== children) {
      this.setState({ text: children });
    }
  }

  updateText = event => {
    this.setState({ text: event.target.value });
  };

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing,
    }));
  };

  submit = () => {
    const {
      parentResource,
      parentId,
      field,
      id,
      connectUpdateRoomTab,
      connectUpdateActivityTab,
    } = this.props;
    const { text } = this.state;
    if (parentResource === 'room') {
      connectUpdateRoomTab(parentId, id, { [field]: text });
    } else if (parentResource === 'activity') {
      connectUpdateActivityTab(parentId, id, { [field]: text });
    }
    this.toggleEdit();
  };

  render() {
    const { inputType, children, title, owner } = this.props;
    const { text, editing } = this.state;
    return (
      <Aux>
        {editing ? (
          <div
            className={
              inputType === 'TEXT_AREA'
                ? classes.EditContainer
                : classes.EditLine
            }
          >
            <b>{title}</b>
            {inputType === 'TEXT_AREA' ? (
              <textarea
                className={classes.TextArea}
                onChange={this.updateText}
                value={text}
              />
            ) : (
              <input
                className={classes.TextInput}
                onChange={this.updateText}
                value={text}
              />
            )}
            <div className={classes.EditButtons}>
              <div>
                <Button m="0 10px" click={this.submit}>
                  Save
                </Button>
              </div>
              <div>
                <Button m={0} click={this.toggleEdit} theme="SmallCancel">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <b>{title}</b> {children}
            {owner ? (
              <i
                onClick={this.toggleEdit}
                onKeyPress={this.toggleEdit}
                tabIndex="-3"
                role="button"
                className={['fas fa-edit', classes.ToggleEdit].join(' ')}
              />
            ) : null}
          </div>
        )}
      </Aux>
    );
  }
}

EditableText.propTypes = {
  parentResource: PropTypes.string,
  parentId: PropTypes.string,
  field: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  inputType: PropTypes.string.isRequired,
  children: PropTypes.string,
  connectUpdateRoomTab: PropTypes.func,
  connectUpdateActivityTab: PropTypes.func,
  owner: PropTypes.bool,
  title: PropTypes.string,
};

EditableText.defaultProps = {
  parentResource: null,
  parentId: null,
  children: null,
  title: null,
  owner: false,
  connectUpdateActivityTab: null,
  connectUpdateRoomTab: null,
};

export default connect(
  null,
  {
    connectUpdateRoomTab: updateRoomTab,
    connectUpdateActivity: updateActivity,
    connectUpdateCourse: updateCourse,
    connectUpdateActivityTab: updateActivityTab,
  }
)(EditableText);
