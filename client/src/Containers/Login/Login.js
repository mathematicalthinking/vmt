import React, { Component } from 'react';
import { connect } from 'react-redux';
import Input from '../../Components/Form/TextInput/TextInput';
import * as actions from '../../store/actions/';
import GoogleSignIn from '../../Components/Form/Google/LoginButton';
import { Redirect } from 'react-router-dom';
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

  changeHandler = (event) => {
    let updatedControls =  { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    })

  }

  loginHandler = (event) => {
    event.preventDefault();
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
        />
      )
    })
    return (
      this.props.loggedIn ?
      <Redirect to='/rooms'/> :
      <div>
        <div>Login</div>
        <form onSubmit={this.loginHandler}>
          {form}
          <button>Submit</button>
        </form>
        <div>or sign in with google</div>
        <GoogleSignIn click={this.googleLogin} />
      </div> 
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogin: (username, password) => dispatch(actions.login(username, password)),
    onGoogleLogin: (username, password) => dispatch(actions.googleLogin(username, password))
  }
}

const mapStateToProps = store => {
  return {
    loggedIn: store.authReducer.loggedIn
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);
