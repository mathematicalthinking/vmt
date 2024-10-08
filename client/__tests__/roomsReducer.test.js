import reducer from '../src/store/reducers/roomsReducer';
import * as actionTypes from '../src/store/actions/actionTypes';

describe('rooms reducer', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle LOGOUT', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Room 1' },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, { type: actionTypes.LOGOUT })).toEqual(
      initialState
    );
  });

  it('should handle UPDATED_ROOM', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Room 1', description: 'Old description' },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ROOM,
      roomId: '1',
      body: { description: 'New description' },
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Room 1', description: 'New description' },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_ROOM_TAB', () => {
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Room 1',
          tabs: [
            { _id: 'tab1', name: 'Tab 1' },
            { _id: 'tab2', name: 'Tab 2' },
          ],
        },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ROOM_TAB,
      roomId: '1',
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Room 1',
          tabs: [
            { _id: 'tab1', name: 'Updated Tab 1' },
            { _id: 'tab2', name: 'Tab 2' },
          ],
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle CREATED_ROOM', () => {
    const action = {
      type: actionTypes.CREATED_ROOM,
      newRoom: { _id: '3', name: 'New Room' },
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Room 1' },
      },
      allIds: ['1'],
    };
    const expectedState = {
      byId: {
        ...currentState.byId,
        3: { _id: '3', name: 'New Room' },
      },
      allIds: ['1', '3'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_TO_LOG', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Room 1', log: ['entry1'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_TO_LOG,
      roomId: '1',
      entry: 'entry2',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Room 1', log: ['entry1', 'entry2'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ROOM_MEMBER', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Room 1', members: [{ user: { _id: 'user1' } }] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ROOM_MEMBER,
      roomId: '1',
      body: { user: { _id: 'user2' } },
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Room 1',
          members: [{ user: { _id: 'user1' } }, { user: { _id: 'user2' } }],
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ROOM_MEMBER', () => {
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Room 1',
          members: [{ _id: 'user1' }, { _id: 'user2' }],
        },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_ROOM_MEMBER,
      roomId: '1',
      userId: 'user1',
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Room 1',
          members: [{ _id: 'user2' }],
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ROOMS', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Room 1' },
        2: { _id: '2', name: 'Room 2' },
      },
      allIds: ['1', '2'],
    };
    const action = {
      type: actionTypes.REMOVE_ROOMS,
      roomIds: ['1'],
    };
    const expectedState = {
      byId: {
        2: { _id: '2', name: 'Room 2' },
      },
      allIds: ['2'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle CREATE_ROOM_CONFIRMED', () => {
    const currentState = {
      byId: {},
      allIds: [],
      createdNewRoom: true,
    };
    const expectedState = {
      ...currentState,
      createdNewRoom: false,
    };
    expect(
      reducer(currentState, { type: actionTypes.CREATE_ROOM_CONFIRMED })
    ).toEqual(expectedState);
  });
});

describe('rooms reducer edge cases', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should handle GOT_ROOMS with duplicate IDs', () => {
    const action = {
      type: actionTypes.GOT_ROOMS,
      byId: {
        1: { _id: '1', name: 'Room 1', chatCount: 2 },
        2: { _id: '2', name: 'Room 2', chatCount: 0 },
      },
      allIds: ['1', '2', '1'], // Duplicate ID '1'
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Room 1', chatCount: 2 },
        2: { _id: '2', name: 'Room 2', chatCount: 0 },
      },
      allIds: ['1', '2'],
    };
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_ROOM when the room does not exist', () => {
    const action = {
      type: actionTypes.UPDATED_ROOM,
      roomId: '1',
      body: { description: 'New description' },
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_ROOM_TAB when the room does not have tabs', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Room 1' }, // No tabs property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ROOM_TAB,
      roomId: '1',
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Room 1',
          tabs: [], // No tabs to update
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_TO_LOG is called and the room does not exist', () => {
    const action = {
      type: actionTypes.ADD_TO_LOG,
      roomId: '1', // This room does not exist in state
      entry: 'entry1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ROOM_MEMBER when the room does not exist', () => {
    const action = {
      type: actionTypes.ADD_ROOM_MEMBER,
      roomId: '1', // This room does not exist in state
      body: { user: { _id: 'user1' } },
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ROOM_MEMBER when the room does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_ROOM_MEMBER,
      roomId: '1', // This room does not exist in state
      userId: 'user1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ROOMS when rooms do not exist', () => {
    const action = {
      type: actionTypes.REMOVE_ROOMS,
      roomIds: ['1', '2'], // Attempt to remove non-existent rooms
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when UPDATED_ROOM_TAB is called and the room does not exist', () => {
    const action = {
      type: actionTypes.UPDATED_ROOM_TAB,
      roomId: '1', // This room does not exist in state
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });
});

describe('rooms reducer - edge cases that should fail in original but pass in new', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should not crash when UPDATED_ROOM is called and the room does not exist', () => {
    const action = {
      type: actionTypes.UPDATED_ROOM,
      roomId: '1', // This room does not exist in state
      body: { description: 'New description' },
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_ROOM_MEMBER is called and the room does not exist', () => {
    const action = {
      type: actionTypes.ADD_ROOM_MEMBER,
      roomId: '1', // This room does not exist in state
      body: { user: { _id: 'user1' } },
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_TO_LOG is called and the room does not exist', () => {
    const action = {
      type: actionTypes.ADD_TO_LOG,
      roomId: '1', // This room does not exist in state
      entry: 'entry1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when REMOVE_ROOM_MEMBER is called and the room does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_ROOM_MEMBER,
      roomId: '1', // This room does not exist in state
      userId: 'user1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when REMOVE_ROOMS is called and the rooms do not exist', () => {
    const action = {
      type: actionTypes.REMOVE_ROOMS,
      roomIds: ['1', '2'], // These rooms do not exist in state
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when UPDATED_ROOM_TAB is called and the room does not exist', () => {
    const action = {
      type: actionTypes.UPDATED_ROOM_TAB,
      roomId: '1', // This room does not exist in state
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });
});
