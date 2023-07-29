import { renderHook, act } from '@testing-library/react-hooks';
import { useSortableData, timeFrames } from '../src/utils/useSortableData';

const items = [
  {
    id: 1,
    name: 'John',
    age: 23,
    email: 'john@example.com',
    timestamp: '2022-01-01T12:34:56.789Z',
  },
  {
    id: 2,
    name: 'Jane',
    age: 24,
    email: 'jane@example.com',
    timestamp: '2023-07-02T12:34:56.789Z',
  },
  {
    id: 3,
    name: 'Bob',
    age: 25,
    email: 'bob@example.com',
    timestamp: '2023-07-03T12:34:56.789Z',
  },
];

describe('useSortableData', () => {
  it('should sort items by id in ascending order', () => {
    const { result } = renderHook(() => useSortableData(items));
    act(() => result.current.requestSort('id'));

    expect(result.current.items).toEqual([
      {
        id: 1,
        name: 'John',
        age: 23,
        email: 'john@example.com',
        timestamp: '2022-01-01T12:34:56.789Z',
      },
      {
        id: 2,
        name: 'Jane',
        age: 24,
        email: 'jane@example.com',
        timestamp: '2023-07-02T12:34:56.789Z',
      },
      {
        id: 3,
        name: 'Bob',
        age: 25,
        email: 'bob@example.com',
        timestamp: '2023-07-03T12:34:56.789Z',
      },
    ]);
  });

  it('should sort items by age in descending order', () => {
    const { result } = renderHook(() => useSortableData(items));
    act(() => {
      result.current.requestSort('age');
    });
    act(() => {
      result.current.requestSort('age');
    });

    expect(result.current.items).toEqual([
      {
        id: 3,
        name: 'Bob',
        age: 25,
        email: 'bob@example.com',
        timestamp: '2023-07-03T12:34:56.789Z',
      },
      {
        id: 2,
        name: 'Jane',
        age: 24,
        email: 'jane@example.com',
        timestamp: '2023-07-02T12:34:56.789Z',
      },
      {
        id: 1,
        name: 'John',
        age: 23,
        email: 'john@example.com',
        timestamp: '2022-01-01T12:34:56.789Z',
      },
    ]);
  });

  const currentDate = new Date();

  const dynamicItems = [
    {
      id: 1,
      name: 'John',
      age: 23,
      email: 'john@example.com',
      timestamp: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 2,
        1
      ).toISOString(), // 2 months ago
    },
    {
      id: 2,
      name: 'Jane',
      age: 24,
      email: 'jane@example.com',
      timestamp: new Date(
        currentDate.getTime() - 21 * 24 * 60 * 60 * 1000
      ).toISOString(), // 3 weeks ago
    },
    {
      id: 3,
      name: 'Bob',
      age: 25,
      email: 'bob@example.com',
      timestamp: currentDate.toISOString(), // now
    },
  ];

  const expectedItems = [
    {
      id: 2,
      name: 'Jane',
      age: 24,
      email: 'jane@example.com',
      timestamp: dynamicItems[1].timestamp,
    },
    {
      id: 3,
      name: 'Bob',
      age: 25,
      email: 'bob@example.com',
      timestamp: dynamicItems[2].timestamp,
    },
  ];

  it('should filter items by timeframe', () => {
    const { result } = renderHook(() => useSortableData(dynamicItems));
    act(() => {
      result.current.resetSort({
        key: 'timestamp',
        direction: 'ascending',
        filter: {
          timeframe: timeFrames.LASTMONTH,
          key: 'timestamp',
        },
      });
    });

    expect(result.current.items).toEqual(expectedItems);
  });

  it('should filter items by a custom filter function', () => {
    const { result } = renderHook(() => useSortableData(items));
    const customFilter = (item) => item.name === 'Jane';
    act(() =>
      result.current.resetSort({
        key: 'id',
        direction: 'ascending',
        filter: {
          filterFcn: customFilter,
        },
      })
    );

    expect(result.current.items).toEqual([
      {
        id: 2,
        name: 'Jane',
        age: 24,
        email: 'jane@example.com',
        timestamp: '2023-07-02T12:34:56.789Z',
      },
    ]);
  });
});
