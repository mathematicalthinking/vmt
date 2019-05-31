import React from 'react';
import { shallow, mount } from 'enzyme';
import GgbGraph from './GgbGraph';

import room from '../../../__mocks__/testRoom';
import user from '../../../__mocks__/testUser';

describe('component - GgbGraph', () => {
  // add ggb to the window so we can fully test the component

  const mockAddToLog = jest.fn();
  const mockUpdateRoom = jest.fn();
  const mockUpdateRoomTab = jest.fn();
  const mockUpdatedRoom = jest.fn();
  const mockResetControlTimer = jest.fn();
  const mockAddNtfToTabs = jest.fn();
  const mockSetToElAndCoords = jest.fn();
  const mockSetFirstTabLoaded = jest.fn();
  const props = {
    room,
    user,
    myColor: 'red',
    role: 'facilitator',
    addToLog: mockAddToLog,
    updateRoom: mockUpdateRoom,
    updateRoomTab: mockUpdateRoomTab,
    updatedRoom: mockUpdatedRoom,
    resetControlTimer: mockResetControlTimer,
    currentTab: 0,
    tabId: 0,
    controlledBy: null,
    showingReference: false,
    addNtfToTabs: mockAddNtfToTabs,
    isFirstTabLoaded: false,
    referToEl: null,
    referencing: false,
    setToElAndCoords: mockSetToElAndCoords,
    setFirstTabLoaded: mockSetFirstTabLoaded,
  };

  // it('renders the ggbGraph', () => {
  //   shallow(<GgbGraph {...props} />);
  //   expect(mockSetFirstTabLoaded).toHaveBeenCalled();
  // });

  it('loads the external ggb script', () => {
    // jest.spyOn(GgbGraph.prototype, 'onScriptLoad');
    const wrapper = mount(<GgbGraph {...props} />);
    const instance = wrapper.instance();
    const script = document.createElement('script');
    script.src = 'https://cdn.geogebra.org/apps/deployggb.js';
    script.async = 1;
    console.log('we are making it here');
    script.onload = () => {
      console.log("but we're never making it here huh? ");
      // jest.spyOn(instance, 'componentDidMount');
      jest.spyOn(instance, 'onScriptLoad');
      jest.spyOn(instance, 'initializeGgb');
      instance.onScriptLoad();

      expect(instance.componentDidMount).toHaveBeenCalled();
      // on scriptLoad should call initializeGgb
      console.log(wrapper.props());
      expect(instance.onScriptLoad).toHaveBeenCalled();
      expect(instance.initializeGgb).toHaveBeenCalled();
    };
  });

  // it('renders the encompass replayer', () => {
  //   const mock = jest.fn();
  //   props.onLoadEnc = encMock;
  //   const wrapper = shallow(<GgbGraph {...props} encompass />);
  //   const instance = wrapper.instance();
  //   jest.spyOn(instance, 'buildLog');
  //   instance.componentDidMount();
  //   expect(mock).not.toHaveBeenCalled();
  //   expect(encMock).toHaveBeenCalled();
  //   expect(instance.buildLog).toHaveBeenCalled();
  // });

  // it('plays the replayer', () => {

  // })
});
