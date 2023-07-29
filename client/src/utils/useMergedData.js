import { useQueryClient, useQuery } from 'react-query';

/**
 * A custom hook that assumes the fetchFcn might sometimes not return all documents in a key bc they hadn't been updated since the last query.
 * The hook therefore uses a provided merge function to combine the new data coming in from the fetch with its own cache. The hook also keeps
 * track of the last query times organized by a provided extractIds function.
 *
 * key - The key index of the query. Should be an array of objects, one field of which is the unique identifier extracted by extractIdsFcn
 * fetchFcn - A function to do the query
 * extractIdsFcn - A function to extract all the unique identifiers from each object returned from the query
 * mergeFcn - A function that merges the cached data with the new data.
 * options - useQuery options
 *
 */

export default function useMergedData(
  key,
  fetchFcn,
  extractIdsFcn,
  mergeFcn,
  options = {}
) {
  const queryClient = useQueryClient();
  const lastQueryTimes = queryClient.getQueryData([key, 'lastQueryTimes']);

  const { data, ...others } = useQuery(key, () => fetchFcn(lastQueryTimes), {
    onSuccess: (newData) => {
      queryClient.setQueryData([key, 'mergedData'], (cache) =>
        mergeFcn(cache, newData)
      );

      const newDataIds = extractIdsFcn(newData);
      const updatedLastQueryTimes = newDataIds.reduce(
        (acc, id) => ({
          ...acc,
          [id]: Date.now(),
        }),
        {}
      );
      queryClient.setQueryData([key, 'lastQueryTimes'], {
        ...lastQueryTimes,
        ...updatedLastQueryTimes,
      });
    },
    ...options,
  });
  return { data: queryClient.getQueryData([key, 'mergedData']), ...others };
}
