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
  const updatedResource = { ...resource }; // Creating a shallow copy of the resource to avoid mutating the original.

  if (resource.members) {
    // Find the member while also checking for malformed user objects
    const matchingMember = resource.members.find((member) => {
      if (!member.user) {
        throw new Error(
          `Resource ${resource.name}(${resource._id}) has a member without a valid user`
        );
      }
      return member.user._id === userId;
    });

    if (matchingMember) {
      updatedResource.myRole = matchingMember.role;
    } else {
      throw new Error(
        `User ${userId} is not a member of resource ${resource.name}(${resource._id})`
      );
    }
  } else {
    throw new Error(
      `Resource ${resource.name}(${resource._id}) does not have a members array, so does not include user ${userId}`
    );
  }

  return updatedResource;
};
