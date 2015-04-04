// include dependencies
//var RosConnection = require('./RosConnection');
//var GUI = require('./Gui');
//var Storage = require('./Storage');

// wait until the dom is ready
$(document).ready(function() {
	// General utilities
	var gui = new GUI();
	var ros = new RosConnection(gui);
	ros.connect();

	//var storage = new Storage(gui);

	//gui.bindConnect(ros, storage);
	gui.bindRemote(ros/*, storage*/);
});


/**
* Grants access to the robot by etablishing a ROS connection
* @constructor
* @param {GUI} gui GUI instance
*/
function RosConnection(gui) {
	/** Ros instance */
	this.ros = null;
	/** GUI instance */
	this.gui = gui;
	/** Topic to send movement orders */
	this.moveTopic = null;
	/** Topic to receive ultrasound data */
	//  this.ultrasoundTopic = null;
	/** IP and port to connect to */
	this.ip = '';
}

/**
* Connect to a given IP using a WebSocket
* @param {string} ip must define the port as well: 127.0.0.1:9090
*/
RosConnection.connect = function connect(/*ip*/) {
	//this.ip = ip;
	this.ros = new ROSLIB.Ros({
		//url: 'ws://' + ip
		url : 'ws://192.168.0.12:9090'
	});
	this.ros.on('error', function(error) {
		console.log('Error connecting to websocket server: ', error);
	});

	this.ros.on('close', function() {
		console.log('Connection to websocket server closed.');
	});

	this.ros.on('connection', function() {
		console.log('Connected to websocket server.');
	});
	this._createEvents();
	this._createTopics();
};

/**
* Create events for a ros connection. This must be called just after
* calling connect
* @private
*/
/*RosConnection.prototype._createEvents = function createEvents() {
var me = this;
this.ros.on('connection', function(error) {
$.bootstrapGrowl('Connected to robot at ' + error.currentTarget.url, {
type: 'success',
width: 'auto'
});
console.log('Connected to websocket server.');
//me.gui.resetConnectForm();
//me.gui.hideConnectForm();
me.gui.showRemote();

// change img src
// XXX PORT need to be dynamically changed
//me.gui.remote.img.prop('src', '//' + me.ip.replace('9090', '3002') + me.gui.remote.img.attr('data-uri'));
});
this.ros.on('error', function(error) {
$.bootstrapGrowl('Error connecting to robot at ' + error.currentTarget.url, {
type: 'danger',
width: 'auto'
});
console.log('Error connecting to websocket server: ', error);
//me.gui.resetConnectForm();
// XXX Testing invert comments when done
//me.gui.resetConnectForm();
//me.gui.hideConnectForm();
//me.gui.showRemote();
//me.gui.remote.img.prop('src', '//' + me.ip.replace('9090', '3002') + me.gui.remote.img.attr('data-uri'));
});

this.ros.on('close', function() {
// TODO call the resets on GUI
console.log('ROS ws closed.');
});
};*/

/**
* Create topics once the ros connection is etablished. This allows
* publishing messages.
* @private
*/
RosConnection.._createTopics = function createTopics() {
	this.moveTopic = new ROSLIB.Topic({
		ros: this.ros,
		name : 'turtle1/cmd_vel',
		messageType : 'geometry_msgs/Twist'
	});
};

/**
* Send a message to move the robot
* @param {Number} dir Value between 0 and 4. 4 = Stop
*/
RosConnection.moveRobot = function moveRobot(dir,speed1,turn) {
	//{"top": 0, "bottom": 1, "left": 2, "right": 3, "s": 4}
	if (dir == 0)
		agular_val = 0.0;
	else if (dir == 1)
		angular_val = 3.0;
	else if (dir == 2)
		angular_val = 0.75;
	else if (dir == 3) 
		angular_val = -0.75;
	else if (dir == 4)
		angular_val = 0.0;
	var msg = new ROSLIB.Message({
		linear : {
			x : 2.0,
			y : 0.0,
			z : 0.0
		},
		angular : {
			x : 0.0,
			y : 0.0,
			z : angular_val
		}
	});
	//Publish on Topic
	console.log('Sending move command with dir ' + dir);
	this.moveTopic.publish(msg);

};
	//RosConnection.prototype.ultrasoundRobot = function ultrasoundRobot() {
		//  var msg = new ROSLIB.Message({

			//  });
			//};


			/**
			* Gives access to buttons and other DOM elements it also
			* handle some events binding between buttons and calls. This class must be
			* called once the DOM is ready.
			* @constructor
			*/
			function GUI() {
				var me = this;
				// store reference to buttons and stuff
				/** Object storing references to the connect formulary DOM elements*/
				/*  this.connect = {
					btn: $('#connect-btn'),
					form: $('#connect-form'),
					ip: $('#connect-ip'),
					div: $('#connect'),
					remember: $('#connect-remember'),
					};*/

					/** Object storing references to the remote screen DOM elements */
					this.remote = {
						div: $('#remote'),
						left: $('#remote-left'),
						right: $('#remote-right'),
						up: $('#remote-up'),
						down: $('#remote-down'),
						move: $('#remote-controls-mouse'),
						stop: $('#remote-stop'),
						img: $('#remote-img'),
						visible: false
					};

					/**
					* KeyCodes for better readability
					*/
					this.keys = {
						SPACE: 32,
						LEFT: 37,
						UP: 38,
						RIGHT: 39,
						DOWN: 40,
						S: 83
					};
			}

			/**
			* Reset the connect formulary
			*/
			/*GUI.prototype.resetConnectForm = function reset() {
				this.connect.ip.prop('disabled', false);
				this.connect.remember.prop('disabled', false);
				this.connect.btn.button('reset');
				};*/
				/**
				* Hides the connect formulary
				*/
				/*GUI.prototype.hideConnectForm = function hide() {
					this.connect.div.slideUp(500);
					};*/

					/**
					* Shows the remote screen view
					*/
					/*GUI.prototype.showRemote = function show() {
						this.remote.div.slideDown(500);
						this.remote.visible = true;
						};*/

						/**
						* Bind events for the connect formulary
						* @param {RosConnection} rc RosConnection instance
						* @param {Storage} sto Storage instance
						*/
						/*GUI.prototype.bindConnect = function bindConnect(rc, sto) {
							// load form data if available
							sto.loadIP();
							var me = this;
							this.connect.form.submit(function(event) {
							event.preventDefault();
							var ip = me.connect.ip.val() || me.connect.ip.attr('placeholder');
							if (utils.isIPValid(ip)) {
							sto.saveIP();
							me.connect.ip.prop('disabled', true);
							me.connect.remember.prop('disabled', true);
							me.connect.btn.button('loading');
							me.connect.btn.text('Connecting');
							rc.connect(ip);
							} else {
							$.bootstrapGrowl('IP is invalid! It should be like 127.0.0.1:9090. Don\'t forget about the port!', {
							type: 'danger',
							width: 'auto'
							});
							}
							});
							};*/

							/**
							* Binds events for the remote screen
							* @param {RosConnection} rc RosConnection instance
							* @param {Storage} sto Storage instance
							*/
							GUI.prototype.bindRemote = function bindRemote(rc, sto) {
								// Add keyboard events
								var me = this;
								var direction = {};
								direction[keys.UP] = 0;
								direction[keys.DOWN] = 1;
								direction[keys.LEFT] = 2;
								direction[keys.RIGHT] = 3;
								direction[keys.SPACE] = 4;
								direction[keys.S] = 4;
								direction[0] = 5;

								var but = {};
								but[keys.UP] = this.remote.up;
								but[keys.DOWN] = this.remote.down;
								but[keys.LEFT] = this.remote.left;
								but[keys.RIGHT] = this.remote.right;
								but[keys.SPACE] = this.remote.stop;
								but[keys.S] = this.remote.stop;
								but[0] = this.remote.move;

								// Give the key pressed. It must be in directions array
								var lastPressed = this.remote.stop; // only one action at a time
								var clickButton = function clickButton(key) {
									console.log("onKeyDown ---> keyCode = " + key);
									if (lastPressed) {
										lastPressed.removeClass('btn-primary');
										if (lastPressed === me.remote.stop) {
											lastPressed.addClass('btn-warning');
										} else {
											lastPressed.addClass('btn-default');
										}
									}
									lastPressed = but[key];
									lastPressed.addClass('btn-primary');
									if (lastPressed !== me.remote.stop) {
										lastPressed.removeClass('btn-default');
									} else {
										lastPressed.removeClass('btn-warning');
									}
									//send command with direction,speed1,turn
									rc.moveRobot(direction[key],0,0);
								};
								// bind keyboard
								document.onkeydown = function keyDown(e) {
									if (!me.remote.move.visible) {
										return;
									}
									e = e || window.event;

									if (e.keyCode in direction) {
										e.preventDefault();
										clickButton(e.keyCode);
									}
								};

								// bind buttons clicks as well
								this.remote.left.click(clickButton.bind(null, keys.LEFT));
								this.remote.right.click(clickButton.bind(null, keys.RIGHT));
								this.remote.up.click(clickButton.bind(null, keys.UP));
								this.remote.down.click(clickButton.bind(null, keys.DOWN));
								this.remote.stop.click(clickButton.bind(null, keys.S));

								// Control with mouse motion
								/*var mouseMotionCtrl = function mouseMotionCtrl(event) {
									var x0 = event.x
									var y0 = event.y*/

									/*  document.onmousemove = function (event) {
										onselectstart = 'return false';
										dx = (x0 - event.x);
										dy = (y0 - event.y);
										// distance when speed max is reached 
										normX = 200;
										rx1 = (dx + (normX/2))/normX;
										rx2 = 1 - rx1;

										normY = 200;
										dy = (y0-event.y)*normY/255;
										v = dy+128;

										//process speed with ponderation
										speed1 = 2 * v * rx1;
										speed2 = 2 * v * rx2;
										console.log("Debug C dx:" + dx + " dy:" + dy + " rx1:" + rx1 + " rx2:" + rx2 + " speed1:" + speed1 + " speed2:"+speed2);
										if(speed1 > 255) { speed1 = 255;}
										if(speed1 < 0) {speed1 = 0;}
										if(speed2 > 255) {speed2 = 255;}
										if(speed2 < 0) {speed2 = 0;}
										rc.moveRobot(5,Math.round(speed1),Math.round(speed2));
										}
										this.onmouseup = function () {
										document.onmousemove = null;
										rc.moveRobot(4,0,0);
										}
										}
										// bind mouse
										document.onmousedown = function(e) {
										console.log("debug B");
										if (!me.remote.visible) {
										return;
										}
										e = e || window.event;
										mouseMotionCtrl(e);
										console.log('debig');
										};*/
										/*
										//GAMEPAD
										var haveEvents = 'GamepadEvent' in window;
										var controllers = {};
										var rAF = window.mozRequestAnimationFrame 



										function connecthandler(e){
										//addgamepad(e.gamepad);
										console.log("Controleur id:%d connecte:%s. %d boutons, %d axes.",
										e.gamepad.index,
										e.gamepad.id,
										e.gamepad.buttons.length,
										e.gamepad.axes.length);
										}

										function disconnecthandler(e){
										removegamepad(e.gamepad);
										}

										function scangamepads(){
										var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
										for (var i = 0; i < gamepads.length; i++) {
										} 
										}


										//Remote Control
										window.addEventListener("gamepadconnected",connecthandler);
										window.addEventListener("gamepaddisconnected",disconnecthandler);
										if(!haveEvents) {
										setInterval(scangamepads,500);
										}	
										*/
							};

