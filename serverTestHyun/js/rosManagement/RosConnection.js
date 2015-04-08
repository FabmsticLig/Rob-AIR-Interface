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
RosConnection.prototype.connect = function connect(/*ip*/) {
	//this.ip = ip;
	this.ros = new ROSLIB.Ros({
		//url: 'ws://' + ip
		url : 'ws://192.168.0.12:9090'
	});
	ros.on('error', function(error) {
		console.log('Error connecting to websocket server: ', error);
	});

	ros.on('close', function() {
		console.log('Connection to websocket server closed.');
	});

	ros.on('connection', function() {
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
RosConnection.prototype._createTopics = function createTopics() {
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
RosConnection.prototype.moveRobot = function moveRobot(dir,speed1,turn) {
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

		//Publish on Topic
		console.log('Sending move command with dir ' + dir);
		this.moveTopic.publish(msg);
	};

	//RosConnection.prototype.ultrasoundRobot = function ultrasoundRobot() {
		//  var msg = new ROSLIB.Message({

			//  });
			//};

			module.exports = RosConnection;
