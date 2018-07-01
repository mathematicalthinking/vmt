import React, { Component } from 'react';
import TextInput from '../../Components/Form/TextInput/TextInput';
import Aux from '../../Components/HOC/Auxil';
import glb from '../../global.css';
class NewUser extends Component {
  state = {
    form: [
      {
        type: 'text',
        name: 'firstName',
        label: 'First Name'
      },
      {
        type: 'text',
        name: 'lastname',
        label: 'Last Name',
      },
      {
        type: 'text',
        name: 'username',
        label: 'Username',
      },
      {
        type: 'email',
        name: 'email',
        label: 'Email',
      }
    ]
  }
  // pass to text inputs to update state from user input
  changeHandler = (event) => {
    let updatedForm =  { ...this.state.controls };
    updatedForm[event.target.name].value = event.target.value;
    this.setState({
      form: updatedForm,
    })

  }
  render() {
    const formElements = this.state.form.map(elem => (
        <TextInput type={elem.type} label={elem.label} name={elem.name} />
      )
    )
    return (
      <Aux>
        <h2>Create A New User</h2>
        <div className={glb.FlexCol}>
          {formElements}
        </div>
        <button classNamee='btn btn-default'>Create</button>
      </Aux>
    )
  }
}

export default NewUser;
