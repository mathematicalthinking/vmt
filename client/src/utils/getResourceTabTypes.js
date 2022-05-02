export default function getResourceTabTypes(tabs) {
  let tabTypes = 'None';

  if (Array.isArray(tabs)) {
    tabTypes =
      tabs &&
      tabs
        .reduce(
          (acc, curr) => (acc.includes(curr) ? acc : acc.concat(curr)),
          []
        )
        .join(', ');
  } else if (typeof tabs === 'string') {
    tabTypes = tabs;
  }

  tabTypes = tabTypes.replace('geogebra', 'GeoGebra');
  const isPlural = tabTypes.includes(',');

  return { tabTypes, isPlural };
}
