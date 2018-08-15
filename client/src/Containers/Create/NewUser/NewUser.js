import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
import Button from '../../../Components/UI/Button/Button';
import glb from '../../../global.css';
import classes from './newUser.css';
import * as actions from '../../../store/actions/';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
import { connect } from 'react-redux';
class NewUser extends Component {
  // @TODO Redo Login containers state to match this. cleaner
  // @TODO dispatch an action to clear error message when user starts typing again
  state = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    studentAccount: true,
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
    const accountType = this.state.studentAccount ? 'student' : 'teacher';
    const newUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      username: this.state.username,
      email: this.state.email,
      password: this.state.password,
      accountType,
    }
    this.props.signup(newUser);
  }

  render() {
    return (
      // after creating a user redirect to login @TODO figure out if this is for creating students or for signing up on your own
      // the answer will determine where/if we redirect to
      this.props.loggedIn ? <Redirect to='/'/> :
      <div className={classes.Register}>
        <ContentBox title='Create a New Account'>
          <div className={glb.FlexCol}>
            <form className={classes.Form}>
              <TextInput change={this.changeHandler} type='text' label='First Name' name='firstName' />
              <TextInput change={this.changeHandler} type='text' label='Last Name' name='lastName' />
              <TextInput change={this.changeHandler} type='text' label='Username' name='username' />
              <TextInput change={this.changeHandler} type='email' label='Email' name='email' />
              <TextInput change={this.changeHandler} type='password' label='Password' name='password' />
              <div>
                <label>Account Type</label>
                <div className={classes.Radios}>
                  <RadioBtn
                    checked={this.state.studentAccount}
                    check={() => this.setState({studentAccount: true})}>Student
                  </RadioBtn>
                  <RadioBtn
                    checked={!this.state.studentAccount}
                    check={() => this.setState({studentAccount: false})}>Teacher
                  </RadioBtn>
                </div>
                <p>*Note: This just marks your primary account type, you can still be a
                  student in some scenarios and a teacher in others without making separate
                  accounts.
                </p>
              </div>
            </form>
          </div>
          <div className={classes.ErrorMsg}>{this.props.errorMessage}</div>
          <Button click={this.signUp}>Create</Button>
        </ContentBox>
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.user.loginError,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    signup: body => dispatch(actions.signup(body)),
    clearError: () => dispatch(actions.clearError()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewUser);
