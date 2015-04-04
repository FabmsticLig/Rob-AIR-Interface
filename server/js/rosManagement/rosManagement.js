window.onload=function(){


	// Connecting to ROS
	// -----------------
	var ros = new ROSLIB.Ros({
		//url : 'ws://localhost:9090'
		url : 'ws://192.168.0.12:9090'
		//url : 'ws://192.168.1.3:9090'
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




	var topic_cmd = new ROSLIB.Topic({
		//Test with turtlesim
		ros : ros,
		name : 'turtle1/cmd_vel',
		messageType : 'geometry_msgs/Twist'
	});

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
	var clickButton = function clickButton(key) {
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
			angular_val = 0.0;
		}else if (key== '40') {
			// down arrow
			console.log("down Arrow");
			angular_val = 3.0;
		}else if (key == '37') {
			// left arrow
			console.log("left Arrow");
			angular_val = 1;
		}else if (key == '39') {
			// right arrow
			console.log("right Arrow");
			angular_val = -1;
		}else if (key == '83') {
			// 's' key -> stop
			console.log("'s' key (Stop)");
			angular_val = 0.0;
		}
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
		topic_cmd.publish(msg);
		console.log("published " + key);
	};
	// bind keyboard
	document.onkeydown = function keyDown(e) {
		e = e || window.event;

		var keyCode = e.keyCode;
		if (keyCode == '38' || keyCode == '40' || keyCode == '37'
		|| keyCode == '39' || keyCode == '83'){
			e.preventDefault();
			clickButton(e.keyCode);
		}
	};

	// bind buttons clicks as well
	this.remote.left.click(clickButton.bind(null, 37));
	this.remote.right.click(clickButton.bind(null, 39));
	this.remote.up.click(clickButton.bind(null, 38));
	this.remote.down.click(clickButton.bind(null, 40));
	this.remote.stop.click(clickButton.bind(null, 83));


	//==============================================
	//=============XBOX PAD CONTROL=================
	//==============================================

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
}
