// include dependencies
var RosConnection = require('./RosConnection');
var GUI = require('./Gui');
var Storage = require('./Storage');

// wait until the dom is ready
$(document).ready(function() {
  // General utilities
  var gui = new GUI();
  var ros = new RosConnection(gui);
  var storage = new Storage(gui);

  gui.bindConnect(ros, storage);
  gui.bindRemote(ros, storage);
});
