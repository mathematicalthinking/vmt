import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PyretActivity from '../src/Containers/Workspace/PyretActivity';

jest.mock('utils', () => ({
  usePyret: jest.fn(),
  socket: {
    on: jest.fn(),
    removeEventListener: jest.fn(),
  },
  API: {
    put: jest.fn(() => ({ catch: jest.fn() })),
  },
}));

jest.mock('../src/Containers/Workspace/ControlWarningModal', () => () => (
  <div />
));

const mockProps = {
  room: { _id: 'room1', tabs: [{ _id: 'tab1' }] },
  tab: { _id: 'tab1', currentStateBase64: '{}' },
  user: { username: 'testuser', inAdminMode: false },
  updatedRoom: jest.fn(),
  toggleControl: jest.fn(),
  setFirstTabLoaded: jest.fn(),
  inControl: 'ME',
  addNtfToTabs: jest.fn(),
  addToLog: jest.fn(),
  emitEvent: jest.fn(),
  isFirstTabLoaded: true,
};

describe('PyretActivity component', () => {
  beforeEach(() => {
    require('utils').usePyret.mockReturnValue({
      iframeSrc: 'http://localhost:5000/editor',
      postMessage: jest.fn(),
      isReady: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with initial state', () => {
    render(<PyretActivity {...mockProps} />);
    const iframe = screen.getByTitle('pyret');
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute('src', 'http://localhost:5000/editor');
  });

  test('postMessage is called when inControl changes', () => {
    const { rerender } = render(
      <PyretActivity {...mockProps} inControl="ME" />
    );

    expect(require('utils').usePyret().postMessage).toHaveBeenCalledWith({
      type: 'gainControl',
    });

    // Clear mock calls to reset the state before rerendering
    require('utils')
      .usePyret()
      .postMessage.mockClear();

    rerender(<PyretActivity {...mockProps} inControl="OTHER" />);

    expect(require('utils').usePyret().postMessage).toHaveBeenCalledWith({
      type: 'loseControl',
    });
  });

  test('handles RECEIVE_EVENT socket event', () => {
    render(<PyretActivity {...mockProps} />);

    const event = { tab: 'tab1', currentState: '{}' };
    require('utils').socket.on.mock.calls[0][1](event);

    expect(mockProps.updatedRoom).toHaveBeenCalled();
  });
});
