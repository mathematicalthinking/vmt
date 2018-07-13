# VMT React
bootstrapped with https://github.com/okputadora/MERN-template.git

## Setup for local Development


## TODO

### General
1. ~~Loading screens for when the user should not be clicking around~~
1. Make ContentBox's content collapsible (to allow more room for workspace)
### Chat
1. Make chat scroll to bottom by default
1. make message components & style it up
1. Dynamic styling for users own messages vs incoming
1. Disable chat funcitonality in replayMode
### New Course
1. When selecting rooms to add or remove from the course the UX ain't great.
We should have some sort of small animation to signify the click is registered
or at the very least change the color for selected so it doesnt match hover.
Its confusing when you click de-select but then nothing appears to happen because
you're still hovering over it 

## Bugs
1. ~~We need to disable all buttons related replaying and interacting with the room
until the ggbClient is loaded.~~
1. ~~Navigating around the room (i.e. from replayer to enter-room is buggy and bad UX)
 enter room should change to exit room upon entering --> upon replaying it should
 say~~
1. When we enter a room with no data, make some events, and then click replayer
we get an error that there are no events (perhaps we need to make a new api call? not sure?)
1. We need to store current room users in the room object so that new users joining can
see who is already in the room
1. Every time a user enters a room it adds that room to "their rooms" (even it its already in their rooms)
1. When we click on a room we load up the events and then we click enter room we take the
last event and set the ggbBase64 with said event. If new events happen between time of clicking
on room and clicking on enter room we fall out of synch, perhaps it would be best to join
room immediately and just hide the geogebra workspace?  

## Ideas for further Development
### General/Optimization
1. Rooms and Courses containers have the exact same structure, we probably should
have made a more general container that can handle both of these but c'est la vie
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
1. Log how long students are in the room so teachers can see total time they spent working

### Ideas for rooms
1. Filtering
    * Allow filtering across multiple fields (active rooms with people in them etc.)
    * When someone leaves a room take a snapshot as png and display images of the rooms
  in the ContentBoxes that list them
