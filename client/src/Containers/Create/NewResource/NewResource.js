import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { hri } from 'human-readable-ids';
import { NewResource, FromActivity } from '../../../Layout';
import { getUserResources, populateResource }from '../../../store/reducers';
import Aux from '../../../Components/HOC/Auxil';
import Button from '../../../Components/UI/Button/Button';
import classes from '../create.css';
import { connect } from 'react-redux';
import {
  createCourse, 
  createRoom, 
  createActivity, 
  createCourseTemplate,
  updateUser,
  createRoomFromActivity,
} from '../../../store/actions/';

const imageThemes = [
  'frogideas', 'duskfalling',
  'sugarsweets', 'heatwave',
  'daisygarden', 'seascape',
  'summerwarmth', 'bythepool',
  'berrypie',
]

const shapes = {
  activities: 'isogrids', 
  courses: 'labs/isogrids/hexa16',
  rooms: 'spaceinvaders',
}

class NewResourceContainer extends Component {
  state = {
    // rooms: [],
    creating: false,
    selecting: false,
  }


  create = () => this.setState({creating: true, selecting: false})
  select = () => this.setState({selecting: true, creating: false})

  submitForm = ({name, description, isPublic, dueDate, ggb, ggbFile, desmosLink}) => {
    let { resource } = this.props;
    let theme = imageThemes[Math.floor(Math.random()*imageThemes.length)];
    let newResource = {
      name: name,
      description: description,
      members: [{user: {_id: this.props.userId, username: this.props.username}, role: 'facilitator'}],
      creator: this.props.userId,
      isPublic: isPublic,
      image: `http://tinygraphs.com/${shapes[resource]}/${name}?theme=${theme}&numcolors=4&size=220&fmt=svg`
    }
    switch (resource) {
      case 'courses' :
        newResource.entryCode = hri.random();
        this.props.createCourse(newResource);
        break;
      case 'activities' :
        newResource.ggbFile = ggbFile;
        newResource.desmosLink = desmosLink;
        newResource.roomType = ggb ? 'geogebra' : 'desmos';
        if (this.props.courseId) {
          newResource.course = this.props.courseId;
          delete newResource.members
        }
        this.props.createActivity(newResource);
        break;
      case 'rooms' :
        newResource.entryCode = hri.random();
        newResource.ggbFile = ggbFile;
        newResource.desmosLink = desmosLink;
        newResource.dueDate = dueDate;
        if (this.props.courseId) newResource.course = this.props.courseId;
        newResource.roomType = ggb ? 'geogebra' : 'desmos';
        this.props.createRoom(newResource);
        break;
      default: break;
    }
    this.setState({creating: false})
    if (this.props.intro) {
      this.props.updateUser({accountType: 'facilitator'})
      this.props.history.push(`/myVMT/${resource}`)
    }
  }

  redirectToActivity = () => {
    this.props.history.push('/community/activities/selecting')
  }

  render() {
    // INTRO = TRUE IF WE'VE NAVIGATED FROM THE 'BECOME A FACILITATOR PAGE'
    let { resource, intro, courseId } = this.props;
    let displayResource;
    if (resource === 'activities') {
      displayResource = 'Activity'
    } else { displayResource = resource.charAt(0).toUpperCase() + resource.slice(1, resource.length - 1); }
    // @IDEA ^ while I've never seen this done before...maybe it'd be cleaner to have a file of static content and just import it in so we don't have these long strings all over
    // console.log(this.props.course.activities)
    console.log("USERID: ", this.props.userId)
    return (
      <Aux>
        {this.state.creating ? <NewResource 
          resource={resource} 
          displayResource={displayResource} 
          show={this.state.creating}
          ggb={this.state.ggb}
          close={() => this.setState({creating: false})}
          submit={this.submitForm}
        /> : null}
        {this.state.selecting ? <FromActivity 
          resource={resource}
          show={this.state.selecting} 
          close={() => this.setState({selecting: false})} 
          course={courseId}
          userActivities={this.props.userActivities}  
          courseActivities={this.props.course ? this.props.course.activities : null}
          create={this.props.createRoomFromActivity}
          userId={this.props.userId}
        /> : null}
        <div className={classes.Button}><Button theme={'Small'} click={this.create} data-testid={`create-${displayResource}`}>Create <span className={classes.Plus}><i className="fas fa-plus"></i></span></Button></div>
        {(resource === 'activities' && courseId && !intro) ? <div className={classes.Button}><Button theme={'Small'} click={this.select}>Select an existing activity</Button></div> : null}
        {(resource === 'activities' && !courseId && !intro) ? <div className={classes.Button}><Button theme={"Small"} click={this.redirectToActivity}>Select an activity from the community</Button></div> : null}
        {(resource === 'rooms' && !intro) ? <div className={classes.Button}><Button theme={"Small"} click={this.select}>Create from an Activity</Button></div> : null}
      </Aux>      
    )
  }
}

let mapStateToProps = (store, ownProps) => {
  return {
    myRooms: store.user.rooms,
    rooms: store.rooms.rooms, // ????
    userId: store.user._id,
    username: store.user.username,
    userActivities: getUserResources(store, 'activities') || [],
    course: ownProps.match.params.course_id ? populateResource(store, 'courses', ownProps.match.params.course_id, ['activities']) : null,
  }
}

export default withRouter(connect(mapStateToProps, {
  createCourse, 
  createRoom, 
  createActivity, 
  createCourseTemplate,
  updateUser,
  createRoomFromActivity,
})(NewResourceContainer));
