import React, { Component } from 'react';
import { connect } from 'react-redux';
import Input from '../../Components/Form/TextInput/TextInput';
import Button from '../../Components/UI/Button/Button';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import * as actions from '../../store/actions/';
import GoogleSignIn from '../../Components/Form/Google/LoginButton';
import { Redirect } from 'react-router-dom';
import glb from '../../global.css';
import classes from './login.css'
class Login extends Component {
  state = {
    controls: {
      username: {
        type: 'text',
        placeholder: 'username',
        value: '',
      },
      password: {
        type: 'password',
        placeholder: 'password',
        value: '',
      }
    }
  }
  // pass to text inputs to update state from user input
  changeHandler = (event) => {
    let updatedControls =  { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    })

  }

  // submit form
  loginHandler = event => {
    event.preventDefault();
    // pass submission off to redux
    this.props.onLogin(
      this.state.controls.username.value,
      this.state.controls.password.value
    )
  }


  googleLogin = (event) => {
    this.props.onGoogleLogin(
      this.state.controls.username.value,
      this.state.controls.password.value
    )
  }

  render() {
    const formElements = Object.keys(this.state.controls);
    const form = formElements.map(formElement => {
      const elem = {...this.state.controls[formElement]}
      return (
        <Input
          key={formElement}
          type={elem.type}
          name={formElement}
          placeholder={elem.placeholder}
          value={elem.value}
          change={this.changeHandler}
          label={elem.placeholder}
        />
      )
    })

    return (
      this.props.loggedIn ? <Redirect to='/rooms'/> :
      <div className={classes.LoginContainer}>
        <ContentBox title='Login'>
          <form onSubmit={this.loginHandler} className={glb.FlexCol}>
            {form}
            <Button>Login</Button>
          </form>
          <div>or</div>
          <GoogleSignIn click={this.googleLogin} />
        </ContentBox>
      </div>
    )
  }
}

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    onLogin: (username, password) => dispatch(actions.login(username, password)),
    onGoogleLogin: (username, password) => dispatch(actions.googleLogin(username, password))
  }
}

// connect redux store to react props
const mapStateToProps = store => {
  return {
    loggedIn: store.userReducer.loggedIn
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);
