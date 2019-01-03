import axios from 'axios';

// const parseParams = (params) => {
//   const keys = Object.keys(params);
//   let options = '';

//   keys.forEach((key) => {
//     const isParamTypeObject = typeof params[key] === 'object';
//     const isParamTypeArray = isParamTypeObject && (params[key].length >= 0);

//     if (!isParamTypeObject) {
//       options += `${key}=${params[key]}&`;
//     }

//     if (isParamTypeObject && isParamTypeArray) {
//       params[key].forEach((element) => {
//         options += `${key}=${element}&`;
//       });
//     }
//   });

//   return options ? options.slice(0, -1) : options;
// };

export default {
  get: (resource, params) => {
    return axios.get(`/api/${resource}`, params ? {params,} : {})
  },

  // getIds: (resource, ids) => {
  //   console.log("DATA: ", ids)
  //   return axios.get(`/api/${resource}/ids`, {
  //     params: {
  //       ids,
  //     },
  //     paramsSerializer: params => parseParams(params)
  //   })
  // },

  post: (resource, body) => {
    return axios.post(`/api/${resource}`, body)
  },

  put: (resource, id, body) => {
    return axios.put(`/api/${resource}/${id}`, body)
  },

  getById: (resource, id) => {
    return axios.get(`/api/${resource}/${id}`)
  },

  remove: (resource, id) => {
    return axios.delete(`/api/${resource}/${id}`)
  },

  enterWithCode: (resource, resourceId, userId, entryCode) => {
    return axios.put(`/api/${resource}/${resourceId}`, {checkAccess: {userId, entryCode,}})
  },

  requestAccess: (owners, userId, resource, resourceId) => {
    let resourceType;
    if (resource === 'courses' || resource === 'course') {
      resourceType = 'course';
    }
    if (resource === 'rooms' || resource === 'room') {
      resourceType = 'room';
    }
    // @TODO consider making notificationTypes a directory of constants like action types in redux
    let promises = owners.map(owner => {
      // return axios.put(`/api/user/${owner}`, {notificationType: 'requestAccess', user: userId, resource, _id: resourceId})
      return axios.post('api/notifications', {
        notificationType: 'requestAccess',
        toUser: owner,
        fromUser: userId,
        resourceType: resourceType,
        resourceId: resourceId
      })
    })
    return Promise.all(promises)
  },

  removeNotification: (ntfId) => {
    return axios.put(`/api/notifications/${ntfId}`,{
      isTrashed: true
    })
  },

  removeMember: (resource, resourceId, user) => {
    return axios.put(`/api/${resource}/${resourceId}/remove`, {members: {user,} })
  },

  addUserResource: (resource, resourceId, userId) => {
    return axios.put(`/api/user/${userId}/add`, {[resource]: resourceId})
  },

  grantAccess: (user, resource, resourceId) => {
    return axios.put(`/api/${resource}s/${resourceId}/add`, {members: {user, role: 'participant'}})
  },

  updateMembers: (resource, resourceId, updatedMembers) => {
    return axios.put(`/api/${resource}/${resourceId}`, {members: updatedMembers})
  },
  getDesmos: url => {
    return axios.get(`/desmos?url=${url}`)
  },
  uploadGgbFiles: formData => {
    return axios.post(`/api/upload/ggb`, formData)
  }
}
