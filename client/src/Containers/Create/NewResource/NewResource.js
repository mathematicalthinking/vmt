import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { hri } from "human-readable-ids";
import Step1 from "./Step1";
import Step2Copy from "./Step2Copy";
import Step2New from "./Step2New";
import Step3 from "./Step3";
import DueDate from "../DueDate";
import RoomOpts from "./RoomOpts";
import { getUserResources, populateResource } from "../../../store/reducers";
import { Modal, Aux, Button } from "../../../Components/";
import classes from "../create.css";
import { connect } from "react-redux";
import {
  createCourse,
  createRoom,
  createActivity,
  createCourseTemplate,
  updateUser,
  createRoomFromActivity,
  copyActivity
} from "../../../store/actions/";
import API from "../../../utils/apiRequests";
// import propertyOf from 'lodash/propertyOf';

const imageThemes = [
  "frogideas",
  "duskfalling",
  "sugarsweets",
  "heatwave",
  "daisygarden",
  "seascape",
  "summerwarmth",
  "bythepool",
  "berrypie"
];

const shapes = {
  activities: "isogrids",
  courses: "labs/isogrids/hexa16",
  rooms: "spaceinvaders"
};

const initialState = {
  // rooms: [],
  creating: false, // true will open modal and start creation process
  copying: false,
  ggb: true,
  step: 0, // step of the creation process
  name: "",
  description: "",
  desmosLink: "",
  ggbFiles: "",
  appName: "",
  dueDate: "",
  activities: [],
  privacySetting: "public"
};

class NewResourceContainer extends Component {
  state = { ...initialState };

  startCreation = () => this.setState({ creating: true });

  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  setCopying = event => {
    this.setState({ copying: event.target.name === "copy" });
  };

  // @TODO move this somewhere it can be shared with Containsers/Workspace/NewTabForm
  // maybe it makes sense to move newTabForm Here because its creating something
  uploadGgbFiles = () => {
    let files = this.state.ggbFiles;
    if (typeof files !== "object" || files.length < 1) {
      return Promise.resolve({
        data: {
          result: []
        }
      });
    }
    let formData = new FormData();

    for (let f of files) {
      formData.append("ggbFiles", f);
    }
    return API.uploadGgbFiles(formData);
  };

  submitForm = () => {
    let { resource } = this.props;
    let theme = imageThemes[Math.floor(Math.random() * imageThemes.length)];

    let newResource = {
      name: this.state.name,
      description: this.state.description,
      creator: this.props.userId,
      privacySetting: this.state.privacySetting,
      activities:
        this.state.activities.length > 0 ? this.state.activities : null,
      desmosLink: this.state.desmosLink,
      course: this.props.courseId,
      roomType: this.state.ggb ? "geogebra" : "desmos",
      image: `http://tinygraphs.com/${shapes[resource]}/${
        this.state.name
      }?theme=${theme}&numcolors=4&size=220&fmt=svg`
    };
    if (newResource.privacySetting === "private") {
      newResource.entryCode = hri.random();
    }
    return this.uploadGgbFiles().then(results => {
      if (results && results.data) {
        newResource.ggbFiles = results.data.result;
      }
      switch (resource) {
        case "courses":
          delete newResource.activities;
          delete newResource.ggbFiles;
          delete newResource.desmosLink;
          delete newResource.course;
          delete newResource.roomType;
          newResource.members = [
            {
              user: { _id: this.props.userId, username: this.props.username },
              role: "facilitator"
            }
          ];
          this.props.createCourse(newResource);
          break;
        case "activities":
          this.props.createActivity(newResource);
          break;
        case "rooms":
          newResource.members = [
            {
              user: { _id: this.props.userId, username: this.props.username },
              role: "facilitator"
            }
          ];
          newResource.dueDate = this.state.dueDate;
          newResource.appName = this.state.appName;
          console.log(newResource);
          this.props.createRoom(newResource);
          break;
        default:
          break;
      }
      this.setState({ ...initialState });
      if (this.props.intro) {
        this.props.updateUser({ accountType: "facilitator" });
        this.props.history.push(`/myVMT/${resource}`);
      }
    });
  };

  redirectToActivity = () => {
    this.props.history.push("/community/activities/selecting");
  };

  addActivity = (event, id) => {
    let updatedActivities;
    if (this.state.activities.indexOf(id) >= 0) {
      updatedActivities = this.state.activities.filter(acId => acId !== id);
    } else {
      updatedActivities = [...this.state.activities, id];
    }
    this.setState({ activities: updatedActivities });
  };

  setGgb = event => {
    this.setState({ ggb: event.target.name === "geogebra" });
  };

  setGgbFile = event => {
    this.setState({
      ggbFiles: event.target.files
    });
  };

  setGgbApp = appName => {
    this.setState({ appName });
  };

  setDueDate = dueDate => {
    this.setState({ dueDate });
  };
  setPrivacy = privacySetting => {
    this.setState({ privacySetting });
  };
  nextStep = direction => {
    let copying = this.state.copying;
    if (this.state.step === 0) {
      if (direction === "copy") {
        copying = true;
      }
    }
    this.setState({
      step: this.state.step + 1,
      copying: copying
    });
  };

  prevStep = () => {
    this.setState({
      copying: this.state.step === 1 ? false : this.state.copying,
      step: this.state.step - 1 || 0
    });
  };

  closeModal = () => {
    this.setState({
      copying: false,
      step: 0,
      creating: false
    });
  };

  render() {
    // Intro = true if and only if we've navigated from the "Become a Facilitator" page
    let { resource } = this.props;
    let displayResource;
    if (resource === "activities") {
      displayResource = "activity";
    } else {
      displayResource = resource.slice(0, resource.length - 1);
    }

    let steps = [
      <Step1
        displayResource={displayResource}
        name={this.state.name}
        description={this.state.description}
        changeHandler={this.changeHandler}
      />,
      this.state.copying ? (
        <Step2Copy
          displayResource={displayResource}
          addActivity={this.addActivity}
        />
      ) : (
        <Step2New
          setGgb={this.setGgb}
          ggb={this.state.ggb}
          setGgbFile={this.setGgbFile}
          changeHandler={this.changeHandler}
          desmosLink={this.state.desmosLink}
        />
      ),
      <Step3
        displayResource={displayResource}
        check={this.setPrivacy}
        privacySetting={this.state.privacySetting}
      />
    ];
    if (resource === "rooms") {
      steps.splice(
        2,
        0,
        <DueDate dueDate={this.state.dueDate} selectDate={this.setDueDate} />
      );
      steps.splice(
        2,
        0,
        <RoomOpts
          ggb={this.state.ggb}
          setGgbApp={this.setGgbApp}
          appName={this.state.appName}
        />
      );
    }

    if (resource === "courses") {
      steps.splice(1, 1);
    }

    let stepDisplays = steps.map((step, i) => (
      <div
        className={[
          classes.Step,
          i <= this.state.step ? classes.CompletedStep : null
        ].join(" ")}
      />
    ));

    let buttons;
    if (this.state.step === 0) {
      if (resource === "courses") {
        buttons = <Button click={this.nextStep}>next</Button>;
      } else {
        buttons = (
          <div className={classes.Row}>
            <Button
              disabled={this.state.name.length === 0}
              click={() => {
                this.nextStep("copy");
              }}
              m={5}
            >
              copy existing activities
            </Button>
            <Button
              disabled={this.state.name.length === 0}
              click={() => {
                this.nextStep("new");
              }}
              m={5}
            >
              create a new {displayResource}
            </Button>
          </div>
        );
      }
    } else if (this.state.step === steps.length - 1) {
      buttons = (
        <div className={classes.Row}>
          <Button data-testId="create" click={this.submitForm}>
            create
          </Button>
        </div>
      );
    } else {
      buttons = <Button click={this.nextStep}>next</Button>;
    }

    return (
      <Aux>
        {this.state.creating ? (
          <Modal show={this.state.creating} closeModal={this.closeModal}>
            {this.state.step > 0 ? (
              <i
                onClick={this.prevStep}
                className={["fas", "fa-arrow-left", classes.BackIcon].join(" ")}
              />
            ) : null}
            <div className={classes.Container}>
              <h2 className={classes.ModalTitle}>
                Create {resource === "activities" ? "an" : "a"}{" "}
                {displayResource}
              </h2>
              {steps[this.state.step]}
            </div>
            {buttons}
            <div className={classes.StepDisplayContainer}>{stepDisplays}</div>
          </Modal>
        ) : null}
        <div className={classes.Button}>
          <Button
            theme={"Small"}
            click={this.startCreation}
            data-testid={`create-${displayResource}`}
          >
            Create{" "}
            <span className={classes.Plus}>
              <i className="fas fa-plus" />
            </span>
          </Button>
        </div>
      </Aux>

      //   {this.state.creating ? <NewResource
      //     step={this.state.step}
      //     resource={resource}
      //     displayResource={displayResource}
      //     show={this.state.creating}
      //     ggb={this.state.ggb}
      //     close={() => this.setState({creating: false})}
      //     submit={this.submitForm}
      //   /> : null}
      //   <div className={classes.Button}>
      //     <Button theme={'Small'} click={this.create} data-testid={`create-${displayResource}`}>
      //       Create <span className={classes.Plus}><i className="fas fa-plus"></i></span>
      //     </Button>
      //   </div>
    );
  }
}

let mapStateToProps = (store, ownProps) => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms, // ????
    userId: store.user._id,
    username: store.user.username,
    userActivities: getUserResources(store, "activities") || [],
    course: ownProps.match.params.course_id
      ? populateResource(store, "courses", ownProps.match.params.course_id, [
          "activities"
        ])
      : null
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    {
      createCourse,
      createRoom,
      createActivity,
      createCourseTemplate,
      updateUser,
      createRoomFromActivity,
      copyActivity
    }
  )(NewResourceContainer)
);
