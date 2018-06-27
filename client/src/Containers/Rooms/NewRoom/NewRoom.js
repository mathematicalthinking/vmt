import React from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
const newRoom = (props) => {
  return (
    <form>
      <TextInput
        name="roomName"
        label="Enter Room Name"
      />
      <TextInput
        name="Description"
        label="Description"
      />
    </form>
  )
}

export default newRoom;
