// Teacher.Desmos export url
const baseURL = 'https://teacher.desmos.com/activitybuilder/export/'; // + activity code
// utility for getting Desmos Activity Confguration
export const fetchConfigData = async (tab) => {
  // console.log('Tab data: ', tab);
  // setting our return object
  const configData = {};
  // load a saved config as json if we have it and any prior event data
  if (
    tab.startingPointBase64 &&
    tab.currentStateBase64 &&
    tab.currentStateBase64 !== '{}'
  ) {
    configData.config = JSON.parse(tab.startingPointBase64);
    configData.status = 'Prior content loaded';
    return configData;
  }
  // Catch if we have a template with no config for blank starting point
  if (tab.activity && !tab.desmosLink) {
    configData.config = undefined;
    configData.status = 'Blank workspace loaded';
    return configData;
  }
  // otherwise fetch the config if we have a code, or for a room have a default config
  const code =
    tab.desmosLink ||
    // fallback to turtle time trials, used for demo
    '5da9e2174769ea65a6413c93';
  // calling Desmos to get activity config
  try {
    const result = await fetch(`${baseURL}${code}`, {
      headers: { Accept: 'application/json' },
    });
    // TODO handle this error message
    const status = await result.status;
    configData.status = status;
    if (status !== 200) {
      configData.config = null;
      console.log('ConfigData: ', configData);
      return configData;
    }
    const data = await result.json();
    configData.config = data;
    console.log('ConfigData: ', configData);
    return configData;
  } catch (err) {
    configData.config = null;
    configData.status = err;

    console.log('Initalization fetch error: ', err);
    return configData;
  }
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
