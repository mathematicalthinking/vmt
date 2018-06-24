import React, { Component } from 'react';
import Input from '../../Components/Form/TextInput/TextInput';
class Login extends Component {
  state = {
    username: '',
    password: '',
  }

  changeHandler = (event) => {
    console.log("function invoked")
    console.log(event.target.value)
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  render() {
    return (
      <div>
        <div>Login</div>
        <Input type="text" placeholder="username" onChange={event => (this.changeHandler(event))}/>
        <Input type="password" placeholder="password" onChange={event => this.changeHandler()}/>
      </div>
    )
  }
}

export default Login;
