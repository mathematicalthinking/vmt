# [Barret Math 7 Period 7/8](https://vmt-staging.mathematicalthinking.org/myVMT/courses/630531fc1ad0c618d7908345/rooms) Error when clicking on the Stats tab:

```javascript
/*
    RangeError: Maximum call stack size exceeded
        at statsReducer.js:203:21
        at p (CourseStats.js:15:29)
*/
```

- link doesn't work because of weird Course Code redirect

## Files:

1. [CourseStats.js](../Stats/CourseStats.js)
2. [statsReducer.js](../Stats/statsReducer.js)
3. [stats.utils.js](../Stats/stats.utils.js)

> Note: CourseStats also uses `usePopulatedRooms` & `useMergedData`, which we'll ignore for now, in [utilityHooks.js](../../utils/utilityHooks.js) as well as `findMatchingUsers` within [importing.js](../../utils/importing.js)

## Flow

1. get `populatedRooms` from `usePopulatedRooms`
2. once `populatedRooms` is successfully fetched enter `useEffect` 1 on line 57

   a. create `combinedLog` by reducing the `populatedRooms` into and array of `populatedRoom` `logs`

   b. dispatch `GENERATE_COURSE_DATA` send in the `combinedLog`

   > this dispatch updates `filteredData` within CourseStats by updating the reducer state

   c. trigger `useEffect` 2 on line 68 which calls `augmentFilteredData(filteredData`)

3. `augmentedData.current` = `augmentFilteredData(filteredData)`

4. within `augmentFilteredData(filteredData)`

    a. extract unique `userIds` from filteredData & 
    
    b. find those users from the db using `findAllMatching` within [helpers.js](../../../../server/middleware/utils/helpers.js)

    c. return the users as an object in the form of: { user._id: }

5. `augmentedData.current` is passed to exportCSV within [stats.utils.js](../Stats/stats.utils.js)

