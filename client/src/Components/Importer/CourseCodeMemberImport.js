import React from 'react';
import PropTypes from 'prop-types';
import { API, useAppModal } from 'utils';
import { Button } from 'Components';
import CourseCodeMemberImportModal from './CourseCodeMemberImportModal';

const CourseCodeMemberImport = (props) => {
  const { currentMembers, onImport, userId } = props;

  const { hide: hideModal, showBig: showCourseCodeImportModal } = useAppModal();

  const getCourseFromCourseCode = async (_courseCode) => {
    const res = await API.getWithCode('courses', _courseCode);
    const course = await res.data.result[0];
    if (!course) return [];

    const courseMembers = course.members
      .filter((mem) => mem.user._id !== userId)
      .sort((a, b) =>
        a.user.username.localeCompare(b.user.username, undefined, {
          numeric: true,
          sensitivity: 'base',
          ignorePuncuation: true,
        })
      );

    return { ...course, members: courseMembers };
  };

  const submit = (membersToInvite) => {
    onImport(membersToInvite);
    hideModal();
  };

  const handleAddMembers = () => {
    showCourseCodeImportModal(
      <CourseCodeMemberImportModal
        key={Date.now()}
        currentMembers={currentMembers}
        getCourseFromCourseCode={getCourseFromCourseCode}
        onCancel={hideModal}
        onSubmit={submit}
      />
    );
  };

  return <Button click={handleAddMembers}>CourseCodeMemberImport</Button>;
};

CourseCodeMemberImport.propTypes = {
  onImport: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  currentMembers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default CourseCodeMemberImport;
