// State variables
// Tracks when a client is processing a geogebra event it recieved from the server
var processingMsg = false;

// Track when updating a group of objects - ignore individual updates to cut down on web traffic
var updatingObjs = false;

// Tracks when a client is getting polygon cunstruction info from its own geogebra instance
var addingPoly = false;

// ********************* Respond to events *****************
var clientIf = parent.collaborateClient ? parent.collaborateClient : window.collaborateClient;
var socket = clientIf.getSocket();
// ggbEventHandlers - a list of functions to handle each geogberaEvent from the server
var ggbEventHandlers = {};

var tabId;

// hold the reference to the interval when auto-updating the view when the user has control
var viewUpdateInterval;
var viewData = {};
var lastEventWasUpdateView = false;

var selectedElms = [];

// variables to help throttle dragging updates
var pointerDragging = false;
var moveUpdates = 0;
var lastMove = null;
var movingObjs = {};
var movingIndependent = false;

$(document).ready( function() {
  tabId = $("#tabId").val();
  console.log( "This room is: " + $("#roomId").val() );

ggbEventHandlers.reset = function(){
  console.log('Reset GGB' );
  processingMsg = true;
  var b64 = $('.geogebraweb').attr('data-param-ggbbase64');
  ggbApplet.setBase64(b64);
  processingMsg = false;
};

ggbEventHandlers.clearggb = function(data){
  console.log('Notified that ggb was cleared ' + JSON.stringify(data));
  processingMsg = true;
  ggbApplet.reset();
  processingMsg = false;
};

ggbEventHandlers.polyadd = function(data){
  console.log('Notified that polygon was added\n' + escape(JSON.stringify(data)) ) ;
  processingMsg = true;
  ggbApplet.evalXML(data.xml);
  ggbApplet.refreshViews();
  processingMsg = false;
};

ggbEventHandlers.elmadd = function(data){
  console.log('Notified that geoelm was added\n' + unescape(data.xml));
  processingMsg = true;
  ggbApplet.evalXML(unescape(data.xml));
  var xmlData = "<wrapper>" + unescape(data.xml) + "</wrapper>"
  var jqXml = $( xmlData );
  var elmXml = jqXml.find( "element" );
  var type = elmXml.attr("type");
  var label = elmXml.attr("label");
  console.log("Added " + type + " " + label );
  // this hack is needed because evalXMl doesn't trigger the code to make points appear
  if( type === "point" ){
    if( ggbApplet.getVisible( label ) ){
      ggbApplet.setVisible( label, true );
    }
  }
  ggbApplet.refreshViews();
  processingMsg = false;
};

ggbEventHandlers.geomoved = function(data){
  console.log('Notified that geoelm was moved ' + unescape(JSON.stringify(data)) );
  processingMsg = true;
  if( ggbApplet.getObjectType(data.label) === "text" ){
    console.log("Evalutaing full xml");
    ggbApplet.evalXML(unescape(data.value));  
  } else {
    ggbApplet.setCoords(data.label, data.xpos, data.ypos);
    ggbApplet.setValue(data.label, data.value);
  }
  processingMsg = false;
};

ggbEventHandlers.geoupdated = function(data){
  console.log('Notified that geoelm was updated ' +JSON.stringify(data));
  processingMsg = true;
  ggbApplet.evalXML(unescape(data.xml));
  ggbApplet.refreshViews();
  console.log("Done updating geoelm...");
  processingMsg = false;
};

ggbEventHandlers.groupupdate = function(data){
  console.log('Notified that a group was updated ' + data.updateList.length + ", " + JSON.stringify(data));
  processingMsg = true;
  for( var i=0; i<data.updateList.length; i++ ){
    ggbApplet.setCoords(data.updateList[i].label, data.updateList[i].x, data.updateList[i].y);
  }
  processingMsg = false;
};

ggbEventHandlers.elmdelete = function(data){
  console.log('Notified that geoelm was deleted ' +JSON.stringify(data));
  processingMsg = true;
  ggbApplet.deleteObject(data.label);
  processingMsg = false;
};

ggbEventHandlers.elmrename = function(data){
  console.log('Notified that geoelm was renamed ' +JSON.stringify(data));
  processingMsg = true;
  if( data.elmLabels ){
    // maintain compatability with the old way of renaming
    ggbApplet.renameObject(data.elmLabels[0], data.elmLabels[1]);
  } else {
    ggbApplet.renameObject(data.oldLabel, data.newLabel);
  }
  processingMsg = false;
};

ggbEventHandlers.pasteElms = function(data){
  console.log('Pasted elms: ' + data.pastedElmsXml);
  processingMsg = true;
  ggbApplet.evalXML(data.pastedElmsXml);
  ggbApplet.refreshViews();
  processingMsg = false;
};

ggbEventHandlers.updateView = function(data){
  // ignore old style view updates so old rooms continue to work
  if( data.xzero ){
    return;
  }
  //console.log('Update View: ' + JSON.stringify(data) );
  processingMsg = true;
  viewData = data;
  //ggbApplet.setCoordSystemWithZeroAndScale(data.xzero, data.yzero, data.xscale, data.yscale);
  var viewPropsString = ggbApplet.getViewProperties();
  var viewProps = JSON.parse( viewPropsString );

  // calculate the x dimensions
  var xHalfPlaneDistance = Math.round( (viewProps.width/data.xscale)/2 );
  var xmin = data.xCenter - xHalfPlaneDistance;
  var xmax = data.xCenter + xHalfPlaneDistance;
  
  // calculate the y dimensions
  var yHalfPlaneDistance = Math.round( (viewProps.height/data.yscale)/2 );
  var ymin = data.yCenter - yHalfPlaneDistance;
  var ymax = data.yCenter + yHalfPlaneDistance;

  console.log("Updating view.  xmin: " + xmin + ", xmax: " + xmax + ", ymin: " + ymin + ", ymax: " + ymax );
  console.log("Updating view.  xaxis: " + data.xaxis + ", yaxis: " + data.yaxis );

  ggbApplet.setCoordSystem( xmin, xmax, ymin, ymax );
  ggbApplet.setAxesVisible(data.xaxis, data.yaxis);
  ggbApplet.setGridVisible(data.grid);
  //ggbApplet.setPerspective( data.perspective );
  ggbApplet.refreshViews();
  processingMsg = false;
};

// The next three are for taking/releasing control of the tab
ggbEventHandlers.resourceGranted = function(userName){
  console.log('This tab, ' + tabId + ' is controlled by ' + userName );
  //$('body').append( $("<div class='overlay'>") );
  $('.geogebraweb').css('pointer-events', 'auto');

  // periodically check for changes in the ggb view so other clients can be synced up
  viewUpdateInterval = setInterval( function(){updateViewInfo();}, 500);
};

ggbEventHandlers.resourceReleased = function(userName){
  console.log('This tab, ' + tabId + ' released by ' + userName );
  $('.geogebraweb').css('pointer-events', 'none');

  // no need to check for view updates, since you don't have control anymore:
  clearInterval(viewUpdateInterval);
};

ggbEventHandlers.resourceUnavailable = function(userName){
  console.log("Resource request denied: " + tabId + " locked by user " + userName);
};

// TODO: what if they made changes after they lost the connection, but before the disconnect timeout?
// when they reconnect, their board will not be in sync!
ggbEventHandlers.disconnect = function(){
  console.log("Ggb client disconnected from server! Do I have control: " + $('.geogebraweb').css('pointer-events') );
  $('.geogebraweb').css('pointer-events', 'none');
};

ggbEventHandlers.historyLoaded = function(){
 console.log( "History Loaded..." );
 processingMsg = true;
 // TODO: fix geogbera so this isn't needed:
 // dumb hack needed beacuse points do not always show up in ggb after it reloads
  var labels = ggbApplet.getAllObjectNames();

  labels.forEach( function( label ){
    var type = ggbApplet.getObjectType( label );
    if( type === "point" ){
      if( ggbApplet.getVisible( label ) ){
        ggbApplet.setVisible( label, true );
      }
    }
  });
  processingMsg = false;
};

function updateViewInfo(){
  var viewPropsString = ggbApplet.getViewProperties();
  var viewProps = JSON.parse( viewPropsString );
  var xscale = Math.round( 1/viewProps.invXscale );
  var yscale = Math.round( 1/viewProps.invYscale );
  var width = viewProps.width;
  var height = viewProps.height;

  var xmin = viewProps.xMin;
  var ymin = viewProps.yMin;
  var xmax = Math.round( (width/xscale)  + viewProps.xMin );
  var ymax = Math.round( (height/yscale) + viewProps.yMin );

  var xCenter = ((xmax - xmin)/2) + xmin ;
  var yCenter = ((ymax - ymin)/2) + ymin ;

  var gridShown = ggbApplet.getGridVisible();
  var xAxisShown = ggbApplet.getVisible("xAxis", 1);
  var yAxisShown = ggbApplet.getVisible("yAxis", 1);

  //console.log("View settings xz, yz, xs, ys: " + xz + ", " + yz + ", " + xs + ", " + ys);
  
  //check if they all change, otherwise its just an update from opening a view
  // If all of the values changed since last time, update the other clients.
  if( (viewData.xCenter !== xCenter) || (viewData.yCenter !== yCenter) ||
      (viewData.xscale !== xscale) || (viewData.yscale !== yscale) ||
      (viewData.grid !== gridShown) || (viewData.xaxis !== xAxisShown) ||
      (viewData.yaxis !== yAxisShown) ){
    console.log("My view changed, old settings: " + JSON.stringify(viewData) );
    viewData.xCenter = xCenter;
    viewData.yCenter = yCenter;
    viewData.xscale = xscale;
    viewData.yscale = yscale;
    viewData.grid = gridShown;
    viewData.xaxis = xAxisShown;
    viewData.yaxis = yAxisShown;
    console.log("My view changed, new settings: " + JSON.stringify(viewData) );

    var logMsg = lastEventWasUpdateView ? null : "changed the view";

    sendAction('updateView', viewData, logMsg);
  }
}

}); // end of $(document).ready()

var dragTimeout = null;
var dragging = function( event ){
  pointerDragging = true;
};

var finalizeDrag = function(){
  console.log("drag timeout expires, now finalize it");
  pointerDragging = false;
  if( lastMove && lastMove.action === "groupupdate") {
    console.log("Sending final movement update for group move");
    var labels = "";
    lastMove.data.updateList.forEach(function(updateObj){
      labels += updateObj.label + " ";
    });
    sendAction(lastMove.action, lastMove.data, "moved a group of objects: " + labels);
  }

  // movingObjs is only used when dragging a dependent, moveable point
  for( var key in movingObjs ){
    if( movingObjs.hasOwnProperty( key ) ){
      console.log("Sending final movement individual update for " + key);
      console.log("Data: \n" + unescape(JSON.stringify(movingObjs[key].last)) );
      var type = ggbApplet.getObjectType(key);
      sendAction('geomoved', movingObjs[key].last, "moved " + type + " " + key);
    }
  }

  lastMove = null;
  movingObjs = {};
  movingIndependent = false;
};

function countMovingObjs(){
  var count = 0;
  for( var key in movingObjs ){
    if( movingObjs.hasOwnProperty(key) ){
      count++;
    }
  }

  return count;
}

// hook to add app specific stuff to the chat pane
function customizeChatPane(){
  var resetGgb = $("<button></button>").text("Reset the Construction").attr("id","resetGgb");
  resetGgb.click( function(){
    console.log("Reseting the board");
    // set processing to true so ggbOnInit won't ask the server for all the events again.
    processingMsg = true;
    ggbApplet.reset();
    processingMsg = false;
    // call the clear listner now that processingMsg = false, so it will broadcast the event.
    clearListener();
  });

  $("#chatPane").append(resetGgb);
}

function sendAction( eventName, dataObj, log ){
  // get ggb tool awareness info
  var tool = $(".toolbar_button[isselected='true']");
  var toolId = parseInt(tool.attr('mode') );
  var toolName = ggbApplet.getToolName(toolId);
  var toolIconSrc = $(tool.children('img')[0]).attr('src');

  // used to prevent view updates from spamming the chat with notifications
  lastEventWasUpdateView = eventName === 'updateView' ? true : false;

  // send the message
  console.log("Sending action " + eventName + " for tab " + tabId + " tool: " + toolName + " log msg:\n" + log);
  socket.emit('ccAction', eventName, tabId,  dataObj, log, toolName, toolIconSrc);
}

var ggbApplet = document.ggbApplet;
function ggbOnInit() {
console.log("ARMdebug: INITIALIZING GGB APPLET");

if( !clientIf.ggbClients ){
  clientIf.ggbClients = [];
}
clientIf.ggbClients.push({'tab': tabId, 'ggb': ggbApplet});

ggbApplet.debug("ggbOnInit");
//ggbApplet.setUndoActive(false);
ggbApplet.registerAddListener("newObjectListener");
ggbApplet.registerRenameListener("renameListener");
ggbApplet.registerRemoveListener("removeListener");
ggbApplet.registerUpdateListener("updateListener");
ggbApplet.registerClearListener("clearListener");
ggbApplet.registerClientListener("clientListener");
ggbApplet.registerStoreUndoListener("storeUndoListener");

// initialze the tab so user does not have ggb control
$('.geogebraweb').css('pointer-events', 'none');

 // initialize view data so it can be used when user has control
 var viewPropsString = ggbApplet.getViewProperties();
 var viewProps = JSON.parse( viewPropsString );
 // TODO put this to use on perspectiveChanged notifications
 //viewData.perspective = ggbApplet.getPerspectiveXML();

 var xscale = Math.round( 1/viewProps.invXscale );
 var yscale = Math.round( 1/viewProps.invYscale );
 var width = viewProps.width;
 var height = viewProps.height;
 var xmin = viewProps.xMin;
 var ymin = viewProps.yMin;
 var xmax = Math.round( (width/xscale)  + viewProps.xMin );
 var ymax = Math.round( (height/yscale) + viewProps.yMin );

 var xCenter = ((xmax - xmin)/2) + xmin ;
 var yCenter = ((ymax - ymin)/2) + ymin ;

 viewData.xCenter = xCenter;
 viewData.yCenter = yCenter;
 viewData.xscale = xscale;
 viewData.yscale = yscale;

 viewData.grid = ggbApplet.getGridVisible();
 viewData.xaxis = ggbApplet.getVisible("xAxis", 1);
 viewData.yaxis = ggbApplet.getVisible("yAxis", 1);

 $('canvas').bind("mousemove touchmove", dragging);
 $('#ggbLoadingOverlay').remove();

 // see the explanation in collaborateChat.js where the chatEntry is inserted
 $(document).mouseup( function( e ){
   if( e.target !== clientIf['mouseDownElm'] ){
     if( clientIf['mouseDownElm'] ){
       clientIf['mouseDownElm'].focus();
     }
   }
 });

 // ggbOnInit gets called any time the applet is loaded or reset,or if a file is loaded
 // but we only want to send the ready message to the server after the initial load.
 // If the client is not processing a message, then this ggbOnInit() call  must be the initial load.
 if( !processingMsg ){
   console.log("Setting ccClinet ready to true");
   clientIf.registerEventHandlers( tabId, ggbEventHandlers );

   clientIf.setInitReady(true, tabId);
 }

  console.log("ARMdebug: DONE INITIALIZING GGB APPLET");
} 
// Geogebra Listeners **********************
function storeUndoListener(obj){
  console.log("Store Undo: " + JSON.stringify(obj) );
}

function newObjectListener (obj) {
  // ignore adds that are part of a polygon, polyadded will handle all that
  if( processingMsg || addingPoly ) return;

  console.log("add obj: " + obj + "\n" + ggbApplet.getXML(obj) );
  if( ggbApplet.isIndependent(obj) ){
    console.log("Element " + obj + " is an independant object");
    var elmXml = ggbApplet.getXML(obj);
  }  else {
    var elmXml = ggbApplet.getAlgorithmXML(obj);
  }

  var type = ggbApplet.getObjectType(obj);
  var log = "added " + type + " " + obj;

  sendAction('elmadd', {xml: escape(elmXml)}, log);
}

function clearListener(){
  if( processingMsg ) return;

  console.log("GGB cleared");
  sendAction('clearggb',{}, "cleared the board");
}

function renameListener( oldLabel, newLabel ){
  if( processingMsg ) return;
  // Todo: group cascading rename events with the new renameComplete api
  console.log( "rename: " + oldLabel + " to " + newLabel );
  var type = ggbApplet.getObjectType( newLabel );
  var log = "renamed " + type + " " + oldLabel + " to " + newLabel; 
  sendAction('elmrename', {'oldLabel': oldLabel, 'newLabel': newLabel}, log);
}

function removeListener( obj ){
  if( processingMsg ) return;

  console.log("remove obj: " + obj);
  if( addingPoly ){
    console.log("But adding poly, so just wait till its finished");
    return;
  }
  var type = ggbApplet.getObjectType(obj);
  var log = "deleted " + type + " " + obj;
  sendAction('elmdelete', {label: obj}, log);
}

/*
  updatingObjs indicates that a group update is happening, so ignore the individual updates.
*/
function updateListener( obj ){
  if( processingMsg || updatingObjs || addingPoly) return;

  var objType = ggbApplet.getObjectType(obj);
  console.log("Updating Object " + obj + " of type = " + objType );                               
  var xml = ggbApplet.getAlgorithmXML( obj );
  //console.log( "update xml:\n" + xml );
  if( pointerDragging ) {
    //console.log(obj + " inid: " + ggbApplet.isIndependent(obj) );
    //console.log(obj + " type: " + objType );
    //console.log(obj + " moveable: " + ggbApplet.isMoveable(obj) );
    if( (ggbApplet.isIndependent(obj)) || (objType === "numeric") || (ggbApplet.isMoveable(obj)) ){
      // if we are already moving an independent object and this isn't it, then it's a dependent
      // object that we don't have to track
      if( movingIndependent && !ggbApplet.isIndependent(obj) ){
        return;
      }

      // when dragging a point with dependencies, we will get updates for those dependencies too.
      // The 'if' above will filter out the dependent objects, except for moveable dependent points.
      // Those updates need to be sent if that is the only point being moved, but they do not need to be
      // sent if its being moved because an independent point is moving.  Since ther is no ggbWeb api for
      // getting the selected object, we just have to record how many objects are being updated.
      if( !movingObjs[obj] ){ 
        console.log("Adding object to moving objs: " + obj );
        movingObjs[obj] = {updateCount: 0, last: null }; 
      }

      if( ggbApplet.isIndependent(obj) ){
        movingIndependent = true;
      }

      console.log("Dragging object: " + obj);
      var x = ggbApplet.getXcoord(obj);
      var y = ggbApplet.getYcoord(obj);
      
      // For anything not a point or vector, we will need another way to
      // update it when moved, becuase they don't use the xpos,ypos attributes.
      // For text boxes, the full xml works.  For sliders even that doesn't work.
      // At some point, new apis will be needed to geogebra to deal with it.
      var val;
      if( objType === "text"){
        val = escape( ggbApplet.getXML(obj) );
      } else {
        val = ggbApplet.getValue(obj);
      }

      var move = {label: obj, xpos: x, ypos: y, value: val};
      movingObjs[obj].updateCount++;
      movingObjs[obj].last = move;
      console.log("Throtteling " + obj + ", num of updates: " + movingObjs[obj].updateCount );
      // Will only get last update for one geo this way!
      throttleMoveUpdates('geomoved', move, movingObjs[obj].updateCount);
    } else {
      // it's not an indepenedent or moveable, but if its the only thing, send it through
      //console.log("Not indi, number, or moveable, moving objs: " + movingObjs.length);
      if( countMovingObjs() === 0 ){
        console.log("No other objects updating, so updating: " + obj );
        updateOneElm( obj );
      }
    }
  } else {
    updateOneElm( obj );
  }
}

function updateOneElm( obj ){
  console.log("Non move update for object: " + obj);
  var elmXml = ggbApplet.getXML(obj);
  console.log("xml:\n" + elmXml);

  var type = ggbApplet.getObjectType(obj);
  var log = "updated " + type + " " + obj;
  sendAction('geoupdated', {label: obj, xml: elmXml}, log);
}

function clientListener( obj ){
  var event = obj.shift();
  console.log("got client event message: " + event);
  for( var i=0; i<obj.length; i++ ){
    console.log(obj[i]);
  }
  
  if( obj.length === 1 && obj[0] === ""){
        console.log("no arguments for " + event );
        try {
  	  window[event]();
        } catch (e) {
          console.log(" No handler for " + event );
        }
  }
  else{
     // forward the objects, but not the event name
     console.log(obj.length + " arguments for " + event + ": " + JSON.stringify(obj) );
     try {
        window[event]( obj );
     } catch (e) {
       console.log(" No handler for " + event );
     }

  }
}

// Handle specific ViewClient events from ggb
// These functions must be named after the value of the enums in EventTypes.java
// in order be called automatically from the clientListner function above.
function addPolygon(){
    console.log("Add polygon called");
    addingPoly = true;
}

function addPolygonComplete( labels ){
  if( processingMsg ) return;

  console.log("Add polygon complete called");
  var polyXml = ggbApplet.getAlgorithmXML(labels[0]);
  //var infoSection = document.getElementById("constructionInfo");
  //infoSection.appendChild( document.createTextNode(polyXml) );
  sendAction('polyadd',  {xml: polyXml}, "added polygon " + labels[0] );
  addingPoly = false;
}

function renameComplete(){
   console.log("Rename complete called");
}

function movingGeos(){
  console.log("Moving geos called");
  updatingObjs = true;
}

function movedGeos( labels ){
  console.log("Update geos called");
  var geoUpdates = [];
  for( var i in labels ){
    console.log("Update: " + labels[i]);
    var geoUpdate = {};
    geoUpdate.label = labels[i];
    geoUpdate.x = ggbApplet.getXcoord(labels[i]);
    geoUpdate.y = ggbApplet.getYcoord(labels[i]);
    // add it to the list
    geoUpdates[geoUpdates.length] = geoUpdate;
  }
  moveUpdates++;
  console.log("Move updates: " + moveUpdates );
  throttleMoveUpdates('groupupdate', {updateList: geoUpdates}, moveUpdates);
  updatingObjs = false;
}

function throttleMoveUpdates( actionType, moveData, updates ){
  lastMove = {action: actionType, data: moveData};

  clearTimeout( dragTimeout );
  dragTimeout = setTimeout( finalizeDrag, 200);

  if( updates % 10 === 0 ){
    console.log("Sending 10th movement update " + JSON.stringify(moveData) );
    // don't send logs with intermediate movements, wait for the last one on mouseup
    sendAction(lastMove.action, lastMove.data, null);
  }
}

function pasteElms( pasteXml ){
  console.log("Paste elms called");
  processingMsg = true;
  ggbApplet.registerRenameListener("pasteRenameListener");
  ggbApplet.pasteXml = pasteXml[1];
}

// This is only used to listen to rename events during a copy and paste.
// this will keep all the "CLIPBOARDMagicString" stuff out of the system
function pasteRenameListener( oldLabel, newLabel ){
  // obj[0] is the old label, obj[1] is the new label
  console.log("Paste replacing " + oldLabel + " with " + newLabel);
  var re = new RegExp(oldLabel, 'g');
  ggbApplet.pasteXml = ggbApplet.pasteXml.replace( re, newLabel );
}

function pasteElmsComplete( labels ){
  console.log("Paste elms complete called: " + JSON.stringify(labels));
  var log = "pasted elements ";
  labels.forEach(function(label){
    log = log + " " + label;
  });
  sendAction('pasteElms', {pastedElmsXml: ggbApplet.pasteXml}, log);
  ggbApplet.unregisterRenameListener("pasteRenameListener");
  processingMsg = false;
}

function deleteGeos( labels ){
  console.log("delete geos called");
  labels.forEach( function( label ){
    console.log("delete " + label);
  });
}

function updateStyle( label ){
  if( processingMsg ) return;

  var objToUpdate = label[0];

  selectedElms.forEach( function( selectedElm ){
    if( selectedElm === objToUpdate ){
      updateOneElm( objToUpdate );
    }
  });
}

function select( label ){
  console.log("Select " + label );
  selectedElms.push( label[0] );  
}

function deselect(){
  selectedElms = [];
}
