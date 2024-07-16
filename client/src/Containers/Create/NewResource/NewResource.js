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
  privacySetting: 'private',
  organization: '',
  school: '',
  district: '',
  gradeLevel: null,
};

class NewResourceContainer extends Component {
  constructor(props) {
    super(props);
    const { lastRoomType } = this.props;
    this.state = {
      ...initialState,
      roomType: lastRoomType,
    };
  }

  startCreation = () => this.setState({ creating: true });

  changeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  graphLinkMod = (event) => {
    const codeLength = 10;
    const link = event.target.value.split('/');
    const code = link[link.length - 1].slice(0, codeLength);
    this.setState({
      desmosLink: `https://www.desmos.com/calculator/${code}`,
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

  setLink = (event) => {
    this.setState({
      desmosLink: event.target.value,
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

  composeActivityUsers = () => {
    const { course } = this.props;

    // const activityUsers = course.members.filter((mem) => {
    //   if (mem.role === 'facilitator') return mem.user._id;
    // });
    const activityUsers = course.members
      .filter((mem) => mem.role === 'facilitator')
      .map((mem) => mem.user._id);
    return activityUsers;
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
      organization,
      school,
      district,
      gradeLevel,
    } = this.state;
    const {
      resource,
      userId,
      username,
      connectCreateCourse,
      connectCreateActivity,
      connectCreateRoom,
      connectUpdateUser,
      intro,
      history,
      parentActivityId,
      parentCourseId,
    } = this.props;

    const newResource = {
      name,
      description,
      desmosLink,
      privacySetting,
      creator: userId,
      activities: activities.length > 0 ? activities : null,
      course: parentCourseId,
      activity: parentActivityId,
      roomType,
      image: formatImageUrl(name, resource),
    };
    if (newResource.privacySetting === 'private') {
      newResource.entryCode = hri.random();
    }
    if (gradeLevel) {
      // newResource.gradeLevel = gradeLevel.value;
      // add gradeLevel to tags array
      const tags = [{ gradeLevel: gradeLevel.value }];
      newResource.tags = tags;
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
          newResource.metadata = { organization, district, school };
          connectCreateCourse(newResource);
          break;
        case 'activities':
          if (parentCourseId) newResource.users = this.composeActivityUsers();
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
          connectUpdateUser({ lastRoomType: roomType });
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
    const _updatedActivities = (activities) => {
      if (activities.indexOf(id) >= 0) {
        return activities.filter((acId) => acId !== id);
      }
      return [...activities, id]; // becaue we're filtering above we probably don't need to spread activities here we could just push the id
    };
    // TODO CHECK THIS REFACTOR
    this.setState((previousState) => ({
      activities: _updatedActivities(previousState.activities),
    }));
  };

  setRoomType = (roomType) => {
    this.setState({ roomType });
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
  nextStep = () => {
    this.setState((previousState) => ({
      step: previousState.step + 1,
    }));
  };

  prevStep = () => {
    // TODO CHECK THIS REFACTOR
    this.setState((previousState) => ({
      copying: previousState.step === 1 ? false : previousState.copying,
      step: previousState.step - 1 || 0,
    }));
  };

  closeModal = () => {
    this.setState({
      copying: false,
      step: 0,
      creating: false,
    });
  };

  gradeHandler = (selectedOption) => {
    this.setState({ gradeLevel: selectedOption });
  };

  gradeOptionsGenerator = () => {
    return [
      { label: '6', value: 6 },
      { label: '7', value: 7 },
      { label: '8', value: 8 },
    ];
  };

  render() {
    // Intro = true if and only if we've navigated from the "Become a Facilitator" page
    const { resource, userId } = this.props;
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
      organization,
      school,
      district,
      gradeLevel,
    } = this.state;
    let displayResource;
    if (resource === 'activities') {
      displayResource = 'template';
    } else {
      displayResource = resource.slice(0, resource.length - 1);
    }

    const steps = [
      <Step1
        key="step1"
        displayResource={displayResource}
        name={name}
        description={description}
        organization={organization}
        district={district}
        school={school}
        resource={resource}
        changeHandler={this.changeHandler}
        gradeSelectHandler={
          resource === 'activities' ? this.gradeHandler : null
        }
        gradeSelectOptions={
          resource === 'activities' ? this.gradeOptionsGenerator() : null
        }
        gradeSelectValue={resource === 'activities' ? gradeLevel : null}
      />,
      copying ? (
        <Step2Copy
          key="step2"
          displayResource={displayResource}
          addActivity={this.addActivity}
          selectedActivities={activities}
          userId={userId}
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
          setDesmosCalcLink={this.graphLinkMod}
          setLink={this.setLink}
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
                  this.nextStep();
                  this.setState({
                    copying: false,
                  });
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
                  this.nextStep();
                  this.setState({
                    copying: true,
                  });
                }}
                m={5}
                tabIndex={0}
              >
                use existing template
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
      buttons = (
        <Button
          disabled={copying && activities.length < 1}
          click={this.nextStep}
        >
          next
        </Button>
      );
    }

    return (
      <Aux>
        {creating ? (
          <Modal
            height={600}
            width={650}
            show={creating}
            closeModal={this.closeModal}
            isLoading
          >
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
                Create {resource === 'activities' ? 'a' : 'a'} {displayResource}
              </h2>
              <div
                className={classes.MainModalContent}
                style={
                  (step === 1 && copying) ||
                  (step === 0 && resource === 'courses')
                    ? { overflow: 'auto' }
                    : {}
                }
              >
                {steps[step]}
              </div>
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
  userId: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  connectCreateCourse: PropTypes.func.isRequired,
  connectCreateRoom: PropTypes.func.isRequired,
  connectCreateActivity: PropTypes.func.isRequired,
  intro: PropTypes.bool,
  lastRoomType: PropTypes.string.isRequired,
  connectUpdateUser: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  course: PropTypes.shape({ members: PropTypes.arrayOf(PropTypes.shape({})) }),
  parentActivityId: PropTypes.string,
  parentCourseId: PropTypes.string,
};

NewResourceContainer.defaultProps = {
  intro: false,
  course: null,
  parentActivityId: null,
  parentCourseId: null,
};

const mapStateToProps = (store, ownProps) => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms, // ????
    userId: store.user._id,
    username: store.user.username,
    lastRoomType: store.user.lastRoomType || 'desmosActivity',
    userActivities: getUserResources(store, 'activities') || [],
    course: ownProps.match.params.course_id
      ? populateResource(store, 'courses', ownProps.match.params.course_id, [
          'activities',
        ])
      : null,
  };
};

export default withRouter(
  connect(mapStateToProps, {
    connectCreateCourse: createCourse,
    connectCreateRoom: createRoom,
    connectCreateActivity: createActivity,
    connectUpdateUser: updateUser,
    connectCreateRoomFromActivity: createRoomFromActivity,
    connectCopyActivity: copyActivity,
  })(NewResourceContainer)
);
