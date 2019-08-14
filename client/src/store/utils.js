export const normalize = (resources) => {
  const byId = resources.reduce((accum, current) => {
    // eslint-disable-next-line no-param-reassign
    accum[current._id] = current;
    return accum;
  }, {});
  const allIds = resources.map((resource) => resource._id);
  return { byId, allIds };
};

export const addUserRoleToResource = (resource, userId) => {
  const updatedResource = resource;
  if (resource.members) {
    resource.members.forEach((member) => {
      if (member.user._id === userId) updatedResource.myRole = member.role;
    });
  }
  return resource;
};
