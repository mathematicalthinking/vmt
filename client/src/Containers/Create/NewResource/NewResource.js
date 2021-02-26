import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { hri } from 'human-readable-ids';
import Step1 from './Step1';
import Step2Copy from './Step2Copy';
import Step2New from './Step2New';
import Step3 from './Step3';
import DueDate from '../DueDate';
import RoomOpts from './RoomOpts';
import { getUserResources, populateResource } from '../../../store/reducers';
import { Modal, Aux, Button } from '../../../Components';
import classes from '../create.css';
import {
  createCourse,
  createRoom,
  createActivity,
  updateUser,
  createRoomFromActivity,
  copyActivity,
} from '../../../store/actions';
import API from '../../../utils/apiRequests';
import formatImageUrl from '../tinyGraphs.utils';

const initialState = {
  // rooms: [],
  creating: false, // true will open modal and start creation process
  copying: false,
  ggb: true,
  step: 0, // step of the creation process
  name: '',
  description: '',
  desmosLink: '',
  ggbFiles: '',
  appName: 'classic',
  dueDate: null,
  activities: [],
  privacySetting: 'public',
};

class NewResourceContainer extends Component {
  state = { ...initialState };

  startCreation = () => this.setState({ creating: true });

  changeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  linkMod = (event) => {
    const codeLength = 24;
    const link = event.target.value.split('/');
    const code = link[link.length - 1].slice(0, codeLength);
    this.setState({
      desmosLink: code,
      [event.target.name]: event.target.value,
    });
  };

  setCopying = (event) => {
    this.setState({ copying: event.target.name === 'copy' });
  };

  // @TODO move this somewhere it can be shared with Containsers/Workspace/NewTabForm
  // maybe it makes sense to move newTabForm Here because its creating something
  uploadGgbFiles = () => {
    const { ggbFiles } = this.state;
    const files = ggbFiles;
    if (typeof files !== 'object' || files.length < 1) {
      return Promise.resolve({
        data: {
          result: [],
        },
      });
    }
    const formData = new window.FormData();

    // eslint-disable-next-line no-restricted-syntax
    for (const f of files) {
      formData.append('ggbFiles', f);
    }
    return API.uploadGgbFiles(formData);
  };

  submitForm = () => {
    const {
      name,
      description,
      privacySetting,
      activities,
      desmosLink,
      roomType,
      dueDate,
      appName,
    } = this.state;
    const {
      resource,
      courseId,
      userId,
      username,
      connectCreateCourse,
      connectCreateActivity,
      connectCreateRoom,
      connectUpdateUser,
      intro,
      history,
    } = this.props;

    const newResource = {
      name,
      description,
      desmosLink,
      privacySetting,
      creator: userId,
      activities: activities.length > 0 ? activities : null,
      course: courseId,
      roomType,
      image: formatImageUrl(name, resource),
    };
    if (newResource.privacySetting === 'private') {
      newResource.entryCode = hri.random();
    }
    return this.uploadGgbFiles().then((results) => {
      if (results && results.data) {
        newResource.ggbFiles = results.data.result;
      }
      switch (resource) {
        case 'courses':
          delete newResource.activities;
          delete newResource.ggbFiles;
          delete newResource.desmosLink;
          delete newResource.course;
          delete newResource.roomType;
          newResource.members = [
            {
              user: { username, _id: userId },
              role: 'facilitator',
            },
          ];
          connectCreateCourse(newResource);
          break;
        case 'activities':
          connectCreateActivity(newResource);
          break;
        case 'rooms':
          newResource.members = [
            {
              user: { username, _id: userId },
              role: 'facilitator',
            },
          ];
          newResource.dueDate = dueDate;
          if (roomType === 'geogebra') {
            newResource.appName = appName;
          }
          connectCreateRoom(newResource);
          break;
        default:
          break;
      }
      this.setState({ ...initialState });
      if (intro) {
        connectUpdateUser({ accountType: 'facilitator' });
        history.push(`/myVMT/${resource}`);
      }
    });
  };

  redirectToActivity = () => {
    const { history } = this.props;
    history.push('/community/activities/selecting');
  };

  addActivity = (event, id) => {
    const { activities } = this.state;
    let updatedActivities;
    if (activities.indexOf(id) >= 0) {
      updatedActivities = activities.filter((acId) => acId !== id);
    } else {
      updatedActivities = [...activities, id]; // becaue we're filtering above we probably don't need to spread activities here we could just push the id
    }
    this.setState({ activities: updatedActivities });
  };

  setRoomType = (event) => {
    this.setState({ roomType: event.target.name });
  };

  setGgbFile = (event) => {
    this.setState({
      ggbFiles: event.target.files,
    });
  };

  setGgbApp = (appName) => {
    this.setState({ appName });
  };

  setDueDate = (dueDate) => {
    this.setState({ dueDate });
  };
  setPrivacy = (privacySetting) => {
    this.setState({ privacySetting });
  };
  nextStep = (direction) => {
    let { copying } = this.state;
    const { step } = this.state;
    if (step === 0) {
      if (direction === 'copy') {
        copying = true;
      }
    }
    this.setState({
      step: step + 1,
      copying,
    });
  };

  prevStep = () => {
    const { step, copying } = this.state;
    this.setState({
      copying: step === 1 ? false : copying,
      step: step - 1 || 0,
    });
  };

  closeModal = () => {
    this.setState({
      copying: false,
      step: 0,
      creating: false,
    });
  };

  render() {
    // Intro = true if and only if we've navigated from the "Become a Facilitator" page
    const { resource } = this.props;
    const {
      name,
      description,
      privacySetting,
      activities,
      appName,
      copying,
      roomType,
      desmosLink,
      dueDate,
      step,
      creating,
    } = this.state;
    let displayResource;
    if (resource === 'activities') {
      displayResource = 'activity';
    } else {
      displayResource = resource.slice(0, resource.length - 1);
    }

    const steps = [
      <Step1
        key="step1"
        displayResource={displayResource}
        name={name}
        description={description}
        resource={resource}
        changeHandler={this.changeHandler}
      />,
      copying ? (
        <Step2Copy
          key="step2"
          displayResource={displayResource}
          addActivity={this.addActivity}
          selectedActivities={activities}
        />
      ) : (
        <Step2New
          key="step2"
          setRoomType={this.setRoomType}
          roomType={roomType}
          changeHandler={this.changeHandler}
        />
      ),
      <Step3
        key="step3"
        displayResource={displayResource}
        check={this.setPrivacy}
        privacySetting={privacySetting}
      />,
    ];
    if (resource === 'rooms') {
      steps.splice(
        2,
        0,
        <DueDate dueDate={dueDate} selectDate={this.setDueDate} />
      );
    }

    if (!copying && (resource === 'rooms' || resource === 'activities')) {
      steps.splice(
        2,
        0,
        <RoomOpts
          roomType={roomType}
          setGgbFile={this.setGgbFile}
          setGgbApp={this.setGgbApp}
          desmosLink={desmosLink}
          setDesmosLink={this.linkMod}
          appName={appName}
        />
      );
    }

    if (resource === 'courses') {
      steps.splice(1, 1);
    }

    const stepDisplays = steps.map((currentStep, i) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={`id-${i}`}
        className={[
          classes.Step,
          i <= step ? classes.CompletedStep : null,
        ].join(' ')}
      />
    ));

    let buttons;
    if (step === 0) {
      if (resource === 'courses') {
        buttons = <Button click={this.nextStep}>next</Button>;
      } else {
        buttons = (
          <Aux>
            <div className={classes.ModalButton}>
              <Button
                disabled={name.length === 0}
                click={() => {
                  this.nextStep('new');
                }}
                tabIndex={0}
                m={5}
              >
                create a new {displayResource}
              </Button>
            </div>
            <div className={classes.ModalButton}>
              <Button
                disabled={name.length === 0}
                click={() => {
                  this.nextStep('copy');
                }}
                m={5}
                tabIndex={0}
              >
                copy existing activities
              </Button>
            </div>
          </Aux>
        );
      }
    } else if (step === steps.length - 1) {
      buttons = (
        <div className={classes.ModalButton}>
          <Button data-testid="create" click={this.submitForm}>
            create
          </Button>
        </div>
      );
    } else {
      buttons = <Button click={this.nextStep}>next</Button>;
    }

    return (
      <Aux>
        {creating ? (
          <Modal height={470} show={creating} closeModal={this.closeModal}>
            {step > 0 ? (
              <i
                onClick={this.prevStep}
                onKeyPress={this.prevStep}
                tabIndex="-1"
                role="button"
                className={['fas', 'fa-arrow-left', classes.BackIcon].join(' ')}
              />
            ) : null}
            <div className={classes.Container}>
              <h2 className={classes.ModalTitle}>
                Create {resource === 'activities' ? 'an' : 'a'}{' '}
                {displayResource}
              </h2>
              <div className={classes.MainModalContent}>{steps[step]}</div>
              <div className={classes.Row}>{buttons}</div>
            </div>
            <div className={classes.StepDisplayContainer}>{stepDisplays}</div>
          </Modal>
        ) : null}
        <div className={classes.Button}>
          <Button
            theme="Small"
            click={this.startCreation}
            data-testid={`create-${displayResource}`}
          >
            Create{' '}
            <span className={classes.Plus}>
              <i className="fas fa-plus" />
            </span>
          </Button>
        </div>
      </Aux>
    );
  }
}

NewResourceContainer.propTypes = {
  resource: PropTypes.string.isRequired,
  courseId: PropTypes.string,
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  connectCreateCourse: PropTypes.func.isRequired,
  connectCreateRoom: PropTypes.func.isRequired,
  connectCreateActivity: PropTypes.func.isRequired,
  intro: PropTypes.bool,
  connectUpdateUser: PropTypes.func.isRequired,
  history: PropTypes.shape({}).isRequired,
};

NewResourceContainer.defaultProps = {
  courseId: null,
  intro: false,
};

const mapStateToProps = (store, ownProps) => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms, // ????
    userId: store.user._id,
    username: store.user.username,
    userActivities: getUserResources(store, 'activities') || [],
    course: ownProps.match.params.course_id
      ? populateResource(store, 'courses', ownProps.match.params.course_id, [
          'activities',
        ])
      : null,
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    {
      connectCreateCourse: createCourse,
      connectCreateRoom: createRoom,
      connectCreateActivity: createActivity,
      connectUpdateUser: updateUser,
      connectCreateRoomFromActivity: createRoomFromActivity,
      connectCopyActivity: copyActivity,
    }
  )(NewResourceContainer)
);
