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
