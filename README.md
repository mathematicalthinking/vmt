# VMT React
bootstrapped with https://github.com/okputadora/MERN-template.git

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
