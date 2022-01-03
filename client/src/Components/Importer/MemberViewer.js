import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { validateExistingField } from 'utils/validators';
import { Button } from 'Components';
import DataViewer from './DataViewer';

export default function MemberViewer(props) {
  // props will be data, user, onSubmit
  const { data } = props;
  const [showModal, setShowModal] = React.useState(false);

  const handleClick = () => setShowModal(true);

  const handleOnCancel = () => setShowModal(false);

  const handleOnClose = async ({ data: newData, sponsors }) => {
    const { user: creator, onSubmit } = props;
    const userObjects = await Promise.all(
      newData.map(async (user) => {
        const existingUser = await validateExistingField(
          'username',
          user.username
        );
        const { organization, identifier, ...rest } = user;
        return existingUser
          ? {
              ...existingUser,
              metadata: { organization, identifier },
              sponsor: sponsors[user.username] || creator._id,
            }
          : {
              accountType: 'pending',
              ...rest,
              metadata: { organization, identifier },
              sponsor: sponsors[user.username] || creator._id,
            };
      })
    );

    setShowModal(false);
    onSubmit(userObjects);
  };

  return (
    <Fragment>
      <DataViewer
        show={showModal}
        data={data}
        onClose={handleOnClose}
        onCancel={handleOnCancel}
        columnConfig={[
          { property: 'username', header: 'Username', readOnly: true },
          { property: 'email', header: 'Email' },
          {
            property: 'isGmail',
            header: 'Require Login via Google with Email',
            type: 'boolean',
          },
          { property: 'firstName', header: 'First Name*' },
          {
            property: 'lastName',
            header: 'Last Name* (full, inital, or other)',
          },
          { property: 'organization', header: 'Affiliation' },
          { property: 'identifier', header: 'Student or Org ID' },
          { property: 'sponsor', header: 'Teacher VMT Username' },
          {
            property: 'comment',
            header: 'Comments (* req)',
            style: { color: 'red' },
            readOnly: true,
          },
        ]}
      />
      <Button click={handleClick}>Edit Members</Button>
    </Fragment>
  );
}

MemberViewer.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
};

MemberViewer.defaultProps = {
  data: [],
};
