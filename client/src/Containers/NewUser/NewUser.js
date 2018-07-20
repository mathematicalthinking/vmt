import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import TextInput from '../../Components/Form/TextInput/TextInput';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import Button from '../../Components/UI/Button/Button';
import glb from '../../global.css';
import classes from './newUser.css';
import * as actions from '../../store/actions/';
import { connect } from 'react-redux';
class NewUser extends Component {
  // @TODO Redo Login containers state to match this. cleaner
  // @TODO dispatch an action to clear error message when user starts typing again
  state = {
    firstName: {type: 'text', label: 'First Name', value:''},
    lastName: {type: 'text', label: 'Last Name', value:''},
    username: {type: 'text', label: 'Username', value:''},
    email: {type: 'email', label: 'Email', value:''},
    password: {type: 'password', label: 'Password', value:'', name: 'password'},
  }
  // pass to text inputs to update state from user input
  changeHandler = event => {
    let updatedState = {...this.state};
    updatedState[event.target.name].value = event.target.value;
    this.setState(updatedState);
  }

  signUp = () => {
    const newUser = {
      firstName: this.state.firstName.value,
      lastName: this.state.lastName.value,
      username: this.state.username.value,
      email: this.state.email.value,
      password: this.state.password.value,
    }
    this.props.signup(newUser);
  }

  render() {
    console.log(this.props.errorMessage)
    if (this.props.loggedIn) {
    }
    const formList = Object.keys(this.state)
    const formElements = formList.map(elem => (
        <TextInput change={this.changeHandler} type={this.state[elem].type} label={this.state[elem].label} name={elem} />
      )
    )
    return (
      // after creating a user redirect to login @TODO figure out if this is for creating students or for signing up on your own
      // the answer will determine where/if we redirect to
      this.props.loggedIn ? <Redirect to='/'/> :
      <div className={classes.Register}>
        <ContentBox title='Create a New User'>
          <div className={glb.FlexCol}>
            {formElements}
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
    loggedIn: store.userReducer.loggedIn,
    errorMessage: store.userReducer.loginError,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    signup: body => dispatch(actions.signup(body)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewUser);
