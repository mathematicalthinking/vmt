/** @todo rename this file utils and move out of utils directory */
// resources = array of backend models
export const normalize = resources => {
  const byId = resources.reduce((accum, current) => {
    accum[current._id] = current;
    return accum;
  }, {});
  const allIds = resources.map(resource => resource._id);
  return { byId, allIds };
};

export const addUserRoleToResource = (resource, userId) => {
  if (resource.members) {
    resource.members.forEach(member => {
      if (member.user._id === userId) resource.myRole = member.role;
    });
  }
  return resource;
};
