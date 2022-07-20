import React from 'react';
import PropTypes from 'prop-types';
import { usePopulatedRoom } from 'utils';
import RoomsMonitor from './RoomsMonitor';

/**
 * The CourseMonitor provides three views into a set of rooms: activity graph, thumbnail, and chat. Users can
 * select which of all the rooms in the course.
 *
 * The views of the rooms are laid out as tiles. The tiles have their room name at top and a space for notifications. Clicking
 * on the notification icon brings up the notifications in a modal window for that room (@TODO). Hovering on the three dots next to a title
 *  brings up a menu: Enter Room, Manage Members, Open Replayer, and View Room Stats. Each of these simply goes to the
 * appropriate Route (the room, the lobby with the members tab selected, the room with the replayer, or the room lobby
 * with the Stats tab selected).
 *
 * For the activity graph, I reuse what's shown in the stats area of the room.
 * For the chat, there's a simpler chat component (SimpleChat), which is a SIGNIFICANTLY scaled down version of /Layout/Chat (i.e.,
 * ChatLayout) -- no references or arrows are shown, the text messages aren't clickable, etc. However, this component
 * does show the room name at top (rather than just 'Chat') and implements a dropdown menu (a component embedded in
 * the SimplifiedChat file) that was mostly copied from DropdownNavItem.
 * Thumbnails (@TODO) might require server-side rendering (e.g., via
 * Puppeteer) and then pulling the base64 string to the client.
 *
 */

function CourseMonitor({ course }) {
  // Because "useQuery" is the equivalent of useState, do this
  // initialization of queryStates (an object containing the states
  // for the API-retrieved data) at the top level rather than inside
  // of a useEffect.
  const queryStates = {};
  const populatedRooms = {};
  course.rooms.forEach((room) => {
    queryStates[room._id] = usePopulatedRoom(
      room._id,
      true,
      // Check for updates every 10 sec. If we are viewing rooms (i.e., Chat, Thumbnail, or Graph), then we need
      // to update only the currently selected rooms. If we are selecting rooms via the selection table, then we
      // should try to update all rooms so that the "current in room" column remains correct.
      {
        refetchInterval: 10000, // @TODO Should experiment with longer intervals to see what's acceptable to users (and the server)
      }
    );
    if (queryStates[room._id].isSuccess)
      populatedRooms[room._id] = queryStates[room._id].data;
    else delete populatedRooms[room._id];
  });

  return <RoomsMonitor populatedRooms={populatedRooms} />;
}

CourseMonitor.propTypes = {
  course: PropTypes.shape({ rooms: PropTypes.arrayOf(PropTypes.shape({})) })
    .isRequired,
};

export default CourseMonitor;
