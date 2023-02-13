import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { API, useAppModal } from 'utils';
import { Button } from 'Components';

const CourseCodeMemberImport = (props) => {
  const { courseCode, onImport } = props;
  const [courseFromCode, setCourseFromCode] = useState();

  const {
    show,
    hide: hideModal,
    showBig: showCourseCodeImportModal,
  } = useAppModal();

  useEffect(() => {
    getCourseFromCode();
  }, [courseCode]);

  const getCourseFromCode = async () => {
    const course = await (await API.getWithCode('courses', courseCode)).data
      .result[0];
    setCourseFromCode(course.members);
    console.log('course');
    console.log(course);
    return course.members;
  };

  const handleAddMembers = () => {
    return showCourseCodeImportModal(<div>We're here!!!</div>);
  };

  return (
    courseCode && (
      <Button onClick={handleAddMembers}>CourseCodeMemberImport</Button>
    )
  );
};

CourseCodeMemberImport.propTypes = {
  courseCode: PropTypes.string.isRequired,
};

export default CourseCodeMemberImport;
