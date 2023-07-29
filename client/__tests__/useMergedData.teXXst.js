import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider, useQuery, QueryClient } from 'react-query';
// import * as useMergedData from '../src/utils/useMergedData';

const createWrapper = () => {
  const queryClient = new QueryClient();
  // eslint-disable-next-line react/display-name, react/prop-types
  return ({ children }) => (
    // eslint-disable-next-line react/react-in-jsx-scope
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMergedData', () => {
  it('should return data from the server', async () => {
    // Mock the fetchFcn function
    const fetchFcn = jest.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useQuery(
          'test-key',
          fetchFcn
          // (data) => data.map((item) => item.id),
          // (oldData, newData) => [...oldData, ...newData]
        ),
      { wrapper: createWrapper() }
    );

    // Wait for the hook to update
    await waitForNextUpdate();
    expect(fetchFcn).toHaveBeenCalled();

    // Check the result
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ]);
  });
});
