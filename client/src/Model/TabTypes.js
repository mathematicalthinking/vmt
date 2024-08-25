import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  CodePyretOrg,
  GgbGraph,
  DesmosGraph,
  DesmosActivity,
  GgbActivityGraph,
  DesmosActivityEditor,
  DesmosActivityGraph,
  PyretTemplateEditor,
} from 'Containers/Workspace';
import {
  GgbReplayer,
  DesActivityReplayer,
  DesmosReplayer,
  // GgbMiniReplayer,
  DesActivityMiniReplayer,
  PyretActivityReplayer,
  // DesmosMiniReplayer,
} from 'Containers/Replayer';
import { extractActivityCode } from 'Containers/Workspa ce/Tools/DesActivityHelpers';
import { RadioBtn, Button } from 'Components';
import ggbIcon from 'assets/geogebra.png';
import dsmIcon from 'assets/desmos.png';
import dsmActIcon from 'assets/desmosActivity.png';
import pyretIcon from 'assets/pyretlogo.png';
import bothIcon from 'assets/desmosandgeogebra.png';

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
];

// eslint-disable-next-line react/display-name
const Blank = (type) => (props) => {
  // eslint-disable-next-line react/prop-types
  const { setFirstTabLoaded, isFirstTabLoaded, setTabLoaded } = props;
  if (setFirstTabLoaded && !isFirstTabLoaded) setFirstTabLoaded();
  if (setTabLoaded) setTabLoaded();
  return (
    <div style={{ margin: '10px' }}>No viewer for {type} tab type yet</div>
  );
};

const defaultProperties = (type) => ({
  message: '', // A message displayed on the home page
  label: type, // The name of the tab type as shown in radio buttons and elsewhere in the UI
  replayer: Blank(type), // The component used for replaying a mathspace's data
  component: Blank(type), // The component used to render the mathspace for collaboration
  miniReplayer: Blank(type),
  editor: Blank(type), // The component used for editing templates
  icon: <img width={28} src="" alt="No Icon" />, // icon shown in resource lists
  references: false, // whether this tab type supports workspace referencing (arrows between mathspace and chat)
  templateState: null,
});

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
    ...defaultProperties('Pyret Activity'),
    message: 'Pyret mode is active.',
    label: 'Pyret Activity',
    replayer: PyretActivityReplayer,
    component: CodePyretOrg,
    editor: PyretTemplateEditor,
    icon: <img width={28} src={pyretIcon} alt="Pyret Icon" />,
    templateState: (value) => ({
      desmosLink: value,
      currentStateBase64: value,
      startingPointBase64: value,
    }),
  },
  [TAB_TYPES.WEBSKETCHPAD]: {
    ...defaultProperties('WebSketchpad Activity'),
    message: 'WebSketchpad is active.',
    label: 'WebSketchpad Activity',
  },
  [TAB_TYPES.GEOGEBRA]: {
    ...defaultProperties('GeoGebra'),
    label: 'GeoGebra',
    component: GgbGraph,
    replayer: GgbReplayer,
    editor: GgbActivityGraph,
    references: true,
    icon: <img width={28} src={ggbIcon} alt="GeoGebra Icon" />,
  },
  [TAB_TYPES.DESMOS]: {
    ...defaultProperties('Desmos'),
    label: 'Desmos',
    component: DesmosGraph,
    replayer: DesmosReplayer,
    editor: DesmosActivityGraph,
    icon: <img width={25} src={dsmIcon} alt="Desmos Icon" />,
  },
  [TAB_TYPES.DESMOS_ACTIVITY]: {
    ...defaultProperties('Desmos Activity'),
    label: 'Desmos Activity',
    component: DesmosActivity,
    replayer: DesActivityReplayer,
    miniReplayer: DesActivityMiniReplayer,
    editor: DesmosActivityEditor,
    icon: <img width={25} src={dsmActIcon} alt="Desmos Activity Icon" />,
    templateState: (value) => ({
      desmosLink: extractActivityCode(value),
      currentStateBase64: '{}',
      startingPointBase64: '{}',
    }),
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
  return tabTypeProperties[tabType] ? tabTypeProperties[tabType].label : '';
}

function getCombinedIcon(tabTypes) {
  return tabTypeProperties.multiple.icon;
}

function getIcon(tabType) {
  return tabTypeProperties[tabType] ? tabTypeProperties[tabType].icon : null;
}

function hasReferences(tabType) {
  return tabTypeProperties[tabType]
    ? tabTypeProperties[tabType].references
    : false;
}

function getTemplateState(tabType, value) {
  const templateStateFunc =
    tabTypeProperties[tabType] && tabTypeProperties[tabType].templateState;
  return typeof templateStateFunc === 'function'
    ? templateStateFunc(value)
    : {};
}

function hasInitializer(tabType) {
  const templateStateFunc =
    tabTypeProperties[tabType] && tabTypeProperties[tabType].templateState;
  return templateStateFunc !== defaultProperties(tabType).templateState;
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

function MathspaceComponent(property, { type, ...otherProps }) {
  try {
    const { [property]: MathspaceComp } = tabTypeProperties[type];
    return <MathspaceComp {...otherProps} />;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    return null;
  }
}
function Mathspace(props) {
  return MathspaceComponent('component', props);
}

function MathspaceReplayer(props) {
  return MathspaceComponent('replayer', props);
}

function MathspaceMiniReplayer(props) {
  return MathspaceComponent('miniReplayer', props);
}

function MathspaceTemplateEditor(props) {
  return MathspaceComponent('editor', props);
}

const TabTypes = {
  isActive,
  homepageMessages,
  getCombinedIcon,
  getIcon,
  Mathspace,
  MathspaceReplayer,
  MathspaceMiniReplayer,
  MathspaceTemplateEditor,
  RadioButtons,
  Buttons,
  ...TAB_TYPES,
  activeTabTypes,
  getDisplayName,
  hasReferences,
  getTemplateState,
  hasInitializer,
};

export default TabTypes;
