import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { API, useAppModal } from 'utils';
import { Button } from 'Components';
import CourseCodeMemberImportModal from './CourseCodeMemberImportModal';

const CourseCodeMemberImport = (props) => {
  const { onImport } = props;
  const [courseFromCode, setCourseFromCode] = useState();

  const {
    show,
    hide: hideModal,
    showBig: showCourseCodeImportModal,
  } = useAppModal();

  const getMembersFromCourseCode = async (_courseCode) => {
    const course = await (await API.getWithCode('courses', _courseCode)).data
      .result[0];
    setCourseFromCode(course.members);
    console.log('course');
    console.log(course);
    return course.members;
  };

  const handleAddMembers = () => {
    showCourseCodeImportModal(
      <CourseCodeMemberImportModal
        getMembersFromCourseCode={getMembersFromCourseCode}
      />
    );
  };

  return <Button click={handleAddMembers}>CourseCodeMemberImport</Button>;
};

CourseCodeMemberImport.propTypes = {
  onImport: PropTypes.func.isRequired,
};

export default CourseCodeMemberImport;
