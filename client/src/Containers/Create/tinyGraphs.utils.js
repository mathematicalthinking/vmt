const imageThemes = [
  'frogideas',
  'duskfalling',
  'sugarsweets',
  'heatwave',
  'daisygarden',
  'seascape',
  'summerwarmth',
  'bythepool',
  'berrypie',
];

const shapes = {
  activities: 'isogrids',
  courses: 'labs/isogrids/hexa16',
  rooms: 'spaceinvaders',
};

export default (name, resource) => {
  const theme = imageThemes[Math.floor(Math.random() * imageThemes.length)];

  // /, %, \ break tinygraphs links
  // escaping characters did not seem to work
  const urlName = name.replace(/[/,%,\\]/gm, '_');

  return `https://www.tinygraphs.com/${
    shapes[resource]
  }/${urlName}?theme=${theme}&numcolors=4&size=220&fmt=svg`;
};
