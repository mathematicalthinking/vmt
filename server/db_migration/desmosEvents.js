const mongoose = require('mongoose');
const Models = require('../models');

mongoose.connect(`mongodb://localhost/vmt`, { useNewUrlParser: true });

async function migrate() {
  try {
    const events = await Models.Event.find({})
      .populate('tab')
      .lean()
      .exec();

    console.log(`There are ${events.length} events in total`);

    const desmosEvents = events.filter((event) => {
      return event.tab && event.tab.tabType === 'desmos';
    });

    console.log(`There are ${desmosEvents.length} desmos events`);

    let desmosEventsWithoutEvent = 0;
    await Promise.all(
      desmosEvents.map((desmosEvent) => {
        if (typeof desmosEvent.event === 'string') {
          return Models.Event.findByIdAndUpdate(desmosEvent._id, {
            $set: { currentState: desmosEvent.event },
          });
        }
        desmosEventsWithoutEvent += 1;
        return desmosEvent;
      })
    );

    console.log({ desmosEventsWithoutEvent });
    mongoose.connection.close();
  } catch (err) {
    mongoose.connection.close();
    console.log({ err });
  }
}

migrate();
