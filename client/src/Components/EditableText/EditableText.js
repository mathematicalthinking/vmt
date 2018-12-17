import React, { Component } from 'react';
import { Aux, Button } from '../../Components';
import classes from './editableText.css';
import { connect } from 'react-redux';
import { updateRoomTab, updateActivity, updateCourse, updateActivityTab, } from '../../store/actions';
class EditableText extends Component {

  state = {
    text: this.props.children,
    editing: false,
  }

  // componentDidMount(){
  //   this.setState({
  //     text: this.props.children
  //   })
  // }
  componentDidUpdate(prevProps, prevState){
    if (prevState === this.state && prevProps.children !== this.props.children) {
      this.setState({text: this.props.children})
    }
  }

  updateText = (event) => {
    this.setState({text: event.target.value})
  }

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing   
    }))
  }

  submit = () => {
    let { 
      resource, 
      parentResource,
      parentId , 
      field,
      id, 
    } = this.props;
    console.log(parentResource)
    if (parentResource === 'room') {
      this.props.updateRoomTab(parentId, id, {[field]: this.state.text})
    } else if (parentResource === 'activity') {
      console.log("updatingActivtiy")
      this.props.updateActivityTab(parentId, id, {[field]: this.state.text})
    }
    this.toggleEdit();
  }

  render() {
    return (
      <Aux>
       { this.state.editing
          ? <div className={this.props.inputType === 'TEXT_AREA' ? classes.EditContainer : classes.EditLine} >
            <b>{this.props.title}</b>
            {this.props.inputType === 'TEXT_AREA' 
              ? <textarea className={classes.TextArea} onChange={this.updateText} value={this.state.text}/>
              : <input className={classes.TextInput} onChange={this.updateText} value={this.state.text}/>
            }
            <div className={classes.EditButtons}>
              <div><Button m={10} click={this.submit}>Save</Button></div>
              <div><Button m={10} click={this.toggleEdit}>Cancel</Button></div>
            </div>
          </div> 
          : <div>
              {this.props.owner ?  <i onClick={this.toggleEdit} className={["fas fa-edit", classes.ToggleEdit].join(' ')}></i> : null}
              <b>{this.props.title}</b> {this.props.children}
            </div>  
        }
      </Aux>
    )
  }
}

export default connect(null, {updateRoomTab, updateActivity, updateCourse, updateActivityTab})(EditableText);