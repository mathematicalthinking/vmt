import React from 'react';
import Modal from './Modal';
import Button from '../Button/Button';
import classes from './modal.css';
const publicAccess = ({
  resource,
  resourceId,
  userId,
  joinWithCode,
  closeModal,
}) => {
  let displayResource = resource.slice(0, resource.length - 1);
  return (
    <Modal show={true} closeModal={closeModal}>
      <p>
        If you would like to add this {displayResource} to your list of
        resources, click 'Join'.
        {/* If you just want to poke
        around click 'Explore' */}
      </p>
      <div className={classes.Row}>
        <Button
          m={5}
          theme={'Small'}
          click={() => {
            joinWithCode(resource, resourceId, userId);
          }}
        >
          Join
        </Button>
        {/* <Button m={5} theme={'Small'} click={() => 'clicked'}>
          Explore
        </Button> */}
      </div>
    </Modal>
  );
};

export default publicAccess;
