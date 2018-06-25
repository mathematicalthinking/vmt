import React, { Component } from 'react';
import Input from '../../Components/Form/TextInput/TextInput';
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
    console.log(event.target.name)
    console.log("here", event.target.name, event.target.value);
    let updatedControls =  { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    console.log(updatedControls)
    this.setState({
      controls: updatedControls,
    })

  }

  render() {
    const formElements = Object.keys(this.state.controls);
    const form = formElements.map(formElement => {
      console.log(this.state.controls[formElement])
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
      <div>
        <div>Login</div>
        {form}
        <button>Submit</button>
      </div>
    )
  }
}

export default Login;
