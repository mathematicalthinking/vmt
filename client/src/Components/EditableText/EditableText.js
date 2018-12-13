import React, { Component } from 'react';
import { Aux, Button } from '../../Components';
import classes from './editableText.css';
import { connect } from 'react-redux';
import { updateRoom, updateActivity, update } from '../../store/actions';
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

  updateText = (event) => {
    this.setState({text: event.target.value})
  }

  toggleEdit = () => {
    console.log('toggling edit')
    this.setState(prevState => ({
      editing: !prevState.editing   
    }))
  }

  render() {
    console.log(this.props.type)
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
              <div><Button m={10} click={this.submitInstructions}>Save</Button></div>
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

export default EditableText;