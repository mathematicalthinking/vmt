/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import API from '../../../utils/apiRequests';
import SimpleChat from '../../../Components/Chat/SimpleChat';

/**
 * The MonitoringView provides three views into a set of rooms: activity graph, thumbnail, and chat.  All possible rooms are given by userResources,
 * but this view will select the ones with activity in the past hour by default. Perhaps there will be a way for
 * the user to select which of all of their rooms to show.
 *
 * The views of the rooms are laid out as tiles. The tiles have their room name at top and a space for notifications. Clicking
 * on the notification icon brings up the notifications in a modal window for that room. Clicking on the tile brings
 * up a menu: Enter Room, Manage Members, Open Replayer, and Export Room Stats. Each of these simply goes to the
 * appropriate Route (the room, the lobby with the members tab selected, the room with the replayer, or the room lobby
 * with the Stats tab selected).
 *
 * For the activity graph, I can reuse what's shown in the stats area of the room, perhaps adjusted for the past hour.
 * For the chat, I can reuse the Chat component, connecting each one to the appropriate messages (which
 * are part of each room object that I already have). Thumbnails might require server-side rendering (e.g., via
 * Puppeteer) and then pulling the base64 string to the client.
 *
 * 3/24/2021: Only the room chats are implemented, and they are not yet being updated automatically. It works by
 * first populating the rooms managed by the user (the chats messages only) from the server. Each room's chats are
 * displayed using a SimplifiedChat component, which is a SIGNIFICANTLY scaled down version of /Layout/Chat (i.e.,
 * ChatLayout) -- no references or arrows are shown, the text messages aren't clickable, etc. However, this component
 * does show the room name at top (rather than just 'Chat') and implements a dropdown menu (a component embedded in
 * the SimplifiedChat file) that was mostly copied from DropdownNavItem.
 *
 * Note that I could have used the normal Chat component (with all the bells and whistles) with just some minor
 * adjustments. Let's see if users want that or this is enough.
 *
 * @TODO:
 *  - Install react-query so that the chats can be cached and independently updated
 *  - have the outline of a chat visible as the messages are being retrieved from the server (as needed)
 *  - put all styles into a separate css file to be consistent with the rest of the codebase
 *  - implement the other two types of monitoring.
 *  - when you use the menu to jump somewhere else, the way to get back to Monitoring is the browser's Back button.
 *    Is this obvious enough for users?
 *  - Right now, ALL rooms managed by the user are shown. There needs to be a way of selecting which rooms to monitor.
 */

export default function MonitoringView({ userResources, notifications }) {
  const [populatedRooms, setPopulated] = React.useState([]);

  React.useEffect(() => {
    const populated = userResources.map(async (room) => {
      const res = await API.getPopulatedById('rooms', room._id, false, false);
      return res.data.result;
    });
    // note: The API calls are being made in parallel, so the time to get all the info is the time taken by the single slowest API response.
    Promise.all(populated).then((res) => setPopulated(res));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexFlow: 'wrap' }}>
      {populatedRooms.map((room) => {
        return (
          !!room.chat.length && (
            <div
              key={room._id}
              style={{
                // copied from the usual Chat's css file
                width: '300px',
                display: 'flex',
                flexFlow: 'wrap',
                flexDirection: 'row',
                boxShadow: 'lightestShadow',
                alignSelf: 'auto',
                borderRadius: '3px',
                padding: '5px',
                height: '300px',
              }}
            >
              <SimpleChat
                log={room.chat}
                title={room.name}
                menu={[
                  {
                    name: 'Enter Room',
                    link: `/myVMT/workspace/${room._id}`,
                  },
                  {
                    name: 'Manage Members',
                    link: `/myVMT/rooms/${room._id}/members`,
                  },
                  {
                    name: 'Open Replayer',
                    link: `/myVMT/workspace/${room._id}/replayer`,
                  },
                  {
                    name: 'View/Export Room Stats',
                    link: `/myVMT/rooms/${room._id}/stats`,
                  },
                ]}
              />
            </div>
          )
        );
      })}
    </div>
  );
}

MonitoringView.propTypes = {
  // @TODO clean up so only specify what we need
  resource: PropTypes.string.isRequired,
  parentResource: PropTypes.string,
  parentResourceId: PropTypes.string,
  user: PropTypes.shape({}).isRequired,
  userResources: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

MonitoringView.defaultProps = {
  parentResource: null,
  parentResourceId: null,
};
