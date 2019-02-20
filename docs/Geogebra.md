# VMT + GeoGebra

GeoeGebra provides one of the workspaces in which collaborative math can be done.
To get an overview visit [GeoGebra](http://www.geogebra.org) or read their API [docs]()

## Overview

The following document is intended to help anyone working on the GeoGebra applet embedded in VMT. It is organized as follows:

1. Location in the codebase
1. GgbGraph.js Explanation

- render()
- onScriptLoad()
- initializeGgb()

- componentDidMount()
- componentDidUpdate()

Inlcuding a GeoGebra app in React app is a bit of a hack. Their API updates the dom directly rather than via React's virtual DOM. On top of this, everything that happens inside the GeoGebra code is blocking. This is why we sometimes wrap geogebra updates in a `setTimout({}, 0)` ... so that our other UI updates can happen first.

## Location in the codebase

`./client/src/containers/workspace/` cotains all of the code related to geogebra. Specifically `ggbGraph.js` `ggbActivityGraph.js`, `ggbReplayer.js`, and `ggbUtils` These graphs are sent to workspace layout (in `./client/src/layout/workspace) as render props.

## **GgbGraph.js**

GgbGraph is where the magic happens. This Component receives information about the "Room" and a socket connection as props. It listens for updates to the GeoGebra construction and emits those updates to other users in the room. It also has a listener for receiving those events and then updating the construction accordingly.

**render()**

The render method simply returns a `<Script>` component which loads the GeoGebra app (or a loading incon if it hasn't loaded yet).

**onScriptLoad()**

This method constructs a parameters object and creates a GeoGebra instance. For a list of valid paramters look [here](https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters). The `appletOnLoad` parameter designates the function to run once the instance has succesfully been created. We pass in `this.initializeGgb`

**initializeGgb()**

<a name="sendEvnet"></a>

**sendEvent(xml, definition, label, eventType, action)**

creates a buffer multippart events like drags and shape creation

| Param      | Type                | Description                                                                              |
| ---------- | ------------------- | ---------------------------------------------------------------------------------------- |
| xml        | <code>String</code> | ggb generated xml of the even                                                            |
| definition | <code>String</code> | ggb multipoint definition (e.g. "Polygon(D, E, F, G)")                                   |
| label      | <code>String</code> | ggb label. ggbApplet.evalXML(label) yields xml representation of this label              |
| eventType  | <code>String</code> | ["ADD", "REMOVE", "UPDATE", "CHANGE_PERSPECTIVE", "NEW_TAB", "BATCH"] see ./models/event |
| action     | <code>String</code> | ggb action ["Add", "Remove", "Click", "Update"]                                          |

### add, remove, click, and update listeners (and registerListerners)

### perspectiveChanged

### ComponentDidMount

Here we initialize the updateDemnsions() method as the event handler when the window is resized
