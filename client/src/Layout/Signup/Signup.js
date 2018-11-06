import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TextInput from '../../Components/Form/TextInput/TextInput';
import Button from '../../Components/UI/Button/Button';
import classes from './signup.css';
import RadioBtn from '../../Components/Form/RadioBtn/RadioBtn';
import Background from '../../Components/Background/Background';
import Aux from '../../Components/HOC/Auxil';

class Signup extends Component {
  // @TODO Redo Login containers state to match this. cleaner
  // @TODO dispatch an action to clear error message when user starts typing again
  state = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    participantAccount: true,
  }

  componentDidMount(){
    if (this.props.temp && this.props.user){
      this.setState({username: this.props.user.username})
    }
  }

  componentWillUnmount() {
    if (this.props.errorMessage) {
      this.props.clearError();
    }
  }
  // pass to text inputs to update state from user input
  changeHandler = event => {
    let updatedState = {...this.state};
    updatedState[event.target.name] = event.target.value;
    this.setState(updatedState);
    if (this.props.errorMessage) {
      this.props.clearError();
    }
  }
  signUp = () => {
    const accountType = this.state.participantAccount ? 'participant' : 'facilitator';
    const newUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
      accountType,
    }
    if (this.props.temp) {
      newUser._id = this.props.user._id;
      newUser.rooms = [this.props.room]
      this.props.closeModal()
    }
    this.props.signup(newUser, this.props.room); // this.props.room will only exist when creating user from tempUser
  }

  render() {
    let containerClass = this.props.temp ? classes.ModalContainer : classes.SignupContainer;
    
    let initialValue = this.props.user ? this.props.user.username : '';
    return (
      // after creating a user redirect to login @TODO figure out if this is for creating participants or for signing up on your own
      // the answer will determine where/if we redirect to
      this.props.loggedIn && !this.props.temp ? <Redirect to={'/myVMT/courses'}/> :
      <Aux>
        {!this.props.temp ? <Background bottomSpace={-60}/> : null}
        <div className={classes.Container}>
          <div className={containerClass}>
            <h2 className={classes.Title}>Signup</h2>
            <form className={classes.Form}>
              <TextInput light={this.props.temp} change={this.changeHandler} type='text' label='First Name' name='firstName' />
              <TextInput light={this.props.temp} change={this.changeHandler} type='text' label='Last Name' name='lastName' />
              <TextInput light={this.props.temp} change={this.changeHandler} type='text' label='Username' name='username' value={(this.state.username.length > 0) ? this.state.username : initialValue}/> 
              <TextInput light={this.props.temp} change={this.changeHandler} type='email' label='Email' name='email' />
              <TextInput light={this.props.temp} change={this.changeHandler} type='password' label='Password' name='password' />
              <div style={{marginTop: 20}}>
                <label>Account Type</label>
                <div className={classes.Radios}>
                  <RadioBtn
                    checked={this.state.participantAccount}
                    check={() => this.setState({participantAccount: true})}>Participant
                  </RadioBtn>
                  <RadioBtn
                    checked={!this.state.participantAccount}
                    check={() => this.setState({participantAccount: false})}>facilitator
                  </RadioBtn>
                </div>
                <p>*Note: This just marks your primary account type, you can still be a
                  participant in some scenarios and a facilitator in others without making separate
                  accounts.
                </p>
              </div>
            </form>
            <div className={classes.ErrorMsg}>
              <div className={classes.Error}>{this.props.errorMessage}</div>
            </div>
            <div className={classes.Submit}>
              <Button theme={this.props.temp ? "Small" : "Big"} data-testid='submit-signup'click={this.signUp}>Signup</Button>
            </div>
          </div>
        </div>
      </Aux>
    )
  }
}

export default Signup;
