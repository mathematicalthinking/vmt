import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';
const privateAccess = props => {
  return (
    <Modal show={true}>
      <p>You currently don't have access to this course. If you would like to
        request access from the owner click "Join". When your request is accepted
        this course will appear in your list of courses on your profile.
      </p>
      <Button click={props.requestAccess}>Join</Button>
    </Modal>
  )
}

export default privateAccess;
