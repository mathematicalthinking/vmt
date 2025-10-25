import React from 'react';
import PropTypes from 'prop-types';
import { useAppModal } from 'utils';
import { Button } from 'Components';
import CourseCodeMemberImportModal from './CourseCodeMemberImportModal';

const CourseCodeMemberImport = (props) => {
  const { onImport, userId } = props;

  const { hide: hideModal, showBig: showCourseCodeImportModal } = useAppModal();

  const submit = (membersToInvite) => {
    onImport(membersToInvite);
    hideModal();
  };

  const handleCourseCodeImport = () => {
    showCourseCodeImportModal(
      <CourseCodeMemberImportModal
        key={Date.now()}
        onCancel={hideModal}
        onSubmit={submit}
        userId={userId}
      />
    );
  };

  return (
    <Button click={handleCourseCodeImport}>Import via Course Codes</Button>
  );
};

CourseCodeMemberImport.propTypes = {
  onImport: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default CourseCodeMemberImport;
