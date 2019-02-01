import React, { PureComponent } from "react";
import { Redirect } from "react-router-dom";
import Button from "../../Components/UI/Button/Button";
import Aux from "../../Components/HOC/Auxil";
import classes from "./login.css";
import Input from "../../Components/Form/TextInput/TextInput";
import Background from "../../Components/Background/Background";
class LoginLayout extends PureComponent {
  // / Im not really a fan of how this is setup anymore
  state = {
    controls: {
      username: {
        type: "text",
        placeholder: "",
        value: "",
        label: "Username"
      },
      password: {
        type: "password",
        placeholder: "",
        value: "",
        label: "Password"
      }
    }
  };

  componentDidMount() {
    window.addEventListener("keypress", this.onKeyPress);
  }

  componentWillUnmount() {
    if (this.props.errorMessage) {
      this.props.clearError();
    }
    window.removeEventListener("keypress", this.onKeyPress);
  }

  onKeyPress = event => {
    if (event.key === "Enter") {
      this.loginHandler();
    }
  };

  // pass to text inputs to update state from user input
  changeHandler = event => {
    let updatedControls = { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls
    });
    // if there's an error message from a previous request clear it.
    if (this.props.errorMessage) {
      this.props.clearError();
    }
  };

  // submit form
  loginHandler = () => {
    // event.preventDefault();
    // pass submission off to redux
    this.props.login(
      this.state.controls.username.value,
      this.state.controls.password.value
    );
  };

  googleLogin = event => {
    this.props.onGoogleLogin(
      this.state.controls.username.value,
      this.state.controls.password.value
    );
  };
  render() {
    const formElements = Object.keys(this.state.controls);
    const form = formElements.map(formElement => {
      const elem = { ...this.state.controls[formElement] };
      return (
        <Input
          key={formElement}
          type={elem.type}
          name={formElement}
          placeholder={elem.placeholder}
          value={elem.value}
          change={this.changeHandler}
          label={elem.label}
        />
      );
    });
    return this.props.loggedIn ? (
      <Redirect to="/myVMT/courses" />
    ) : (
      <div className={classes.Container}>
        <Background bottomSpace={-60} fixed />
        <div className={classes.LoginContainer}>
          <h2 className={classes.Title}>Login</h2>
          <form onSubmit={this.loginHandler} className={classes.Form}>
            {form}
            <div className={classes.ErrorMsg}>
              <div className={classes.Error}>{this.props.errorMessage}</div>
            </div>
            {this.props.loading ? (
              <Aux>
                {/* <Backdrop show={true} /> */}
                {/* <img className={classes.Loading} src={Loading} alt='loading' /> */}
              </Aux>
            ) : null}
          </form>
          <div className={classes.Submit}>
            <Button click={this.loginHandler} theme={"Big"}>
              Login
            </Button>
          </div>
          {/* <div>or</div> */}
          {/* <GoogleSignIn click={this.googleLogin} /> */}
        </div>
      </div>
    );
  }
}

export default LoginLayout;
