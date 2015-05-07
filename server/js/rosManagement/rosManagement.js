window.onload=function(){

	//==========================
	//==== Connecting to ROS====
	//==========================
	var ros = new ROSLIB.Ros({
		//url : 'ws://localhost:9090'
		url : 'ws://192.168.1.2:9090'
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

	//========================================
	//============Publisher===================
	//========================================

	//Topics

	//Gaze_direction
	var topic_end_line_obstacles = new ROSLIB.Topic({
		ros : ros,
		name : '/gaze_direction',
		messageType : 'std_msgs/Byte'
	});

	//Command_motor
	var topic_cmd = new ROSLIB.Topic({
		ros : ros,
		name : '/command_motor',
		messageType : 'MotorCmd'
	});

	//Angle_position
	var topic_angle_position = new ROSLIB.Topic({
		ros : ros,
		name : '/angle_position',
		messageType : 'std_msgs/Byte'
	});

	//Publications

	//Gaze_direction
	//TODO
    var gazeValue = 0;

        var setGazeDirection = function(key){

            if(key ==='Q' || key  ==='q')
            {
                    if(gazeValue !== -127){
                        gazeValue --;
                        console.log("Turn sight to Left");
                    }
                    else{
                        console.log("Max left position reached");
                    }

            }
            else
            {
                    if(gazeValue !== 127){
                         gazeValue ++; 
                         console.log("Turn sight to Right");
                    }
                    else{
                        console.log("Max right position reached");
                    }

            }
            console.log(gazeValue);
            var gaze = new ROSLIB.message( {
            data : gazeValue
        });

};
    
	//Angle_position
	//TODO	

	//Command_motor

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

	var but = {};
	but[38] = this.remote.up;
	but[40] = this.remote.down;
	but[37] = this.remote.left;
	but[39] = this.remote.right;
	but[83] = this.remote.stop;
	var lastPressed = this.remote.stop; // only one action at a time
	var clickButton = function clickButton(key) { var speed1, speed2;
		console.log("onKeyDown ---> keyCode = " + key);
		if (lastPressed) {
			lastPressed.removeClass('btn-primary');
			if (lastPressed === this.remote.stop) {
				lastPressed.addClass('btn-warning');
			} else {
				lastPressed.addClass('btn-default');
			}
		}
		lastPressed = but[key];
		lastPressed.addClass('btn-primary');
		if (lastPressed !== this.remote.stop) {
			lastPressed.removeClass('btn-default');
		} else {
			lastPressed.removeClass('btn-warning');
		}
		if (key == '38') {
			// up arrow
			console.log("up Arrow");
			speed1 = 255;
			speed2 = 255;
		}else if (key== '40') {
			// down arrow
			console.log("down Arrow");
			speed1 = 0;
			speed2 = 0;
		}else if (key == '37') {
			// left arrow
			console.log("left Arrow");
			speed1 = 255;
			speed2 = 128;
		}else if (key == '39') {
			// right arrow
			console.log("right Arrow");
			speed1 = 128;
			speed2 = 255;
		}else if (key == '83') {
			// 's' key -> stop
			console.log("'s' key (Stop)");
			speed1 = 128;
			speed2 = 128;
		}
		var msg = new ROSLIB.Message({
			speed1 : speed1,
			speed2 : speed2
			//mode : 1			
		});
		//Publish on Topic
		topic_cmd.publish(msg);
		console.log("published " + key);
	};
	// bind keyboard
	document.addEventListener('keydown', function(e){
		e = e || window.event;

		var keyCode = e.keyCode;
		if (keyCode == '38' || keyCode == '40' || keyCode == '37'
		|| keyCode == '39' || keyCode == '83'){
			e.preventDefault();
			clickButton(e.keyCode);
		}
        if( keyCode == 'Q' || keyCode == 'q' 
            || keyCode == 'd' || keyCode =='D'){
            setGazeDirection(keyCode);
        }
	}, false);

	// bind buttons clicks as well
	this.remote.left.click(clickButton.bind(null, 37));
	this.remote.right.click(clickButton.bind(null, 39));
	this.remote.up.click(clickButton.bind(null, 38));
	this.remote.down.click(clickButton.bind(null, 40));
	this.remote.stop.click(clickButton.bind(null, 83));


	//==============================================
	//=============GAMEPAD CONTROL=================
	//==============================================

	//Tested with a xbox pad
	var start;
	var rAF = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
	window.requestAnimationFrame;

	var rAFStop = window.mozCancelRequestAnimationFrame ||	window.webkitCancelRequestAnimationFrame ||
	window.cancelRequestAnimationFrame;

	window.addEventListener("gamepadconnected", function() {
		var gp = navigator.getGamepads()[0];
		console.log("Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
		gameLoop();
	});

	window.addEventListener("gamepaddisconnected", function() {
		console.log("Waiting for gamepad.");
		rAFStop(start);
	});

	if(!('GamepadEvent' in window)) {
		// No gamepad events available, poll instead.
		var interval = setInterval(pollGamepads, 500);
	}

	function pollGamepads() {
		var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
		for (var i = 0; i < gamepads.length; i++) {
			var gp = gamepads[i];
			if(gp) {
				console.log("Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
				gameLoop();
				clearInterval(interval);
			}
		}
	}


	function gameLoop() {
		var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
		if (!gamepads)
			return;
		var gp = gamepads[0];
		var x = gp.axes[0];
		var speed = gp.buttons[0].value;
		var isPressed = gp.buttons[0].pressed;
		if (!isPressed) { 
			var start = rAF(gameLoop);
			return;
		}

		var angular_val = -x;


		var msg = new ROSLIB.Message({
			linear : {
				x : speed,
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
		topic_cmd.publish(msg);

		var start = rAF(gameLoop);
	};

	//==================================
	//===========Subscriber==============
	//==================================

	//Topic for collision
	var topic_collision = new ROSLIB.Topic({
		ros : ros,
		name : '/collision_event',
		messageType : 'std_msgs/Bool'
	});

	topic_collision.subscribe(function(message) {
		console.log('Received message on ' + topic_collision.name + ': ' + message.collision);
		//get indication_board div and append the message only if there is a collision
		if(message.data) {
			$('#indication_board').append("<p> Collision détectée </p>");
		}
		//scroll le div à la fin 
		$('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight},1000);
	});


	//Topic for hug event
	var topic_hug_event = new ROSLIB.Topic({
		ros : ros,
		name : '/social_touch_event',
		messageType : 'std_msgs/Bool'
	});
	

		var clignotement = function(){
			if ( $("#hug").css('color') == 'rgb(255, 0, 0)') {
				console.log($("#hug").css('color'));
				
				$("#hug").css('color','rgb(0,0,0)');
				
				console.log("red -> black");
				console.log($("#hug").css('color'));
		    }
			else{
				console.log($("#hug").css('color'));
				
				$("#hug").css('color','rgb(255,0,0)');
				
				console.log("black -> red");
				console.log($("#hug").css('color'));
			}
		};
		

	topic_hug_event.subscribe(function(message) {
		//console.log('Received message on' + topic_panic_event.name);
		if(message.data) {
			periode = setInterval(clignotement, 1000);
			setTimeout(function(){clearInterval(periode)},4000);
		}
	});

	//Topic for panic event
	var topic_panic_event = new ROSLIB.Topic({
		ros : ros,
		name : '/panic_event',
		messageType : 'std_msgs/Bool'
	});

	topic_panic_event.subscribe(function(message) {
		//console.log('Received message on' + topic_panic_event.name);
		if(message.data) {
			$('#indication_board').append("<p> \"Panic button\" activé </p>");
			//scroll le div à la fin 
			$('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight},1000);
		}
		else {
			$('#indication_board').append("Nothing");
		}
	});

	//Topic for proximity obstacles
	var topic_proximity_obstacles = new ROSLIB.Topic({
		ros : ros,
		name : '/proximity_obstacles',
		messageType : 'std_msgs/Int32MultiArray'
	});

	topic_proximity_obstacles.subscribe(function(message) {
		console.log('Received message on' + topic_proximity_obstacles.name);
		for (var iter = 0; i < 8; iter++){
			//TODO  palliers  pb à partir de 20 cm
			if(message.data[iter] < 10){
				$('#indication_board').append("<p> Obstacle détecté à la position " + iter +" à la distance "+ message.data[iter] + "</p>");
			//scroll le div à la fin 
			$('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight},1000);
			}
		}
	});

	//Topic for end_line_obstacles
	var topic_end_line_obstacles = new ROSLIB.Topic({
		ros : ros,
		name : '/end_line_obstacles',
		messageType : 'std_msgs/Int8MultiArray'
	});

	topic_end_line_obstacles.subscribe(function(message) {
		console.log('Received message on' + topIic_end_line_obstacles.name);
		//on parcourt les 8 capteurs
		for (var iter = 0; i < 8; iter++){
			if(message.data[iter]){
				$('#indication_board').append("<p> Obstacle au sol détecté à la position " + iter +"</p>");
				//scroll le div à la fin 
				$('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight},1000);
			}
		}
	});

	//Topic for bandwidth_quality	
	var topic_bandwidth_quality = new ROSLIB.Topic({
		ros : ros,
		name : '/bandwidth_quality',
		messageType : 'std_msgs/Byte'
	});

	topic_bandwidth_quality.subscribe(function(message) {
		console.log('Received message on' + topic_bandwidth_quality.name);
		$('#brandwith_quality').text(message.data);

	});

	//Topic for battery_level
	var topic_battery_level = new ROSLIB.Topic({
		ros : ros,
		name : '/battery_level',
		messageType : 'std_msgs/Byte'
	});

	topic_battery_level.subscribe(function(message) {
		console.log('Received message on' + topic_battery_level.name);
		console.log('Battery value' + message.battery_level);

		//Update the battery view in room_user.html
		var battery = $('battery');
		var level = parseInt(message.data)/255 * 100;
		var batteryLevel = $('#battery-level');
		batteryLevel.css('width', level + '%');
		if (level > 50) {  
			batteryLevel.addClass('high'); 
			batteryLevel.removeClass('medium');  
			batteryLevel.removeClass('low'); 
		} else if (level >= 25 ) {  
			batteryLevel.addClass('medium');  
			batteryLevel.removeClass('high');  
			batteryLevel.removeClass('low');
		} else {  
			batteryLevel.addClass('low');
			batteryLevel.removeClass('high');  
			batteryLevel.removeClass('medium');  
		}
	});
}
