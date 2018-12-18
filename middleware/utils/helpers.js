const _ = require('lodash');

const isNonEmptyObject = (val) => {
  return _.isObject(val) && !_.isEmpty(val);
};

module.exports.isNonEmptyObject = isNonEmptyObject;