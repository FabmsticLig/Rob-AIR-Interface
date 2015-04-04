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



	document.onkeydown = function (e) {
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
	};




/*webrtc.on('chat', function(message) {
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












