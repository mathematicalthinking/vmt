// Teacher.Desmos export url
const baseURL = 'https://teacher.desmos.com/activitybuilder/export/'; // + activity code

// utility for getting Desmos Activity Confguration from tab state
export const fetchConfigData = async (tab, shouldLoadCurrent = false) => {
  // setting our return object
  const configData = {};
  // Room condition
  if (tab.room) {
    // if we have a valid starting config and saved data, return the config
    if (
      tab.startingPointBase64 &&
      tab.startingPointBase64 !== '{}' &&
      // Check to see if there is any activity
      tab.currentStateBase64
    ) {
      configData.config = JSON.parse(tab.startingPointBase64);
      configData.status = 'Prior content loaded';
      if (shouldLoadCurrent)
        configData.responseData = JSON.parse(tab.currentStateBase64);
      return configData;
    }
  }

  // else handle an activity (template) tab condition
  if (tab.activity) {
    // load a saved config as json if we have it and any prior event data
    if (tab.startingPointBase64 && tab.startingPointBase64 !== '{}') {
      configData.config = JSON.parse(tab.startingPointBase64);
      configData.status = 'Prior edited template loaded';
      return configData;
    }
    // Catch if we have a template with no config for blank starting point
    if (tab.activity && !tab.desmosLink) {
      configData.config = undefined;
      configData.status = 'Blank workspace loaded';
      return configData;
    }
  }

  // calling Desmos to get activity config via link code
  try {
    // otherwise fetch the config if we have a code, or for a room have a default config
    const code =
      tab.desmosLink ||
      // fallback to turtle time trials, used for demo
      '5da9e2174769ea65a6413c93';
    const result = await fetch(`${baseURL}${code}`, {
      headers: { Accept: 'application/json' },
    });
    const status = await result.status;
    configData.status = status;
    if (status !== 200) {
      configData.config = null;
      return configData;
    }
    const data = await result.json();
    configData.config = data;
    return configData;
  } catch (err) {
    configData.config = null;
    configData.status = err;

    console.log('Initalization fetch error: ', err);
    return configData;
  }
};

export const initializeNewDesmosActivity = async (roomConfig) => {
  if (!roomConfig || !roomConfig.desmosLink) return roomConfig;
  const { Player } = await import('external/js/api.full.es');
  const configData = await fetchConfigData({
    desmosLink: roomConfig.desmosLink,
  });
  if (configData.status !== 200) return roomConfig;
  let responses = {};
  await new Player({
    activityConfig: configData.config,
    targetElement: document.createElement('div'),
    onError: (err) => {
      console.error(
        err.message ? err : `PlayerAPI error: ${JSON.stringify(err, null, 2)}`
      );
    },
    onResponseDataUpdated: (newResponse) => {
      responses = { ...responses, ...newResponse };
    },
  });
  return {
    ...roomConfig,
    startingPointBase64: JSON.stringify(configData.config),
    currentStateBase64: JSON.stringify(responses),
  };
};

export const extractActivityCode = (url) => {
  const CODE_LENGTH = 24;
  const link = url.split('/');
  const code = link[link.length - 1].slice(0, CODE_LENGTH);
  return code;
};
// Activity Confguration MetaData Schemas
// Schemas should conform to JSON Schema syntax. See: https://json-schema.org/
export const activityMetadataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  version: '1.0.0',
  title: `Example activity metadata.`,
  type: 'object',
  required: [],
  properties: {
    tags: {
      type: 'string',
      title: 'Title',
      description: 'Activity title',
    },
  },
};

// Schemas should conform to JSON Schema syntax. See: https://json-schema.org/
export const screenMetadataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  version: '1.0.0',
  title: `Example screen metadata.`,
  type: 'object',
  required: [],
  properties: {
    tags: {
      type: 'array',
      format: 'table',
      title:
        'Identify whether this component serves as CL documentation sample',
      items: {
        type: 'string',
        title: 'Tag',
        description: 'A tag for the screen.',
      },
    },
  },
};

// Schemas should conform to JSON Schema syntax. See: https://json-schema.org/
export const componentMetadataSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  version: '1.0.0',
  title: `Example component metadata.`,
  type: 'object',
  required: [],
  properties: {
    tags: {
      type: 'boolean',
      format: 'checkbox',
      title: 'Has this component been audited for accessibility?',
      description: 'True if component has been audited for accessibility.',
      default: false,
    },
  },
};
