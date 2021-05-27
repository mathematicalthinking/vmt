import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, RadioBtn, Button, TextInput } from '../../Components';
import { BoxList } from '../index';
import classes from './NewResource/create.css';

class FromActivity extends Component {
  state = {
    community: true,
    ownResources: false,
    thisCourse: false,
    selected: [],
    dueDate: '',
  };

  componentDidMount() {
    window.addEventListener('keypress', this.onKeyPress);
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.onKeyPress);
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.submit();
    }
  };

  select = (id) => {
    const { selected } = this.state;
    const updatedSelected = [...selected];
    updatedSelected.push(id);
    this.setState({ selected: updatedSelected });
  };

  deSelect = (id) => {
    const { selected } = this.state;
    const updatedSelected = selected.filter((current) => current !== id);
    this.setState({ selected: updatedSelected });
  };

  submit = () => {
    const { mode, userId, course, create, copy, close } = this.props;
    const { selected, dueDate } = this.state;
    selected.forEach((id) => {
      if (mode === 'create') {
        create(id, userId, dueDate, course);
      } else {
        copy(id, userId, course);
      }
    });
    close();
  };

  render() {
    const {
      courseActivities,
      userActivities,
      show,
      close,
      course,
      resource,
      mode,
    } = this.props;
    const { thisCourse, ownResources, community, selected } = this.state;
    let list = [];
    if (thisCourse) {
      list = courseActivities;
    } else if (ownResources) list = userActivities;
    return (
      <Modal show={show} closeModal={close}>
        <div className={classes.Container}>
          <h3 className={classes.Title}>
            Create from an Existing Activity Template
          </h3>
          <div className={classes.Form}>
            <div className={classes.FormSection}>
              <div className={classes.VerticalButtons}>
                <RadioBtn
                  name="community"
                  checked={community}
                  check={() =>
                    this.setState({
                      community: true,
                      ownResources: false,
                      thisCourse: false,
                    })
                  }
                >
                  From the Community
                </RadioBtn>
                <RadioBtn
                  name="ownActivities"
                  checked={ownResources}
                  check={() =>
                    this.setState({
                      ownResources: true,
                      thisCourse: false,
                      community: false,
                    })
                  }
                >
                  From Your Activity Templates
                </RadioBtn>
                {course && resource !== 'activities' ? (
                  <RadioBtn
                    name="ownActivities"
                    checked={thisCourse}
                    check={() =>
                      this.setState({
                        thisCourse: true,
                        ownResources: false,
                        community: false,
                      })
                    }
                  >
                    From This Course
                  </RadioBtn>
                ) : null}
              </div>
            </div>
            {mode === 'create' ? (
              <div className={classes.FormSection}>
                <TextInput
                  light
                  label="Due Date (Optional)"
                  name="dueDate"
                  type="date"
                  change={(event) =>
                    this.setState({ dueDate: event.target.value })
                  }
                />
              </div>
            ) : null}
            <div className={classes.Status}>
              You&#39;ve selected {selected.length} activity templates
            </div>
            <div className={classes.ActivityList}>
              <BoxList
                list={list}
                selecting
                select={this.select}
                auto
                maxHeight={300}
              />
            </div>
            <div className={classes.Submit}>
              <Button click={this.submit} theme="Small" m={10}>
                Done
              </Button>
              <Button click={close} m={10}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

FromActivity.propTypes = {
  courseActivities: PropTypes.arrayOf(PropTypes.shape({})),
  userActivities: PropTypes.arrayOf(PropTypes.shape({})),
  show: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  course: PropTypes.shape({}),
  resource: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  create: PropTypes.func.isRequired,
  copy: PropTypes.func.isRequired,
};

FromActivity.defaultProps = {
  courseActivities: [],
  userActivities: [],
  course: null,
};

export default FromActivity;
