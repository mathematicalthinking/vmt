# GgbGraph.js

## Sending and receiving events

- Geogebra makes it possible to listen to the following events:
  - add (registerAddListener)
  - update (registerUpdateListener)
  - remove (registerRemovListener)
  - click (registerClickListener)
  - client (registerClientListener)

### Add Events

creating points, lines, shapes, etc. as well as entering a statements in the algebra panel trigger
the add event listener which receives 1 argument: the label. We can get more information about
the label by passing it to various Geogebra methods. The information we're concerned with in addition to
the label is:

1. xml
1. algorithmXML (algXML)
1. commandString
1. objecType (objType)
1. coordinates (coords)
1. valueString

1) xml

```xml
<element type="line" label="l">
	<show object="true" label="true"/>
	<objColor r="0" g="0" b="0" alpha="0"/>
	<layer val="0"/>
	<labelMode val="0"/>
	<coords x="2.54" y="0.5600000000000003" z="-5.588000000000001"/>
	<lineStyle thickness="5" type="0" typeHidden="1" opacity="178"/>
	<eqnStyle style="implicit"/>
</element>
```
