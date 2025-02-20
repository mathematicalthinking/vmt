import { API } from 'utils';

const CourseCodeMemberImportFunctions = {
  getCourseFromCourseCode: async (_courseCode, memIdsToIgnore = []) => {
    const res = await API.getWithCode('courses', _courseCode);
    const course = await res.data.result[0];
    if (!course) return [];

    const courseMembers = course.members
      .filter((mem) => !memIdsToIgnore.includes(mem.user._id))
      .sort((a, b) => a.user.username.localeCompare(b.user.username));

    return { ...course, members: courseMembers };
  },
  addUIElements: (courses, addAction, removeAction) => {
    return Object.values(courses).map((course) => ({
      key: course._id,
      label: course.name,
      buttonLabel: course.isAdded ? 'Remove' : 'Add',
      altLabel: course.entryCode,
      backgroundColor: course.backgroundColor,
      onClick: course.isAdded ? removeAction : addAction,
    }));
  },
};

export default CourseCodeMemberImportFunctions;
