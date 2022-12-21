import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  CodePyretOrg,
  GgbGraph,
  DesmosGraph,
  DesmosActivity,
} from 'Containers/Workspace';
import RadioBtn from './Form/RadioBtn/RadioBtn';

export const TAB_TYPES = {
  geogebra: 'geogebra',
  desmos: 'desmos',
  desmosActivity: 'desmosActivity',
  pyret: 'pyret',
  webSketchpad: 'webSketchpad',
};

const activeTabTypes = [
  TAB_TYPES.desmosActivity,
  TAB_TYPES.geogebra,
  TAB_TYPES.desmos,
];

if (
  window.env.REACT_APP_PYRET_MODE &&
  window.env.REACT_APP_PYRET_MODE.toLowerCase() === 'yes'
)
  activeTabTypes.push(TAB_TYPES.pyret);

if (
  window.env.REACT_APP_WSP_MODE &&
  window.env.REACT_APP_WSP_MODE.toLowerCase() === 'yes'
)
  activeTabTypes.push(TAB_TYPES.webSketchpad);

const tabTypeProperties = {
  [TAB_TYPES.pyret]: {
    message: 'Pyret mode is active.',
    label: 'Pyret Activity',
    component: CodePyretOrg,
  },
  [TAB_TYPES.webSketchpad]: {
    message: 'WebSketchpad is active.',
    label: 'Web Sketchpad Activity',
  },
  [TAB_TYPES.geogebra]: { label: 'GeoGebra', component: GgbGraph },
  [TAB_TYPES.desmos]: { label: 'Desmos', component: DesmosGraph },
  [TAB_TYPES.desmosActivity]: {
    label: 'Desmos Activity',
    component: DesmosActivity,
  },
};

function isActive(tabTypes) {
  const types = tabTypes.split('/');
  return types.every((type) => activeTabTypes.includes(type));
}

function homepageMessages() {
  return activeTabTypes.reduce(
    (acc, tabType) => acc.concat(`${tabTypeProperties[tabType].message} `),
    ''
  );
}

export const TabTypes = { isActive, homepageMessages };
export function TabTypeButtons({ onClick, allow }) {}

export function TabTypeRadioButtons({
  onClick = null,
  filters = null,
  checked = null,
}) {
  const allowedTypes = filters
    ? activeTabTypes.filter((type) => filters.includes(type))
    : activeTabTypes;
  return (
    <Fragment>
      {allowedTypes.map((tabType) => (
        <RadioBtn
          key={tabType}
          data-testid={`${tabType}-radioBtn`}
          name={tabType}
          checked={checked && checked === tabType}
          check={() => onClick && onClick(tabType)}
        >
          {tabTypeProperties[tabType].label}
        </RadioBtn>
      ))}
    </Fragment>
  );
}

TabTypeRadioButtons.propTypes = {
  onClick: PropTypes.func,
  filters: PropTypes.arrayOf(PropTypes.string),
  checked: PropTypes.string,
};

TabTypeRadioButtons.defaultProps = {
  onClick: null,
  filters: null,
  checked: null,
};

export function Mathspace({ type, ...otherProps }) {
  try {
    const { component: MathspaceComponent } = tabTypeProperties[type];
    return <MathspaceComponent {...otherProps} />;
  } catch (err) {
    return null;
  }
}

Mathspace.propTypes = {
  type: PropTypes.string.isRequired,
};
