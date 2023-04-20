// STATUS and ROLE must be kept consistent with server/constants/status.js and server/constants/role.js
export const STATUS = {
  ARCHIVED: 'archived',
  TRASHED: 'trashed',
  SUSPENDED: 'suspended',
  DEFAULT: 'default',
};

export const ROLE = {
  FACILITATOR: 'facilitator',
  PARTICIPANT: 'participant',
  GUEST: 'guest',
};

export const GRAPH_HEIGHT = window.innerHeight - 400;
