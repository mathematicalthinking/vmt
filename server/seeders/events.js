const { ObjectId } = require('./utils');

module.exports = [
  /* 1 */
  {
    _id: ObjectId('5d0d2eea4c6eef0bb6fee583'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: '0',
    eventType: 'SELECT',
    action: 'mode',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event: null,
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145066995.0,
    description: 'w_crush selected the move tool',
    __v: 0,
  },

  /* 2 */
  {
    _id: ObjectId('5d0d2eed10db9146c88cc884'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: '16',
    eventType: 'SELECT',
    action: 'mode',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event: null,
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145069173.0,
    description: 'w_crush selected the polygon tool',
    __v: 0,
  },

  /* 3 */
  {
    _id: ObjectId('5d0d2eeec021dad9ca085e9b'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'B',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="B">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-6.87" y="5.35" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145070311.0,
    description: 'w_crush added point B',
    __v: 0,
  },

  /* 4 */
  {
    _id: ObjectId('5d0d2eef739d71794cfbd433'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'C',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="C">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-6.93" y="3.45" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145071304.0,
    description: 'w_crush added point C',
    __v: 0,
  },

  /* 5 */
  {
    _id: ObjectId('5d0d2eef45472bcd48200ac9'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'D',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="D">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-4.03" y="3.57" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145071881.0,
    description: 'w_crush added point D',
    __v: 0,
  },

  /* 6 */
  {
    _id: ObjectId('5d0d2ef0f04e9ec308ead87a'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'E',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="E">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-4.13" y="5.45" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145072542.0,
    description: 'w_crush added point E',
    __v: 0,
  },

  /* 7 */
  {
    _id: ObjectId('5d0d2ef13017e01a937f8ad7'),
    eventArray: [
      'q1:Polygon(B, C, D, E)',
      'b:Segment(B, C, q1)',
      'c:Segment(C, D, q1)',
      'd:Segment(D, E, q1)',
      'e:Segment(E, B, q1)',
    ],
    isMultiPart: false,
    isTrashed: false,
    definition: 'Segment(E, B, q1)',
    label: 'e',
    eventType: 'BATCH_ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="segment" label="e">\n\t<show object="true" label="true"/>\n\t<objColor r="153" g="51" b="0" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<auxiliary val="false"/>\n\t<coords x="0.10000000000000053" y="-2.74" z="15.346000000000007"/>\n\t<lineStyle thickness="5" type="0" typeHidden="1" opacity="178"/>\n\t<outlyingIntersections val="false"/>\n\t<keepTypeOnTransform val="true"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145073588.0,
    description: 'w_crush added quadrilateral q1',
    __v: 0,
  },

  /* 8 */
  {
    _id: ObjectId('5d0d2ef2bca283c0486d8b6d'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: '10',
    eventType: 'SELECT',
    action: 'mode',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event: null,
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145074430.0,
    description: 'w_crush selected the circle_two_points tool',
    __v: 0,
  },

  /* 9 */
  {
    _id: ObjectId('5d0d2ef312c5bddafe648df0'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'F',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="F">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-4.65" y="-2.77" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145075918.0,
    description: 'w_crush added point F',
    __v: 0,
  },

  /* 10 */
  {
    _id: ObjectId('5d0d2ef4caa509a7240d3e88'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'G',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="G">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="-4.23" y="-4.29" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145076784.0,
    description: 'w_crush added point G',
    __v: 0,
  },

  /* 11 */
  {
    _id: ObjectId('5d0d2ef596ec8494d9cba30b'),
    eventArray: ['f:Circle(F, G)'],
    isMultiPart: false,
    isTrashed: false,
    definition: 'Circle(F, G)',
    label: 'f',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="conic" label="f">\n\t<show object="true" label="true"/>\n\t<objColor r="0" g="0" b="0" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<lineStyle thickness="5" type="0" typeHidden="1" opacity="178"/>\n\t<eigenvectors  x0="1" y0="0" z0="1.0" x1="0" y1="1" z1="1.0"/>\n\t<matrix A0="1" A1="1" A2="26.808600000000006" A3="0" A4="4.65" A5="2.77"/>\n\t<eqnStyle style="specific"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145077142.0,
    description: 'w_crush added circle f',
    __v: 0,
  },

  /* 12 */
  {
    _id: ObjectId('5d0d2ef609194b2192f0f546'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: '2',
    eventType: 'SELECT',
    action: 'mode',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event: null,
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145078194.0,
    description: 'w_crush selected the join tool',
    __v: 0,
  },

  /* 13 */
  {
    _id: ObjectId('5d0d2ef7b47b29aea100b502'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'H',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="H">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="3.43" y="5.79" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145079344.0,
    description: 'w_crush added point H',
    __v: 0,
  },

  /* 14 */
  {
    _id: ObjectId('5d0d2ef85000c519d7428ccf'),
    eventArray: [],
    isMultiPart: false,
    isTrashed: false,
    definition: null,
    label: 'I',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="point" label="I">\n\t<show object="true" label="true"/>\n\t<objColor r="77" g="77" b="255" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<animation step="1" speed="1" type="1" playing="false"/>\n\t<coords x="3.89" y="-2.33" z="1"/>\n\t<pointSize val="5"/>\n\t<pointStyle val="0"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145080669.0,
    description: 'w_crush added point I',
    __v: 0,
  },

  /* 15 */
  {
    _id: ObjectId('5d0d2ef9dc6e8d35abcdafe3'),
    eventArray: ['g:Line(H, I)'],
    isMultiPart: false,
    isTrashed: false,
    definition: 'Line(H, I)',
    label: 'g',
    eventType: 'ADD',
    action: 'added',
    room: ObjectId('5d0d2ed0535e3a522445f7a7'),
    tab: ObjectId('5d0d2ed0535e3a522445f7a9'),
    event:
      '<element type="line" label="g">\n\t<show object="true" label="true"/>\n\t<objColor r="0" g="0" b="0" alpha="0"/>\n\t<layer val="0"/>\n\t<labelMode val="0"/>\n\t<coords x="8.2" y="0.48" z="-30.9052"/>\n\t<lineStyle thickness="5" type="0" typeHidden="1" opacity="178"/>\n\t<eqnStyle style="implicit"/>\n</element>\n',
    color: '#f26247',
    user: ObjectId('5d0d2eae535e3a522445f7a4'),
    timestamp: 1561145081053.0,
    description: 'w_crush added line g',
    __v: 0,
  },

  /* 16 */
  {
    _id: ObjectId('5d8e1c3533014c946f1fcb34'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594421315.0,
    eventArray: [],
    __v: 0,
  },

  /* 17 */
  {
    _id: ObjectId('5d8e1c3933014c946f1fcb36'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594425975.0,
    eventArray: [],
    __v: 0,
  },

  /* 18 */
  {
    _id: ObjectId('5d8e1c3a33014c946f1fcb37'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594426196.0,
    eventArray: [],
    __v: 0,
  },

  /* 19 */
  {
    _id: ObjectId('5d8e1c3a33014c946f1fcb38'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594426790.0,
    eventArray: [],
    __v: 0,
  },

  /* 20 */
  {
    _id: ObjectId('5d8e1c3b33014c946f1fcb39'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x_2","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594427816.0,
    eventArray: [],
    __v: 0,
  },

  /* 21 */
  {
    _id: ObjectId('5d8e1c3c33014c946f1fcb3a'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594428949.0,
    eventArray: [],
    __v: 0,
  },

  /* 22 */
  {
    _id: ObjectId('5d8e1c3d33014c946f1fcb3b'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ ","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594429968.0,
    eventArray: [],
    __v: 0,
  },

  /* 23 */
  {
    _id: ObjectId('5d8e1c3e33014c946f1fcb3c'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594430264.0,
    eventArray: [],
    __v: 0,
  },

  /* 24 */
  {
    _id: ObjectId('5d8e1c3f33014c946f1fcb3d'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594431198.0,
    eventArray: [],
    __v: 0,
  },

  /* 25 */
  {
    _id: ObjectId('5d8e1c4133014c946f1fcb3e'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594433246.0,
    eventArray: [],
    __v: 0,
  },

  /* 26 */
  {
    _id: ObjectId('5d8e1c4533014c946f1fcb3f'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594437135.0,
    eventArray: [],
    __v: 0,
  },

  /* 27 */
  {
    _id: ObjectId('5d8e1c4533014c946f1fcb40'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594437342.0,
    eventArray: [],
    __v: 0,
  },

  /* 28 */
  {
    _id: ObjectId('5d8e1c4533014c946f1fcb41'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=4","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594437471.0,
    eventArray: [],
    __v: 0,
  },

  /* 29 */
  {
    _id: ObjectId('5d8e1c4533014c946f1fcb42'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=4x","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594437741.0,
    eventArray: [],
    __v: 0,
  },

  /* 30 */
  {
    _id: ObjectId('5d8e1c4833014c946f1fcb43'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=4","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594440101.0,
    eventArray: [],
    __v: 0,
  },

  /* 31 */
  {
    _id: ObjectId('5d8e1c4833014c946f1fcb44'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594440436.0,
    eventArray: [],
    __v: 0,
  },

  /* 32 */
  {
    _id: ObjectId('5d8e1c4c33014c946f1fcb45'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594444901.0,
    eventArray: [],
    __v: 0,
  },

  /* 33 */
  {
    _id: ObjectId('5d8e1c4d33014c946f1fcb46'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594445406.0,
    eventArray: [],
    __v: 0,
  },

  /* 34 */
  {
    _id: ObjectId('5d8e1c4e33014c946f1fcb47'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^{ },","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594446614.0,
    eventArray: [],
    __v: 0,
  },

  /* 35 */
  {
    _id: ObjectId('5d8e1c4f33014c946f1fcb48'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594447182.0,
    eventArray: [],
    __v: 0,
  },

  /* 36 */
  {
    _id: ObjectId('5d8e1c5133014c946f1fcb49'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594449124.0,
    eventArray: [],
    __v: 0,
  },

  /* 37 */
  {
    _id: ObjectId('5d8e1c5333014c946f1fcb4a'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"4","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594451310.0,
    eventArray: [],
    __v: 0,
  },

  /* 38 */
  {
    _id: ObjectId('5d8e1c5433014c946f1fcb4b'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594452299.0,
    eventArray: [],
    __v: 0,
  },

  /* 39 */
  {
    _id: ObjectId('5d8e1c5833014c946f1fcb4c'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594456165.0,
    eventArray: [],
    __v: 0,
  },

  /* 40 */
  {
    _id: ObjectId('5d8e1c5833014c946f1fcb4d'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594456590.0,
    eventArray: [],
    __v: 0,
  },

  /* 41 */
  {
    _id: ObjectId('5d8e1c5c33014c946f1fcb4e'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594460774.0,
    eventArray: [],
    __v: 0,
  },

  /* 42 */
  {
    _id: ObjectId('5d8e1c5d33014c946f1fcb4f'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594461164.0,
    eventArray: [],
    __v: 0,
  },

  /* 43 */
  {
    _id: ObjectId('5d8e1c5e33014c946f1fcb50'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^{ },","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594462422.0,
    eventArray: [],
    __v: 0,
  },

  /* 44 */
  {
    _id: ObjectId('5d8e1c5e33014c946f1fcb51'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594462749.0,
    eventArray: [],
    __v: 0,
  },

  /* 45 */
  {
    _id: ObjectId('5d8e1c6033014c946f1fcb52'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^{9\\\\ },","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594464806.0,
    eventArray: [],
    __v: 0,
  },

  /* 46 */
  {
    _id: ObjectId('5d8e1c6333014c946f1fcb53'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^{9\\\\ ^{ }}","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594467181.0,
    eventArray: [],
    __v: 0,
  },

  /* 47 */
  {
    _id: ObjectId('5d8e1c6433014c946f1fcb54'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^{9\\\\ },","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594468532.0,
    eventArray: [],
    __v: 0,
  },

  /* 48 */
  {
    _id: ObjectId('5d8e1c6533014c946f1fcb55'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594469451.0,
    eventArray: [],
    __v: 0,
  },

  /* 49 */
  {
    _id: ObjectId('5d8e1c6733014c946f1fcb56'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^{ },","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594471124.0,
    eventArray: [],
    __v: 0,
  },

  /* 50 */
  {
    _id: ObjectId('5d8e1c6833014c946f1fcb57'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594472030.0,
    eventArray: [],
    __v: 0,
  },

  /* 51 */
  {
    _id: ObjectId('5d8e1c6833014c946f1fcb58'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594472909.0,
    eventArray: [],
    __v: 0,
  },

  /* 52 */
  {
    _id: ObjectId('5d8e1c6a33014c946f1fcb59'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ ","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594474110.0,
    eventArray: [],
    __v: 0,
  },

  /* 53 */
  {
    _id: ObjectId('5d8e1c6a33014c946f1fcb5a'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594474294.0,
    eventArray: [],
    __v: 0,
  },

  /* 54 */
  {
    _id: ObjectId('5d8e1c6a33014c946f1fcb5b'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ ","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594474558.0,
    eventArray: [],
    __v: 0,
  },

  /* 55 */
  {
    _id: ObjectId('5d8e1c6a33014c946f1fcb5c'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ 4","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594474716.0,
    eventArray: [],
    __v: 0,
  },

  /* 56 */
  {
    _id: ObjectId('5d8e1c6d33014c946f1fcb5d'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ 4z","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594477230.0,
    eventArray: [],
    __v: 0,
  },

  /* 57 */
  {
    _id: ObjectId('5d8e1c6e33014c946f1fcb5e'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ 4z^{ },","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594478219.0,
    eventArray: [],
    __v: 0,
  },

  /* 58 */
  {
    _id: ObjectId('5d8e1c6e33014c946f1fcb5f'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ 4z^3","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594478491.0,
    eventArray: [],
    __v: 0,
  },

  /* 59 */
  {
    _id: ObjectId('5d8e1c6f33014c946f1fcb60'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ 4z^{ },","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594479729.0,
    eventArray: [],
    __v: 0,
  },

  /* 60 */
  {
    _id: ObjectId('5d8e1c7033014c946f1fcb61'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ 4z","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594480032.0,
    eventArray: [],
    __v: 0,
  },

  /* 61 */
  {
    _id: ObjectId('5d8e1c7033014c946f1fcb62'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ 4","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594480449.0,
    eventArray: [],
    __v: 0,
  },

  /* 62 */
  {
    _id: ObjectId('5d8e1c7133014c946f1fcb63'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -\\\\ ","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594481066.0,
    eventArray: [],
    __v: 0,
  },

  /* 63 */
  {
    _id: ObjectId('5d8e1c7133014c946f1fcb64'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594481681.0,
    eventArray: [],
    __v: 0,
  },

  /* 64 */
  {
    _id: ObjectId('5d8e1c7133014c946f1fcb65'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ ","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594481864.0,
    eventArray: [],
    __v: 0,
  },

  /* 65 */
  {
    _id: ObjectId('5d8e1c7533014c946f1fcb66'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594485139.0,
    eventArray: [],
    __v: 0,
  },

  /* 66 */
  {
    _id: ObjectId('5d8e1c7533014c946f1fcb67'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -4","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594485698.0,
    eventArray: [],
    __v: 0,
  },

  /* 67 */
  {
    _id: ObjectId('5d8e1c7533014c946f1fcb68'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -44","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594485897.0,
    eventArray: [],
    __v: 0,
  },

  /* 68 */
  {
    _id: ObjectId('5d8e1c7733014c946f1fcb69'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -4","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594487113.0,
    eventArray: [],
    __v: 0,
  },

  /* 69 */
  {
    _id: ObjectId('5d8e1c7833014c946f1fcb6a'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -4","style":"SOLID"},{"type":"expression","id":"5","color":"#fa7e19","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594488945.0,
    eventArray: [],
    __v: 0,
  },

  /* 70 */
  {
    _id: ObjectId('5d8e1c7d33014c946f1fcb6b'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -4","style":"SOLID"},{"type":"expression","id":"4","color":"#388c46","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594493084.0,
    eventArray: [],
    __v: 0,
  },

  /* 71 */
  {
    _id: ObjectId('5d8e1c7e33014c946f1fcb6c'),
    isMultiPart: false,
    isTrashed: false,
    room: ObjectId('5d83f029dd0c4946d81684d2'),
    tab: ObjectId('5d83f029dd0c4946d81684d4'),
    currentState:
      '{"version":5,"graph":{"viewport":{"xmin":-10,"ymin":-10.774558209070811,"xmax":10,"ymax":10.774558209070811}},"expressions":{"list":[{"type":"expression","id":"1","color":"#c74440","latex":"y=4x\\\\ +3","style":"SOLID"},{"type":"expression","id":"2","color":"#c74440","latex":"y=3x^4","style":"SOLID"},{"type":"expression","id":"3","color":"#2d70b3","latex":"y=3x^9\\\\ -4","style":"SOLID"}]}}',
    color: '#f26247',
    user: ObjectId('5d1a59d79c78ad48c0480caa'),
    timestamp: 1569594494225.0,
    eventArray: [],
    __v: 0,
  },
];
