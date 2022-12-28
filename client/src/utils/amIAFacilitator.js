import { ROLE } from 'constants.js';

export default function amIAFacilitator(resource, currentUserId) {
  if (
    resource &&
    resource.myRole &&
    Object.values(ROLE).includes(resource.myRole)
  )
    return resource.myRole === ROLE.FACILITATOR;
  if (resource && resource.members)
    return resource.members.some(
      (mem) =>
        mem.user &&
        mem.user._id === currentUserId &&
        mem.role === ROLE.FACILITATOR
    );

  // if we are an activity, we'll have a users field but not a members field
  return (
    resource &&
    resource.users &&
    (resource.creator === currentUserId ||
      resource.users.includes(currentUserId))
  );
}
