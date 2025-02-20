import reducer from '../src/store/reducers/coursesReducer'; // Adjust the path as necessary
import * as actionTypes from '../src/store/actions/actionTypes'; // Adjust the path as necessary

describe('course reducer', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle GOT_COURSES', () => {
    const action = {
      type: actionTypes.GOT_COURSES,
      byId: {
        1: { _id: '1', name: 'Course 1' },
        2: { _id: '2', name: 'Course 2' },
      },
      allIds: ['1', '2'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
        2: { _id: '2', name: 'Course 2' },
      },
      allIds: ['1', '2'],
    };
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGOUT', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, { type: actionTypes.LOGOUT })).toEqual(
      initialState
    );
  });

  it('should handle CREATED_COURSE', () => {
    const action = {
      type: actionTypes.CREATED_COURSE,
      course: { _id: '3', name: 'New Course' },
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
      },
      allIds: ['1'],
    };
    const expectedState = {
      byId: {
        ...currentState.byId,
        3: { _id: '3', name: 'New Course' },
      },
      allIds: ['3', '1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_COURSE', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
        2: { _id: '2', name: 'Course 2' },
      },
      allIds: ['1', '2'],
    };
    const action = {
      type: actionTypes.REMOVE_COURSE,
      courseId: '1',
    };
    const expectedState = {
      byId: {
        2: { _id: '2', name: 'Course 2' },
      },
      allIds: ['2'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_COURSE', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', description: 'Old description' },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.UPDATED_COURSE,
      courseId: '1',
      body: { description: 'New description' },
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', description: 'New description' },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_ACTIVITIES', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', activities: ['a'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_COURSE_ACTIVITIES,
      courseId: '1',
      activityIdsArr: ['b', 'c'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', activities: ['a', 'b', 'c'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_COURSE_ACTIVITIES', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', activities: ['a', 'b'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_COURSE_ACTIVITIES,
      courseId: '1',
      activityIdsArr: ['a'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', activities: ['b'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_ROOMS', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', rooms: ['room1'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_COURSE_ROOMS,
      courseId: '1',
      roomIdsArr: ['room2', 'room3'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', rooms: ['room1', 'room2', 'room3'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_COURSE_ROOM', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', rooms: ['room1', 'room2'] },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_COURSE_ROOM,
      courseId: '1',
      roomId: 'room1',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', rooms: ['room2'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_MEMBER', () => {
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          members: [{ user: { username: 'member1', _id: 1 } }],
        },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_COURSE_MEMBER,
      courseId: '1',
      newMember: { user: { username: 'member2', _id: 2 } },
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          members: [
            { user: { username: 'member1', _id: 1 } },
            { user: { username: 'member2', _id: 2 } },
          ],
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ROOM_TO_COURSE_ARCHIVE', () => {
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          archive: { rooms: ['room1'] },
        },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ROOM_TO_COURSE_ARCHIVE,
      courseId: '1',
      roomId: 'room2',
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          archive: { rooms: ['room1', 'room2'] },
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ROOM_FROM_COURSE_ARCHIVE', () => {
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          archive: { rooms: ['room1', 'room2'] },
        },
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_ROOM_FROM_COURSE_ARCHIVE,
      courseId: '1',
      roomId: 'room1',
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          archive: { rooms: ['room2'] },
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });
});

describe('course reducer edge cases', () => {
  const initialState = {
    byId: {},
    allIds: [],
  };

  it('should handle ADD_COURSE_ACTIVITIES when the course does not have activities', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' }, // No activities property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_COURSE_ACTIVITIES,
      courseId: '1',
      activityIdsArr: ['a', 'b'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', activities: ['a', 'b'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_COURSE_ACTIVITIES when the course has no activities property', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' }, // No activities property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_COURSE_ACTIVITIES,
      courseId: '1',
      activityIdsArr: ['a'],
    };
    const expectedState = currentState; // No change since there were no activities
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_ROOMS when the course does not have rooms', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' }, // No rooms property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_COURSE_ROOMS,
      courseId: '1',
      roomIdsArr: ['room1', 'room2'],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', rooms: ['room1', 'room2'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_COURSE_ROOM when the course has no rooms property', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' }, // No rooms property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_COURSE_ROOM,
      courseId: '1',
      roomId: 'room1',
    };
    const expectedState = currentState; // No change since there were no rooms
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_COURSE when the course does not exist', () => {
    const currentState = initialState;
    const action = {
      type: actionTypes.UPDATED_COURSE,
      courseId: '1',
      body: { description: 'New description' },
    };
    const expectedState = currentState; // No change since the course does not exist
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_MEMBER when the course does not have members', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' }, // No members property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_COURSE_MEMBER,
      courseId: '1',
      newMember: 'member1',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', members: ['member1'] },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_ROOM_TO_COURSE_ARCHIVE when the course does not have an archive', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' }, // No archive property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.ADD_ROOM_TO_COURSE_ARCHIVE,
      courseId: '1',
      roomId: 'room1',
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1', archive: { rooms: ['room1'] } },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_ROOM_FROM_COURSE_ARCHIVE when the course has no archive property', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' }, // No archive property
      },
      allIds: ['1'],
    };
    const action = {
      type: actionTypes.REMOVE_ROOM_FROM_COURSE_ARCHIVE,
      courseId: '1',
      roomId: 'room1',
    };
    const expectedState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          archive: {
            rooms: [], // An empty array should be initialized
          },
        },
      },
      allIds: ['1'],
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_COURSE_ACTIVITIES is called and the course does not exist', () => {
    const action = {
      type: actionTypes.ADD_COURSE_ACTIVITIES,
      courseId: '1', // This course does not exist in state
      activityIdsArr: ['a', 'b'],
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when REMOVE_COURSE_ACTIVITIES is called and the course does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_COURSE_ACTIVITIES,
      courseId: '1', // This course does not exist in state
      activityIdsArr: ['a', 'b'],
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_COURSE_ROOMS is called and the course does not exist', () => {
    const action = {
      type: actionTypes.ADD_COURSE_ROOMS,
      courseId: '1', // This course does not exist in state
      roomIdsArr: ['room1', 'room2'],
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when REMOVE_COURSE_ROOM is called and the course does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_COURSE_ROOM,
      courseId: '1', // This course does not exist in state
      roomId: 'room1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_COURSE_MEMBER is called and the course does not exist', () => {
    const action = {
      type: actionTypes.ADD_COURSE_MEMBER,
      courseId: '1', // This course does not exist in state
      newMember: 'member1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when ADD_ROOM_TO_COURSE_ARCHIVE is called and the course does not exist', () => {
    const action = {
      type: actionTypes.ADD_ROOM_TO_COURSE_ARCHIVE,
      courseId: '1', // This course does not exist in state
      roomId: 'room1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not crash when REMOVE_ROOM_FROM_COURSE_ARCHIVE is called and the course does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_ROOM_FROM_COURSE_ARCHIVE,
      courseId: '1', // This course does not exist in state
      roomId: 'room1',
    };
    const expectedState = initialState; // State should remain unchanged
    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should not mutate the original state when adding a course member', () => {
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          members: [{ user: { username: 'member1', _id: 1 } }],
        },
      },
      allIds: ['1'],
    };
    const clonedState = JSON.parse(JSON.stringify(currentState));
    const action = {
      type: actionTypes.ADD_COURSE_MEMBER,
      courseId: '1',
      newMember: { user: { username: 'member2', _id: 2 } },
    };
    reducer(currentState, action);
    expect(currentState).toEqual(clonedState); // Ensure original state is unchanged
  });

  it('should return the current state when action type is unknown', () => {
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
      },
      allIds: ['1'],
    };
    const action = { type: 'UNKNOWN_ACTION' };
    expect(reducer(currentState, action)).toEqual(currentState);
  });
});

describe('course reducer additional edge cases', () => {
  it('should handle ADD_COURSE with a missing _id field', () => {
    const action = {
      type: actionTypes.ADD_COURSE,
      course: { name: 'Course without ID' }, // Missing _id
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No change should happen due to missing _id
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE with a duplicate _id', () => {
    const action = {
      type: actionTypes.ADD_COURSE,
      course: { _id: '1', name: 'Duplicate Course' }, // Duplicate _id
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No change should happen due to duplicate _id
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle GOT_COURSES with duplicate course IDs in allIds array', () => {
    const action = {
      type: actionTypes.GOT_COURSES,
      byId: {
        1: { _id: '1', name: 'Course 1' },
        2: { _id: '2', name: 'Course 2' },
      },
      allIds: ['1', '2', '1'], // Duplicate ID '1'
    };
    const currentState = {
      byId: {},
      allIds: [],
    };
    const expectedState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
        2: { _id: '2', name: 'Course 2' },
      },
      allIds: ['1', '2'], // Duplicate '1' should be removed
    };
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_COURSE with a non-existing course ID', () => {
    const action = {
      type: actionTypes.REMOVE_COURSE,
      courseId: '999', // Non-existent course ID
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1' },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No change since course ID does not exist
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle UPDATED_COURSE with missing fields in body', () => {
    const action = {
      type: actionTypes.UPDATED_COURSE,
      courseId: '1',
      body: {}, // No fields provided in the update body
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', description: 'Old description' },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No changes should happen
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_MEMBER with duplicate member', () => {
    const action = {
      type: actionTypes.ADD_COURSE_MEMBER,
      courseId: '1',
      newMember: { user: { _id: 1, username: 'member1' } }, // member1 already exists
    };
    const currentState = {
      byId: {
        1: {
          _id: '1',
          name: 'Course 1',
          members: [{ user: { _id: 1, username: 'member1' } }],
        },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No change should happen due to duplicate member
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle REMOVE_COURSE_ROOM when the room does not exist', () => {
    const action = {
      type: actionTypes.REMOVE_COURSE_ROOM,
      courseId: '1',
      roomId: 'room999', // Non-existent room ID
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', rooms: ['room1', 'room2'] },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No change should happen since room does not exist
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_ROOMS when the room is already in the list', () => {
    const action = {
      type: actionTypes.ADD_COURSE_ROOMS,
      courseId: '1',
      roomIdsArr: ['room1'], // room1 is already in the rooms list
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', rooms: ['room1'] },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No change should happen due to duplicate room
    expect(reducer(currentState, action)).toEqual(expectedState);
  });

  it('should handle ADD_COURSE_ACTIVITIES when activities array contains duplicates', () => {
    const action = {
      type: actionTypes.ADD_COURSE_ACTIVITIES,
      courseId: '1',
      activityIdsArr: ['a', 'a'], // Duplicate activity 'a'
    };
    const currentState = {
      byId: {
        1: { _id: '1', name: 'Course 1', activities: ['a'] },
      },
      allIds: ['1'],
    };
    const expectedState = currentState; // No change since 'a' already exists
    expect(reducer(currentState, action)).toEqual(expectedState);
  });
});
