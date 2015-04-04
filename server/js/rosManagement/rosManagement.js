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
			angular_val = 0.75;
		}else if (key == '39') {
			// right arrow
			console.log("right Arrow");
			angular_val = -0.75;
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

	/*	document.onkeydown = function (e) {
		e = e || window.event;
		console.log("onKeyDown ---> keyCode = " + e.keyCode);

		var keyCode = e.keyCode;
		var html_img_id;

		if (keyCode == '38' || keyCode == '40' || keyCode == '37'
		|| keyCode == '39' || keyCode == '83'){

		if (e.keyCode == '38') {
		// up arrow
		console.log("up Arrow");
		angular_val = 0.0;
		html_img_id = 'up';

		}else if (e.keyCode == '40') {
		// down arrow
		console.log("down Arrow");
		angular_val = 3.0;
		html_img_id = 'down';

		}else if (e.keyCode == '37') {
		// left arrow
		console.log("left Arrow");
		angular_val = 0.75;
		html_img_id = 'left';

		}else if (e.keyCode == '39') {
		// right arrow
		console.log("right Arrow");
		angular_val = -0.75;
		html_img_id = 'right';

		}else if (e.keyCode == '83') {
		// 's' key -> stop
		console.log("'s' key (Stop)");
		angular_val = 0.0;
		html_img_id = 'stop';
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
		console.log("published " + e.keyCode);
		}
		console.log("");
		};*/




		/*	webrtc.on('chat', function(message) {
			console.log("MSG received!!!");
			document.getElementById("title").innerHTML += message.data;

			var linear_val = message.data;

			var msg = new ROSLIB.Message({
			//{"top": 0, "bottom": 1, "left": 2, "right": 3, "s": 4}
			move : linear_val,
			speed1 : 0,
			turn : 0
			});

			//Publish on Topic
			topic_cmd.publish(msg);
			});*/



} //end window.onload












