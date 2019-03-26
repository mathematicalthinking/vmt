const Seeder = require("mongoose-data-seed").Seeder;
const Tab = require("../models/Tab");

data = [
  {
    _id: "5c98e1169b093c0c9812b2f2",
    currentState: "",
    perspective: "AD",
    events: [],
    startingPoint: null,
    controlledBy: null,
    isTrashed: false,
    name: "Tab 1",
    room: "5ba289c57223b9429888b9b5",
    desmosLink: "",
    tabType: "geogebra",
    appName: "classic",
    __v: 0
  }
];

const TabsSeeder = Seeder.extend({
  shouldRun: function() {
    return Tab.count()
      .exec()
      .then(count => count === 0);
  },
  run: function() {
    return Tab.create(data);
  }
});

module.exports = TabsSeeder;
