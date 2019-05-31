import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Button from '../Button/Button';
import classes from './modal.css';

const PublicAccess = ({
  resource,
  resourceId,
  userId,
  joinWithCode,
  closeModal,
}) => {
  const displayResource = resource.slice(0, resource.length - 1);
  return (
    <Modal show closeModal={closeModal}>
      <p>
        If you would like to add this {displayResource} to your list of
        resources, click &#34;Join&#34;.
        {/* If you just want to poke
        around click 'Explore' */}
      </p>
      <div className={classes.Row}>
        <Button
          m={5}
          theme="Small"
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

PublicAccess.propTypes = {
  resource: PropTypes.string.isRequired,
  resourceId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  joinWithCode: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default PublicAccess;
