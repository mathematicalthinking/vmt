const _ = require("lodash");

const isNonEmptyObject = val => {
  return _.isObject(val) && !_.isEmpty(val);
};

const getUserRoleInRecord = (record, userId) => {
  let members = _.propertyOf(record)("members");

  if (!_.isArray(members)) {
    return;
  }

  let userMemberObject = _.find(members, obj => {
    return _.isEqual(userId, obj.user);
  });

  return _.propertyOf(userMemberObject)("role");
};

const isUserFacilitatorInRecord = (record, userId) => {
  return getUserRoleInRecord(record, userId) === "facilitator";
};

module.exports.isValidMongoId = (val) => {
  let checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
  return checkForHexRegExp.test(val);
};

module.exports.isNonEmptyObject = isNonEmptyObject;
module.exports.getUserRoleInRecord = getUserRoleInRecord;
module.exports.isUserFacilitatorInRecord = isUserFacilitatorInRecord;
