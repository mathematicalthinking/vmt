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

export const ROOM_SETTINGS = {
  participantsCanCreateTabs: 'Participants can create new tabs',
  independentTabControl: 'Independent tab control',
  displayAliasedUsernames: 'Use aliased usernames',
  participantsCanChangePerspective:
    'Participants can change the perspective (GeoGebra)',
};

export const GRAPH_HEIGHT = window.innerHeight - 400;
