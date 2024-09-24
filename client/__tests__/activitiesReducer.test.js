// import reducer from '../src/store/reducers/oldactivitiesreducer'; // Adjust the path as necessary
import reducer from '../src/store/reducers/activitiesReducer';
import * as actionTypes from '../src/store/actions/actionTypes'; // Adjust the path as necessary

describe('activities reducer', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle GOT_ACTIVITIES', () => {
    const action = {
      type: actionTypes.GOT_ACTIVITIES,
      byId: {
        1: { _id: '1', name: 'Activity 1' },
        2: { _id: '2', name: 'Activity 2' },
      },
      allIds: ['1', '2'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' },
        2: { _id: '2', name: 'Activity 2' },
      },
      allIds: ['1', '2'],
    };
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ACTIVITY', () => {
    const action = {
      type: actionTypes.ADD_ACTIVITY,
      activity: { _id: '3', name: 'New Activity' },
    };
    const expectedState = {
      byId: {
        ...initialState.byId,
        3: { _id: '3', name: 'New Activity' },
      },
      allIds: initialState.allIds,
    };
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGOUT', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, { type: actionTypes.LOGOUT })).toEqual(
      initialState
    );
  });

  it('should handle REMOVE_ACTIVITIES', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' },
        2: { _id: '2', name: 'Activity 2' },
      },
      allIds: ['1', '2'],
    };
    const action = {
      type: actionTypes.REMOVE_ACTIVITIES,
      activityIds: ['1'],
    };
    const expectedState = {
      byId: {
        2: { _id: '2', name: 'Activity 2' },
      },
      allIds: ['2'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ACTIVITY_ROOMS', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', rooms: ['a'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ACTIVITY_ROOMS,
      activityId: '1',
      roomIdsArr: ['b', 'c'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', rooms: ['a', 'b', 'c'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ACTIVITY_ROOM', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', rooms: ['a', 'b'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_ACTIVITY_ROOM,
      activityId: '1',
      roomId: 'a',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', rooms: ['b'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ACTIVITY_USER', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', users: ['user1'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ACTIVITY_USER,
      activityId: '1',
      userId: 'user2',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', users: ['user1', 'user2'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ACTIVITY_USER', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', users: ['user1', 'user2'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_ACTIVITY_USER,
      activityId: '1',
      userId: 'user1',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', users: ['user2'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle CREATED_ACTIVITY', () => {
    const action = {
      type: actionTypes.CREATED_ACTIVITY,
      newActivity: { _id: '3', name: 'New Activity' },
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' },
      },
      allIds: ['1'],
    };
    const expectedState = {
      byId: {
        ...currentState.byId,
        3: { _id: '3', name: 'New Activity' },
      },
      allIds: ['3', '1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_ACTIVITY', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' },
      },
      allIds: ['1'],
      currentActivity: { _id: '1', name: 'Activity 1' },
    };
    const expectedState = {
      ...currentState,
      currentActivity: {},
    };
    expect(reducer(currentState, { type: actionTypes.CLEAR_ACTIVITY })).toEqual(
      expectedState
    );
  });

  it('should handle UPDATED_ACTIVITY', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', description: 'Old description' },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ACTIVITY,
      activityId: '1',
      body: { description: 'New description' },
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', description: 'New description' },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_ACTIVITY_TAB', () => {
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Activity 1',
          tabs: [
            { _id: 'tab1', name: 'Tab 1' },
            { _id: 'tab2', name: 'Tab 2' },
          ],
        },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ACTIVITY_TAB,
      activityId: '1',
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Activity 1',
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

  it('should handle CREATE_ACTIVITY_CONFIRMED', () => {
    const currentState = {
      byId: {},
      allIds: [],
      createdNewActivity: true,
    };
    const expectedState = {
      ...currentState,
      createdNewActivity: false,
    };
    expect(
      reducer(currentState, { type: actionTypes.CREATE_ACTIVITY_CONFIRMED })
    ).toEqual(expectedState);
  });
});

describe('activities reducer edge cases', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should handle ADD_ACTIVITY when the activity already exists', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Existing Activity' },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ACTIVITY,
      activity: { _id: '1', name: 'Updated Activity' },
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Updated Activity' },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ACTIVITY_ROOMS when the activity does not have rooms', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No rooms property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ACTIVITY_ROOMS,
      activityId: '1',
      roomIdsArr: ['a', 'b'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', rooms: ['a', 'b'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ACTIVITY_ROOM when the activity has no rooms property', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No rooms property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_ACTIVITY_ROOM,
      activityId: '1',
      roomId: 'a',
    };
    const expectedState = currentState; // No change since there were no rooms
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ACTIVITY_USER when the activity does not have users', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No users property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ACTIVITY_USER,
      activityId: '1',
      userId: 'user1',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', users: ['user1'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ACTIVITY_USER when the activity has no users property', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No users property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_ACTIVITY_USER,
      activityId: '1',
      userId: 'user1',
    };
    const expectedState = currentState; // No change since there were no users
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_ACTIVITY when the activity does not exist', () => {
    const currentState = initialState;
    const action = {
      type: actionTypes.UPDATED_ACTIVITY,
      activityId: '1',
      body: { description: 'New description' },
    };
    const expectedState = currentState; // No change since the activity does not exist
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_ACTIVITY_TAB when the activity does not have tabs', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No tabs property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ACTIVITY_TAB,
      activityId: '1',
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Activity 1',
          tabs: [], // Tabs remain empty since none exist with the given ID
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ACTIVITIES when activities do not exist', () => {
    const currentState = initialState; // No activities exist
    const action = {
      type: actionTypes.REMOVE_ACTIVITIES,
      activityIds: ['1', '2'], // Attempt to remove non-existent activities
    };
    const expectedState = initialState; // No change since activities don't exist
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ACTIVITY_ROOM when the activity does not exist', () => {
    const currentState = initialState; // No activities exist
    const action = {
      type: actionTypes.REMOVE_ACTIVITY_ROOM,
      activityId: '1',
      roomId: 'a',
    };
    const expectedState = currentState; // No change since the activity does not exist
    expect(reducer(currentState, action)).toEqual(expectedState);
  });
});

describe('activities reducer - edge cases that should fail in original but pass in new', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should not crash when ADD_ACTIVITY_ROOMS is called and the activity does not exist', () => {
    const action = {
      type: actionTypes.ADD_ACTIVITY_ROOMS,
      activityId: '1', // This activity does not exist in state
      roomIdsArr: ['room1'],
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when REMOVE_ACTIVITY_ROOM is called and the activity does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_ACTIVITY_ROOM,
      activityId: '1', // This activity does not exist in state
      roomId: 'room1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_ACTIVITY_USER is called and the activity does not exist', () => {
    const action = {
      type: actionTypes.ADD_ACTIVITY_USER,
      activityId: '1', // This activity does not exist in state
      userId: 'user1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when REMOVE_ACTIVITY_USER is called and the activity does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_ACTIVITY_USER,
      activityId: '1', // This activity does not exist in state
      userId: 'user1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should add rooms correctly even if the activity did not previously have any rooms', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No rooms property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ACTIVITY_ROOMS,
      activityId: '1',
      roomIdsArr: ['room1', 'room2'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', rooms: ['room1', 'room2'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should correctly update an activity tab even if the tabs array is empty or undefined', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No tabs property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ACTIVITY_TAB,
      activityId: '1',
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', tabs: [] }, // tabs should remain empty
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_ACTIVITY when there is no currentActivity in state', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.CLEAR_ACTIVITY,
    };
    const expectedState = {
      ...currentState,
      currentActivity: {}, // Should safely add currentActivity even if it didn't exist before
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should not crash when trying to update a non-existent activity', () => {
    const action = {
      type: actionTypes.UPDATED_ACTIVITY,
      activityId: '1', // This activity does not exist in state
      body: { description: 'Updated description' },
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when trying to update a tab in an activity that has no tabs', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Activity 1' }, // No tabs property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_ACTIVITY_TAB,
      activityId: '1',
      tabId: 'tab1',
      body: { name: 'Updated Tab 1' },
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Activity 1', tabs: [] }, // No change to tabs since no matching tab exists
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });
});
