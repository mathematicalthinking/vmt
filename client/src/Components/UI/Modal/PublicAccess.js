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
  user,
  setAdmin,
}) => {
  const displayResource = resource.slice(0, resource.length - 1);
  return (
    <Modal show closeModal={closeModal}>
      <p>
        If you would like to add this {displayResource} to your list of
        resources, click &#34;Join&#34;.
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
      </div>
      {user.isAdmin ? (
        <div>
          <p className={classes.Or}>Or</p>
          <div className={classes.Row}>
            <Button data-testid="view-as-admin" click={setAdmin}>
              View as Admin
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

PublicAccess.propTypes = {
  resource: PropTypes.string.isRequired,
  resourceId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  joinWithCode: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  user: PropTypes.shape({
    isAdmin: PropTypes.bool,
  }).isRequired,
  setAdmin: PropTypes.func.isRequired,
};

export default PublicAccess;
