import COLOR_MAP from './colorMap';

const addColors = (members) => {
  const MAX_COLOR_INDEX = Object.keys(COLOR_MAP).length - 1;
  // if a member doesn't have a course, it doesn't get a color
  // give each course a distinct color

  // array of unique course ids
  const courseIds = Array.from(
    new Set(members.map((member) => member.course).filter((id) => !!id))
  );

  const courseColorMap = courseIds.reduce((acc, curr, idx) => {
    return {
      ...acc,
      [curr]: COLOR_MAP[idx % MAX_COLOR_INDEX],
    };
  }, {});

  return members.map((member) => {
    return {
      ...member,
      displayColor: member.course && courseColorMap[member.course],
    };
  });
};

export default addColors;
