import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  CodePyretOrg,
  GgbGraph,
  DesmosGraph,
  DesmosActivity,
} from 'Containers/Workspace';
import ggbIcon from 'assets/geogebra.png';
import dsmIcon from 'assets/desmos.png';
import dsmActIcon from 'assets/desmosActivity.png';
import pyretIcon from 'assets/pyretlogo.png';
import bothIcon from 'assets/desmosandgeogebra.png';
import RadioBtn from './Form/RadioBtn/RadioBtn';
import Button from './UI/Button/Button';

const TAB_TYPES = {
  GEOGEBRA: 'geogebra',
  DESMOS: 'desmos',
  DESMOS_ACTIVITY: 'desmosActivity',
  PYRET: 'pyret',
  WEBSKETCHPAD: 'webSketchpad',
};

const activeTabTypes = [
  TAB_TYPES.DESMOS_ACTIVITY,
  TAB_TYPES.GEOGEBRA,
  TAB_TYPES.DESMOS,
  TAB_TYPES.PYRET,
];

if (
  window.env.REACT_APP_PYRET_MODE &&
  window.env.REACT_APP_PYRET_MODE.toLowerCase() === 'yes'
)
  activeTabTypes.push(TAB_TYPES.PYRET);

if (
  window.env.REACT_APP_WSP_MODE &&
  window.env.REACT_APP_WSP_MODE.toLowerCase() === 'yes'
)
  activeTabTypes.push(TAB_TYPES.WEBSKETCHPAD);

const tabTypeProperties = {
  [TAB_TYPES.PYRET]: {
    message: 'Pyret mode is active.',
    label: 'Pyret Activity',
    component: CodePyretOrg,
    icon: <img width={28} src={pyretIcon} alt="Pyret Icon" />,
  },
  [TAB_TYPES.WEBSKETCHPAD]: {
    message: 'WebSketchpad is active.',
    label: 'WebSketchpad Activity',
  },
  [TAB_TYPES.GEOGEBRA]: {
    label: 'GeoGebra',
    component: GgbGraph,
    icon: <img width={28} src={ggbIcon} alt="GeoGebra Icon" />,
  },
  [TAB_TYPES.DESMOS]: {
    label: 'Desmos',
    component: DesmosGraph,
    icon: <img width={25} src={dsmIcon} alt="Desmos Icon" />,
  },
  [TAB_TYPES.DESMOS_ACTIVITY]: {
    label: 'Desmos Activity',
    component: DesmosActivity,
    icon: <img width={25} src={dsmActIcon} alt="Desmos Activity Icon" />,
  },
  multiple: { icon: <img width={25} src={bothIcon} alt="Multiple Types" /> },
};

function isActive(tabTypes) {
  // the specific characters for split are linked to utils/getResourceTabTypes
  const types = Array.isArray(tabTypes) ? tabTypes : tabTypes.split(', ');
  return types.every((type) => activeTabTypes.includes(type));
}

function homepageMessages() {
  return activeTabTypes.reduce(
    (acc, tabType) =>
      tabTypeProperties[tabType].message
        ? acc.concat(`${tabTypeProperties[tabType].message} `)
        : acc,
    ''
  );
}

function getDisplayName(tabType) {
  return tabTypeProperties[tabType].label;
}

function getCombinedIcon(tabTypes) {
  return tabTypeProperties.multiple.icon;
}

function getIcon(tabType) {
  return tabTypeProperties[tabType].icon;
}

function Buttons({ onClick, disabled }) {
  return (
    <Fragment>
      {activeTabTypes.map((tabType) => (
        <Button
          key={tabType}
          data-testid={`temp-${tabType}`}
          m={5}
          click={() => onClick(tabType)}
          disabled={disabled}
        >
          {tabTypeProperties[tabType].label}
        </Button>
      ))}
    </Fragment>
  );
}

Buttons.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

Buttons.defaultProps = {
  disabled: false,
};

function RadioButtons({ onClick, filters, checked }) {
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

RadioButtons.propTypes = {
  onClick: PropTypes.func,
  filters: PropTypes.arrayOf(PropTypes.string),
  checked: PropTypes.string,
};

RadioButtons.defaultProps = {
  onClick: null,
  filters: null,
  checked: null,
};

function Mathspace({ type, ...otherProps }) {
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

const TabTypes = {
  isActive,
  homepageMessages,
  getCombinedIcon,
  getIcon,
  Mathspace,
  RadioButtons,
  Buttons,
  ...TAB_TYPES,
  activeTabTypes,
  getDisplayName,
};

export default TabTypes;
