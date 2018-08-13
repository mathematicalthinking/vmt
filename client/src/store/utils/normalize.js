// resources = array of backend models
export const normalize = resources => {
  const byId = resources.reduce((accum, current) => {
    accum[current._id] = current;
    return accum;
  }, {})
  const allIds = resources.map(resource => resource._id)
  return {byId, allIds,}
}
