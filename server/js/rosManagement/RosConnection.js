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
RosConnection.prototype.connect = function connect(ip) {
  this.ip = ip;
  this.ros = new ROSLIB.Ros({
    url: 'ws://' + ip
  });
  this._createEvents();
  this._createTopics();
};

/**
 * Create events for a ros connection. This must be called just after
 * calling connect
 * @private
 */
RosConnection.prototype._createEvents = function createEvents() {
  var me = this;
  this.ros.on('connection', function(error) {
    $.bootstrapGrowl('Connected to robot at ' + error.currentTarget.url, {
      type: 'success',
      width: 'auto'
    });
    console.log('Connected to websocket server.');
    me.gui.resetConnectForm();
    me.gui.hideConnectForm();
    me.gui.showRemote();

    // change img src
    // XXX PORT need to be dynamically changed
    me.gui.remote.img.prop('src', '//' + me.ip.replace('9090', '3002') + me.gui.remote.img.attr('data-uri'));
  });
  this.ros.on('error', function(error) {
    $.bootstrapGrowl('Error connecting to robot at ' + error.currentTarget.url, {
      type: 'danger',
      width: 'auto'
    });
    console.log('Error connecting to websocket server: ', error);
    me.gui.resetConnectForm();
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
};

/**
 * Create topics once the ros connection is etablished. This allows
 * publishing messages.
 * @private
 */
RosConnection.prototype._createTopics = function createTopics() {
  this.moveTopic = new ROSLIB.Topic({
    ros: this.ros,
    //name : '/cmd_vel',
    name: '/cmd',
    messageType: 'robair_demo/Command' //meter un tipo de mensaje valido en el dir '/msg' del package
      //messageType : 'geometry_msgs/Twist'
  });
  //this.ultrasoundTopic = new ROSLIB.Topic({
  //  ros: this.ros,
  //  name: '/sensor/ultrasound_obstacles',
  //  messageType:'std_msgs/Sting'
  //});
};

/**
 * Send a message to move the robot
 * @param {Number} dir Value between 0 and 4. 4 = Stop
 */
RosConnection.prototype.moveRobot = function moveRobot(dir,speed1,turn) {
  var msg = new ROSLIB.Message({
    move: dir, //{"top": 0, "bottom": 1, "left": 2, "right": 3, "s": 4}
    speed1: speed1,
    turn: turn
  });

  //Publish on Topic
  console.log('Sending move command with dir ' + dir);
  this.moveTopic.publish(msg);
};

//RosConnection.prototype.ultrasoundRobot = function ultrasoundRobot() {
//  var msg = new ROSLIB.Message({
    
//  });
//};

module.exports = RosConnection;
