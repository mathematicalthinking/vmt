import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { API, useAppModal } from 'utils';
import { Button } from 'Components';
import CourseCodeMemberImportModal from './CourseCodeMemberImportModal';

const CourseCodeMemberImport = (props) => {
  const { currentMembers, onImport, userId } = props;
  const [courseMembersFromCode, setCourseMembersFromCode] = useState();

  const { hide: hideModal, showBig: showCourseCodeImportModal } = useAppModal();

  const getMembersFromCourseCode = async (_courseCode) => {
    const course = await (await API.getWithCode('courses', _courseCode)).data
      .result[0];
    if (!course) {
      setCourseMembersFromCode([]);
      return [];
    }

    const courseMembers = course.members
      .filter((mem) => mem.user._id !== userId)
      .map((mem) => mem.user)
      .sort((a, b) => a.username.localeCompare(b.username));

    setCourseMembersFromCode(courseMembers);

    const formattedCourse = {
      courseId: course._id,
      courseEntryCode: course.entryCode,
      courseName: course.name,
      courseMembers,
    };

    console.log('formattedCourse');
    console.log(formattedCourse);

    return formattedCourse;
  };

  const handleAddMembers = () => {
    showCourseCodeImportModal(
      <CourseCodeMemberImportModal
        key={Date.now()}
        currentMembers={currentMembers}
        getMembersFromCourseCode={getMembersFromCourseCode}
        onCancel={hideModal}
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
