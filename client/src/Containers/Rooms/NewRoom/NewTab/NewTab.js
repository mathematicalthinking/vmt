import React, { Component } from 'react';
import TextInput from '../../../../Components/Form/TextInput/TextInput';
import Aux from '../../../../Components/HOC/Auxil';
class NewTab extends Component {
  render() {
    return (
      <Aux>
        <div className='form-group'>
          <TextInput name='tabname' label='Tab Name' />
        </div>
        <div className='form-group'>
          <TextInput name='tabtype' label='Tab Label' />
        </div>
        <div className='form-group'>
          <label>Default file</label>
          <button>Choose file</button>
        </div>
      </Aux>
    )
  }
}

export default NewTab;
