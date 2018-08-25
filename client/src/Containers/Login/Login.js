import React, { Component } from 'react';
import { connect } from 'react-redux';
import Input from '../../Components/Form/TextInput/TextInput';
import Button from '../../Components/UI/Button/Button';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import * as actions from '../../store/actions/';
import GoogleSignIn from '../../Components/Form/Google/LoginButton';
import Loading from '../../Components/UI/Modal/Ripple.gif';
import Aux from '../../Components/HOC/Auxil';
import Backdrop from '../../Components/UI/Backdrop/Backdrop';
import { Redirect } from 'react-router-dom';
import glb from '../../global.css';
import classes from './login.css'
class Login extends Component {
  // Im not really a fan of how this is setup anymore
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
  componentWillUnmount() {
    if (this.props.errorMessage) {
      this.props.clearError();
    }
  }
  // pass to text inputs to update state from user input
  changeHandler = (event) => {
    let updatedControls =  { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    })
    // if there's an error message from a previous request clear it.
    if (this.props.errorMessage) {
      this.props.clearError();
    }
  }

  // submit form
  loginHandler = event => {
    event.preventDefault();
    // pass submission off to redux
    this.props.login(
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
      this.props.loggedIn ? <Redirect to='/profile/courses'/> :
      <div className={classes.LoginContainer}>
        <ContentBox title='Login' align='center'>
          <form onSubmit={this.loginHandler} className={[glb.FlexCol, classes.Form].join(' ')}>
            {form}
            <div className={classes.ErrorMsg}>{this.props.errorMessage}</div>
            {this.props.loading ?
              <Aux>
                <Backdrop show={true} />
                {/* <img className={classes.Loading} src={Loading} alt='loading' /> */}
              </Aux>
            : null}
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
    login: (username, password) => dispatch(actions.login(username, password)),
    onGoogleLogin: (username, password) => dispatch(actions.googleLogin(username, password)),
    clearError: () => dispatch(actions.clearError()),
  }
}

// connect redux store to react props
const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.user.loginError,
    loading: store.user.loggingIn,
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Login);
