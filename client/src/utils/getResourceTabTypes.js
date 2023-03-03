import { TabTypes } from 'Components';

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
        .map((type) => TabTypes.getDisplayName(type))
        .join(', ');
  } else if (typeof tabs === 'string') {
    tabTypes = tabs;
  }

  const isPlural = tabTypes.includes(',');

  return { tabTypes, isPlural };
}
