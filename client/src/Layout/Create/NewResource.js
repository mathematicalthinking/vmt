import React, { Component } from 'react';
import classes from './create.css';
import { Modal, TextInput, Button, RadioBtn} from '../../Components';
class NewResource extends Component {

  state = {
    name: '',
    description: '',
    dueDate: '',
    ggb: false,
    ggbFile: '', 
    desmosLink: '',
    isPublic: true,
  }

  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  submit = () => {
    this.props.submit({...this.state})
  }

  render() {
    let { displayResource, resource, show, close } = this.props;
    return (
      <Modal
        show={show}
        closeModal={close}
        >
          <div className={classes.Container}>
            <h3 className={classes.Title}>Create a New {displayResource}</h3>
            <div className={classes.Form}>
              <div className={classes.FormSection}>
                <TextInput
                  light
                  name={`name`}
                  label={`${displayResource} Name`}
                  change={this.changeHandler}
                  width='100%'
                />
                <TextInput
                  light
                  name='description'
                  label='Description'
                  change={this.changeHandler}
                  width='100%'
                  data-testid={`${resource}-description`}
                />
              </div>
              {(resource === 'activities' || resource === 'rooms') ?
                <div className={classes.FormSection}>
                  <div className={classes.RadioButtons}>
                    <RadioBtn name='geogebra' checked={this.state.ggb} check={() => this.setState({ggb: true})}>GeoGebra</RadioBtn>
                    <RadioBtn name='desmos' checked={!this.state.ggb} check={() => this.setState({ggb: false})}>Desmos</RadioBtn>
                  </div>
                  {this.state.ggb ?
                    <div>
                      <div>Import a GeoGebra workspace</div>
                      <div><Button>Select a Geogebra File</Button></div>
                    </div> :
                    <TextInput
                      light
                      name='desmosLink'
                      label='Paste a Desmos workspace'
                      change={this.changeHandler}
                      width='80%'
                    />
                  }
                </div>
              : null}
              {(resource === 'rooms') ?
                <div className={classes.FormSection}>
                  <TextInput light label='Due Date (Optional)' name='dueDate' type='date' change={this.changeHandler} />
                </div>
              : null}
              <div className={classes.FormSection}>
                <div className={classes.RadioButtons}>
                  <RadioBtn name='public' checked={this.state.isPublic} check={() => this.setState({isPublic: true})}>Public</RadioBtn>
                  <RadioBtn name='private' checked={!this.state.isPublic} check={() => this.setState({isPublic: false})}>Private</RadioBtn>
                </div>
                <div className={classes.PrivacyDesc}>
                  Marking your {resource} as public allows other VMT users to view the activity
                  in your rooms without seeing any personal information about your participants.
                </div>
              </div>
              <div className={classes.Submit}>
                <div className={classes.Button}><Button theme={"Small"} data-testid={`${resource}-submit`} m={5} click={this.submit}>Submit</Button></div>
                <div className={classes.Button}><Button theme={"small"} m={5} click={close}>Cancel</Button></div>
              </div>
            </div>
          </div>
        </Modal>
    )
  }
}

export default NewResource;