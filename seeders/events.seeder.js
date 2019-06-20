const Seeder = require('mongoose-data-seed').Seeder;
const Event = require('../models/Event');
data = [
  {
    _id: '5d0bbffc173800e7aafc3fb1',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: '0',
    eventType: 'SELECT',
    action: 'mode',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event: null,
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051132249.0,
    description: 'michael selected the move tool',
    __v: 0,
  },

  /* 2 */
  {
    _id: '5d0bbffe51c14e4163d8b568',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: '16',
    eventType: 'SELECT',
    action: 'mode',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event: null,
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051134646.0,
    description: 'michael selected the polygon tool',
    __v: 0,
  },

  /* 3 */
  {
    _id: '5d0bbfff6eddbe262b134b72',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'B',
    eventType: 'ADD',
    action: 'added',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="point" label="B">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-2.44" y="3.67" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051135921.0,
    description: 'michael added point B',
    __v: 0,
  },

  /* 4 */
  {
    _id: '5d0bc000eaca2eed7693c68a',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'C',
    eventType: 'ADD',
    action: 'added',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="point" label="C">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-2.84" y="1.61" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051136419.0,
    description: 'michael added point C',
    __v: 0,
  },

  /* 5 */
  {
    _id: '5d0bc0012a354428a95f568c',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'D',
    eventType: 'ADD',
    action: 'added',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="point" label="D">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-1.1" y="2.53" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051137150.0,
    description: 'michael added point D',
    __v: 0,
  },

  /* 6 */
  {
    _id: '5d0bc00283c8de1f7b2c40ae',
    eventArray: [
      't1:Polygon(B, C, D)',
      'd:Segment(B, C, t1)',
      'b:Segment(C, D, t1)',
      'c:Segment(D, B, t1)',
    ],
    isMultiPart: false,
    isTrashed: false,
    definition: 'Segment(D, B, t1)',
    label: 'c',
    eventType: 'BATCH_ADD',
    action: 'added',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="segment" label="c">\n\t<show object="true" label="true"/>\n\t<objColor r="153" g="51" b="0" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<auxiliary val="false"/>\n\t<coords x="-1.1400000000000001" y="-1.3399999999999999" z="2.1361999999999997"/>\n\t<lineStyle thickness="5" type="0" typeHidden="1" opacity="178"/>\n\t<outlyingIntersections val="false"/>\n\t<keepTypeOnTransform val="true"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051138470.0,
    description: 'michael added triangle t1',
    __v: 0,
  },

  /* 7 */
  {
    _id: '5d0bc0143a432934b98cfb8c',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: '10',
    eventType: 'SELECT',
    action: 'mode',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event: null,
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051156932.0,
    description: 'michael selected the circle_two_points tool',
    __v: 0,
  },

  /* 8 */
  {
    _id: '5d0bc01638b8765aae3c0651',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'E',
    eventType: 'ADD',
    action: 'added',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="point" label="E">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="2.78" y="4.81" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051158257.0,
    description: 'michael added point E',
    __v: 0,
  },

  /* 9 */
  {
    _id: '5d0bc017a83d03f6e30220bc',
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'F',
    eventType: 'ADD',
    action: 'added',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="point" label="F">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="3" y="4" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051159285.0,
    description: 'michael added point F',
    __v: 0,
  },

  /* 10 */
  {
    _id: '5d0bc01745330bfba160e4be',
    eventArray: ['e:Circle(E, F)'],
    isMultiPart: false,
    isTrashed: false,
    definition: 'Circle(E, F)',
    label: 'e',
    eventType: 'ADD',
    action: 'added',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="conic" label="e">\n\t<show object="true" label="true"/>\n\t<objColor r="0" g="0" b="0" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<lineStyle thickness="5" type="0" typeHidden="1" opacity="178"/>\n\t<eigenvectors  x0="1" y0="0" z0="1.0" x1="0" y1="1" z1="1.0"/>\n\t<matrix A0="1" A1="1" A2="30.159999999999997" A3="0" A4="-2.78" A5="-4.81"/>\n\t<eqnStyle style="specific"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051159634.0,
    description: 'Wesley added circle e',
    __v: 0,
  },

  /* 11 */
  {
    _id: '5d0bc02378f4bcbd8bba013d',
    eventArray: [
      '<element type="point" label="C">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-2.68" y="1.72" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n<element type="point" label="D">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-0.94" y="2.64" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    ],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'D',
    eventType: 'BATCH_UPDATE',
    action: 'updated',
    room: '5d0bbff1732ad02ae8d50614',
    tab: '5d0bbff1732ad02ae8d50616',
    event:
      '<element type="point" label="C">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-2.68" y="1.72" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n<element type="point" label="D">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-0.94" y="2.64" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: '5ba289ba7223b9429888b8ed',
    timestamp: 1561051171463.0,
    description: 'Wesley dragged point D',
    __v: 0,
  },
];

const EventsSeeder = Seeder.extend({
  shouldRun: function() {
    return Event.count()
      .exec()
      .then(count => count === 0);
  },
  run: function() {
    return Event.create(data);
  },
});

module.exports = EventsSeeder;
