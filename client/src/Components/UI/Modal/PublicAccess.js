import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';
const publicAccess = props => {
  return (
    <Modal show={true}>
      <p>If you would like to add this course (and all of this course's rooms) to your
        list of courses and rooms, click 'Join'. If you just want to poke around click 'Explore'
      </p>
      <Button theme={'Small'} click={props.grantAccess}>Join</Button>
      <Button theme={'Small'} click={() => 'clicked'}>Explore</Button>
    </Modal>
  )
}

export default publicAccess;
