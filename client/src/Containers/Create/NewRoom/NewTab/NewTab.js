import React from 'react';
import TextInput from '../../../../Components/Form/TextInput/TextInput';
const NewTab = (props) => {
  return (
    <div id={props.id}>
      <div className='form-group'>
        <TextInput change={props.change} name='tabName' label='Tab Name' />
      </div>
      <div className='form-group'>
        <TextInput change={props.change} name='tabType' label='Tab type' />
      </div>
      <div className='form-group'>
        <label>Default file</label>
        <button>Choose file</button>
      </div>
    </div>
  )
}

export default NewTab;
