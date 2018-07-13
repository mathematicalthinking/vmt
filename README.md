# VMT React
bootstrapped with https://github.com/okputadora/MERN-template.git


## TODO

### General
1. ~~Loading screens for when the user should not be clicking around~~
1. Make ContentBox's content collapsible (to allow more room for workspace)
### Chat
1. Make chat scroll to bottom by default
1. make message components & style it up
1. Dynamic styling for users own messages vs incoming

## Bugs
1. ~~We need to disable all buttons related replaying and interacting with the room
until the ggbClient is loaded.~~
1. ~~Navigating around the room (i.e. from replayer to enter-room is buggy and bad UX)
 enter room should change to exit room upon entering --> upon replaying it should
 say~~
1. When we enter a room with now data, make some events, and then click replayer
we get an error that there are no events (perhaps we need to make a new api call? not sure?)
1. Users in room is not updated via socket.io 

## Ideas for further Development
### Ideas for the replayer
1. have the time between each event = the actual time between events at creation
  * we could accomplish this with moment and taking a diff of the timestamps of each event
  * then in the event model we would have a field like timeToNextEvent
  * On the front end we initialize a new setTimeout every time we want to move to the next event
  and set its time to event.timeToNextEvent
  * If the distance is more than 15 seconds we can skip to the next event and
  let the user know how much time has elapsed
  * Perhaps we could also give the option to speed up
1. Have the user who performed the action highlighted (or something)
1. Replay the chat in unison?
1. Movie-player-like UI
1. When you draw a square, that should be four events (each point). but right now
when an event is fired when we add each point, but also when we make a line by
connecting two points, and also when we make a square by connecting the last point
--- this looks weird in the replayer
1. Perhaps we could make the playback look nice by utilizing geogebra's animation api
e.g., setAnimating, startAnimcation

### Ideas for rooms
1. Filtering
  * Allow filtering across multiple fields (active rooms with people in them etc.)
  * When someone leaves a room take a snapshot as png and display images of the rooms
  in the ContentBoxes that list them
