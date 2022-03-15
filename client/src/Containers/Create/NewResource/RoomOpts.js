import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Aux, TextInput } from '../../../Components';
import threeD from './images/3d.png';
import classic from './images/classic.png';
import graphing from './images/graphing.png';
import geometry from './images/geometry.png';
import classes from './roomOpts.css';

const ggbOpts = [
  { img: classic, name: 'Classic', appName: 'classic' },
  { img: threeD, name: '3D', appName: '3d' },
  { img: graphing, name: 'Graphing', appName: 'graphing' },
  { img: geometry, name: 'Geometry', appName: 'geometry' },
];
class RoomOpts extends Component {
  render() {
    const {
      roomType,
      appName,
      setGgbApp,
      setGgbFile,
      tab,
      desmosLink,
      setDesmosLink,
      setDesmosCalcLink,
    } = this.props;
    if (roomType === 'geogebra') {
      return (
        <div className={classes.RoomOpts}>
          <p>Select a GeoGebra App</p>
          <div className={classes.Container}>
            {ggbOpts.map((opt) => (
              <div
                key={opt.appName}
                className={classes.Opt}
                onClick={() => {
                  setGgbApp(opt.appName);
                }}
                onKeyPress={() => {
                  setGgbApp(opt.appName);
                }}
                tabIndex="-1"
                role="button"
                data-testid={opt.appName}
              >
                <div
                  className={
                    appName === opt.appName ? classes.Selected : classes.GgbIcon
                  }
                >
                  <img src={opt.img} alt={opt.name} />
                </div>
                <h3 className={classes.OptText}>{opt.name}</h3>
              </div>
            ))}
          </div>
          <p>or upload a GeoGebra file</p>
          <div>
            <div className={classes.Geogebra}>
              <input
                type="file"
                id="file"
                multiple
                name="ggbFile"
                accept=".ggb"
                onChange={setGgbFile}
              />
            </div>
          </div>
          {!tab ? (
            <p>(optional, click next if you wish to skip this step)</p>
          ) : null}
        </div>
      );
    }
    if (roomType === 'desmosActivity') {
      return (
        <Aux>
          <TextInput
            light
            name="desmosInput"
            label="Desmos Activity Configuration"
            change={setDesmosLink}
            width="100%"
          />
          <p>Desmos Activity Code:</p>
          <div className={classes.Code}>{desmosLink}</div>
          <br />
          <p>
            Paste in an activity builder share url or hash code from
            teacher.desmos
          </p>
          <br />
          <p>
            Desmos Activities are in pre-Alpha, please expect and report issues.
            Only english activities are supported at this time.
          </p>
        </Aux>
      );
    }
    if (roomType === 'pyret' || roomType === 'wsp') {
      return (
        <Aux>
          <p>Activity Configuration:</p>
          <p>Do nothing at all for now</p>
        </Aux>
      );
    }
    return (
      <Aux>
        <TextInput
          light
          name="desmosInput"
          label="Paste a Desmos Graphing workspace code or link (optional)"
          change={setDesmosCalcLink}
          width="100%"
        />
        <p>Desmos Graph URL:</p>
        <a
          className={classes.Code}
          target="_blank"
          rel="noopener noreferrer"
          href={desmosLink}
        >
          {desmosLink}
        </a>
      </Aux>
    );
  }
}

RoomOpts.propTypes = {
  roomType: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  setGgbApp: PropTypes.func.isRequired,
  setGgbFile: PropTypes.func.isRequired,
  tab: PropTypes.bool,
  desmosLink: PropTypes.string.isRequired,
  setDesmosLink: PropTypes.func.isRequired,
  setDesmosCalcLink: PropTypes.func.isRequired,
};

RoomOpts.defaultProps = {
  tab: false,
};

export default RoomOpts;
