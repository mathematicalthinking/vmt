// This file is for rendering the geogebra Workspace

//REQUIRE MODULES
const passport = require('passport');
const express = require('express')
const router = express.Router()


// function loadGgbMw( req, res, next ){
//   console.log("Room id: " + req.params.roomId + ", tab id: " + req.query.tabId );
//   dbCli.getFileForTab(req.query.tabId, function(tabFileData){
//     req.tabFileData = tabFileData;
//     next();
//   });
// }


router.get('/ggb/:roomId', (req, res, next) => {
  console.log("are we even getting here")
   var roomId = "room" + req.params.roomId;
   console.log("Got request for ggb multi for room: " + req.params.roomId );
   res.render('ggbWorksheet', {roomIdValue: roomId, username: req.session.username, hostValue: nconf.get('server').host, portValue: nconf.get('server').port, tabId: req.query.tabId, tabFile: req.tabFileData});
});

module.exports = router;
