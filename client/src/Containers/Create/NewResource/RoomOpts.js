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
      ggb,
      appName,
      setGgbApp,
      setGgbFile,
      tab,
      desmosLink,
      setDesmosLink,
    } = this.props;
    if (ggb) {
      return (
        <div className={classes.RoomOpts}>
          <p>Select a GeoGebra App</p>
          <div className={classes.Container}>
            {ggbOpts.map(opt => (
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
              >
                <div
                  className={
                    appName === opt.appName ? classes.Selected : classes.GgbIcon
                  }
                >
                  <img src={opt.img} alt="classic" />
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
    return (
      <Aux>
        <TextInput
          light
          name="desmosLink"
          label="Paste a Desmos workspace (optional)"
          value={desmosLink}
          change={setDesmosLink}
          width="100%"
        />
      </Aux>
    );
  }
}

RoomOpts.propTypes = {
  ggb: PropTypes.bool.isRequired,
  appName: PropTypes.string.isRequired,
  setGgbApp: PropTypes.func.isRequired,
  setGgbFile: PropTypes.func.isRequired,
  tab: PropTypes.bool,
  desmosLink: PropTypes.string.isRequired,
  setDesmosLink: PropTypes.func.isRequired,
};

RoomOpts.defaultProps = {
  tab: false,
};

export default RoomOpts;
