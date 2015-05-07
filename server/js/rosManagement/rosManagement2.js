window.onload = function () {

    //==========================
    //==== Connecting to ROS====
    //==========================
    var ros = new ROSLIB.Ros({
        //url : 'ws://localhost:9090'
        url: 'ws://192.168.1.2:9090'
    });


    ros.on('error', function (error) {
        console.log('Error connecting to websocket server: ', error);
    });

    ros.on('close', function () {
        console.log('Connection to websocket server closed.');
    });

    ros.on('connection', function () {
        console.log('Connected to websocket server.');
    });

    //========================================
    //============Publisher===================
    //========================================

    //Topics

    //Gaze_direction
    var topic_end_line_obstacles = new ROSLIB.Topic({
        ros: ros,
        name: '/gaze_direction',
        messageType: 'std_msgs/Byte'
    });

    //Command_motor
    var topic_cmd = new ROSLIB.Topic({
        ros: ros,
        name: '/cmdmotors',
        messageType: 'md49test/MotorCmd'
    });

    //Angle_position
    var topic_angle_position = new ROSLIB.Topic({
        ros: ros,
        name: '/angle_position',
        messageType: 'std_msgs/Byte'
    });

    //allow movement (if collision,panic_button,...)
    var move_up = true;
    var move_down = true;
    var turn_left = true;
    var turn_right = true;
    //limit of speed in case proximity max=4 min=1
    var speed_limit = 4;
    //Publications

    //Gaze_direction
    //TODO

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

    var clickButton = function clickButton(key) {
        var speed1, speed2;
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
        if (key == '38' && move_up) {
            // up arrow
            console.log("up Arrow");
            speed1 = 32 * speed_limit;
            speed2 = 32 * speed_limit;
        } else if (key == '40' && move_down) {
            // down arrow
            console.log("down Arrow");
            speed1 = 128 - 32 * speed_limit;
            speed2 = 128 - 32 * speed_limit;
        } else if (key == '37' && turn_left) {
            // left arrow
            console.log("left Arrow");
            speed1 = 32 * speed_limit;
            speed2 = 128;
        } else if (key == '39' && turn_right) {
            // right arrow
            console.log("right Arrow");
            speed1 = 128;
            speed2 = 32 * speed_limit;
        } else if (key == '83'
                || !move_up
                || !move_up
                || !turn_left
                || !turn_right) {
            // 's' key -> stop
            console.log("'s' key (Stop)");
            speed1 = 128;
            speed2 = 128;
        }
        var msg = new ROSLIB.Message({
            speed1: speed1,
            speed2: speed2
                    //mode : 1			
        });
        //Publish on Topic
        topic_cmd.publish(msg);
        console.log("published " + key);
    };

    // bind keyboard
    document.addEventListener('keydown', function (e) {
        e = e || window.event;

        var keyCode = e.keyCode;
        if (keyCode == '38' || keyCode == '40' || keyCode == '37'
                || keyCode == '39' || keyCode == '83') {
            e.preventDefault();
            clickButton(e.keyCode);
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

    var rAFStop = window.mozCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame ||
            window.cancelRequestAnimationFrame;

    window.addEventListener("gamepadconnected", function () {
        var gp = navigator.getGamepads()[0];
        console.log("Gamepad connected at index " + gp.index + ": " + gp.id + ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
        gameLoop();
    });

    window.addEventListener("gamepaddisconnected", function () {
        console.log("Waiting for gamepad.");
        rAFStop(start);
    });

    if (!('GamepadEvent' in window)) {
        // No gamepad events available, poll instead.
        var interval = setInterval(pollGamepads, 500);
    }

    function pollGamepads() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        for (var i = 0; i < gamepads.length; i++) {
            var gp = gamepads[i];
            if (gp) {
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
            linear: {
                x: speed,
                y: 0.0,
                z: 0.0
            },
            angular: {
                x: 0.0,
                y: 0.0,
                z: angular_val
            }
        });

        //Publish on Topic
        topic_cmd.publish(msg);

        var start = rAF(gameLoop);
    }
    ;

    //==================================
    //===========Subscriber==============
    //==================================

    //==================================
    //Topic for collision
    //==================================
    var topic_collision = new ROSLIB.Topic({
        ros: ros,
        name: '/collision_event',
        messageType: 'std_msgs/Bool'
    });

    topic_collision.subscribe(function (message) {
        console.log('Received message on ' + topic_collision.name + ': ' + message.collision);
        //get indication_board div and append the message only if there is a collision
        //stop the robot


        var clignotement = function () {
            if ($("#circle").css('color') == 'rgb(0, 85, 0)') {

                $("#circle").css('color', 'rgb(255,0,0)');
                $("#circle").css('background', 'rgb(0,0,0)');

            }
            else {

                $("#circle").css('color', 'rgb(0,0,0)');
                $("#circle").css('background', 'rgb(0,255,0)');

            }
        };
        if (message.data) {
            //movement are prohibited and robot stop
            move_up = false;
            move_down = false;
            turn_left = false;
            turn_right = false;

            var msg = new ROSLIB.Message({
                speed1: 128,
                speed2: 128
                        //mode : 1			
            });
            topic_cmd.publish(msg);
            console.log("published : Emergency Stop");

            //display error
            $('#indication_board').append("<p> Collision détectée </p>");
            periode = setInterval(clignotement, 100);
            clearInterval(periode);
            $("#up_possibility").css('color', 'rgb(255,0,0)');
            $("#down_possibility").css('color', 'rgb(255,0,0)');
            $("#left_possibility").css('color', 'rgb(255,0,0)');
            $("#right_possibility").css('color', 'rgb(255,0,0)');

        } else {
            $("#circle").css('color', 'rgb(0,85,0)');
            $("#circle").css('background', 'rgb(0,0,0)');
            $("#up_possibility").css('color', 'rgb(0,0,0)');
            $("#down_possibility").css('color', 'rgb(0,0,0)');
            $("#left_possibility").css('color', 'rgb(0,0,0)');
            $("#right_possibility").css('color', 'rgb(0,0,0)');
            //allow movement
            move_up = true;
            move_down = true;
            turn_left = true;
            turn_right = true;
        }
        //scroll le div à la fin 
        $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);


    });


    //==================================
    //Topic for hug event
    //==================================
    var topic_hug_event = new ROSLIB.Topic({
        ros: ros,
        name: '/social_touch_event',
        messageType: 'std_msgs/Bool'
    });


    var clignotement = function () {
        if ($("#hug").css('color') == 'rgb(255, 0, 0)') {
            console.log($("#hug").css('color'));

            $("#hug").css('color', 'rgb(0,0,0)');

            console.log("red -> black");
            console.log($("#hug").css('color'));
        }
        else {
            console.log($("#hug").css('color'));

            $("#hug").css('color', 'rgb(255,0,0)');

            console.log("black -> red");
            console.log($("#hug").css('color'));
        }
    };


    topic_hug_event.subscribe(function (message) {
        //console.log('Received message on' + topic_panic_event.name);
        if (message.data) {
            periode = setInterval(clignotement, 1000);
            setTimeout(function () {
                clearInterval(periode)
            }, 4000);
        }
    });

    //==================================
    //Topic for panic event
    //==================================
    var topic_panic_event = new ROSLIB.Topic({
        ros: ros,
        name: '/panic_event',
        messageType: 'std_msgs/Bool'
    });

    topic_panic_event.subscribe(function (message) {
        //console.log('Received message on' + topic_panic_event.name);

        var clignotement = function () {
            if ($("#circle").css('background') == 'rgb(0,0, 0)') {

                $("#circle").css('background', 'rgb(215,113,0)');

            }
            else {

                $("#circle").css('background', 'rgb(0,0,0)');

            }
        };
        if (message.data) {
            //Stop the robot
            var msg = new ROSLIB.Message({
                speed1: 128,
                speed2: 128
                        //mode : 1			
            });
            topic_cmd.publish(msg);
            console.log("published : Panic Button");

            //display error
            $('#indication_board').append("<p> \"Panic button\" activé </p>");
            //scroll le div à la fin 
            $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);
            periode = setInterval(clignotement, 1000);
            setTimeout(function () {
                clearInterval(periode)
            }, 4000);
        }
        else {
            $('#indication_board').append("Nothing");
            $("#circle").css('background', 'rgb(0,0,0)');
        }
    });


    //==================================
    //Topic for proximity obstacles
    //==================================
    var topic_proximity_obstacles = new ROSLIB.Topic({
        ros: ros,
        name: '/proximity_obstacles',
        messageType: 'std_msgs/Int32MultiArray'
    });

    topic_proximity_obstacles.subscribe(function (message) {
        console.log('Received message on' + topic_proximity_obstacles.name);

        $("#proximity").css('color', 'rgb(102,102,102)');
        $("#proximity_level1").css('color', 'rgb(102,102,102)');
        $("#proximity1").css('color', 'rgb(102,102,102)');
        $("#proximity1_level1").css('color', 'rgb(102,102,102)');
        $("#proximity2").css('color', 'rgb(102,102,102)');
        $("#proximity2_level1").css('color', 'rgb(102,102,102)');
        $("#proximity3").css('color', 'rgb(102,102,102)');
        $("#proximity3_level1").css('color', 'rgb(102,102,102)');
        $("#proximity4").css('color', 'rgb(102,102,102)');
        $("#proximity4_level1").css('color', 'rgb(102,102,102)');
        $("#proximity5").css('color', 'rgb(102,102,102)');
        $("#proximity5_level1").css('color', 'rgb(102,102,102)');
        $("#proximity6").css('color', 'rgb(102,102,102)');
        $("#proximity6_level1").css('color', 'rgb(102,102,102)');
        $("#proximity7").css('color', 'rgb(102,102,102)');
        $("#proximity7_level1").css('color', 'rgb(102,102,102)');
        var find = false;
        for (var iter = 0; i < 8; iter++) {

            if (message.data[iter] < 40) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('color', 'rgb(0,85,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('color', 'rgb(0,85,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('color', 'rgb(0,85,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('color', 'rgb(0,85,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('color', 'rgb(0,85,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('color', 'rgb(0,85,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('color', 'rgb(0,85,0)');
                        break;
                    default :
                        $("#proximity7").css('color', 'rgb(0,85,0)');
                        break;
                }
            }
            if (message.data[iter] < 30) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('color', 'rgb(204,78,0)');
                        $("#proximity_level1").css('color', 'rgb(0,85,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('color', 'rgb(204,78,0)');
                        $("#proximity1_level1").css('color', 'rgb(0,85,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('color', 'rgb(204,78,0)');
                        $("#proximity2_level1").css('color', 'rgb(0,85,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('color', 'rgb(204,78,0)');
                        $("#proximity3_level1").css('color', 'rgb(0,85,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('color', 'rgb(204,78,0)');
                        $("#proximity4_level1").css('color', 'rgb(0,85,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('color', 'rgb(204,78,0)');
                        $("#proximity5_level1").css('color', 'rgb(0,85,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('color', 'rgb(204,78,0)');
                        $("#proximity6_level1").css('color', 'rgb(0,85,0)');
                        break;
                    default :
                        $("#proximity7").css('color', 'rgb(204,78,0)');
                        $("#proximity7_level1").css('color', 'rgb(0,85,0)');
                        break;
                }
                find = true;
                speed_limit = 3;
            }
            if (message.data[iter] < 20) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('color', 'rgb(255,0,0)');
                        $("#proximity_level1").css('color', 'rgb(204,78,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('color', 'rgb(255,0,0)');
                        $("#proximity1_level1").css('color', 'rgb(204,78,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('color', 'rgb(255,0,0)');
                        $("#proximity2_level1").css('color', 'rgb(204,78,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('color', 'rgb(255,0,0)');
                        $("#proximity3_level1").css('color', 'rgb(204,78,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('color', 'rgb(255,0,0)');
                        $("#proximity4_level1").css('color', 'rgb(204,78,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('color', 'rgb(255,0,0)');
                        $("#proximity5_level1").css('color', 'rgb(204,78,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('color', 'rgb(255,0,0)');
                        $("#proximity6_level1").css('color', 'rgb(204,78,0)');
                        break;
                    default :
                        $("#proximity7").css('color', 'rgb(255,0,0)');
                        $("#proximity7_level1").css('color', 'rgb(204,78,0)');
                        break;
                }
                find = true;
                speed_limit = 2;
            }
            if (message.data[iter] < 10) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('color', 'rgb(255,0,0)');
                        $("#proximity_level1").css('color', 'rgb(255,0,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('color', 'rgb(255,0,0)');
                        $("#proximity1_level1").css('color', 'rgb(255,0,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('color', 'rgb(255,0,0)');
                        $("#proximity2_level1").css('color', 'rgb(255,0,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('color', 'rgb(255,0,0)');
                        $("#proximity3_level1").css('color', 'rgb(255,0,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('color', 'rgb(255,0,0)');
                        $("#proximity4_level1").css('color', 'rgb(255,0,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('color', 'rgb(255,0,0)');
                        $("#proximity5_level1").css('color', 'rgb(255,0,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('color', 'rgb(255,0,0)');
                        $("#proximity6_level1").css('color', 'rgb(255,0,0)');
                        break;
                    default :
                        $("#proximity7").css('color', 'rgb(255,0,0)');
                        $("#proximity7_level1").css('color', 'rgb(255,0,0)');
                        break;
                }
                find = true;
                speed_limit = 1;
                $('#indication_board').append("<p> Obstacle détecté à la position " + iter + " à la distance " + message.data[iter] + "</p>");
                //scroll le div à la fin 
                $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);
            }
        }
        if (!find) {
            speed_limit = 4;
        }
    });

    //==================================
    //Topic for end_line_obstacles
    //==================================
    var topic_end_line_obstacles = new ROSLIB.Topic({
/*<<<<<<< HEAD
	ros : ros,
	name : '/end_line_obstacles',
	messageType : 'std_msgs/Int8MultiArray'
    });

    topic_end_line_obstacles.subscribe(function(message) {
	console.log('Received message on' + topIic_end_line_obstacles.name);
        
	var clignotement = function(){
	    if ( $("#circle").css('background') == 'rgb(0,0, 0)') {
		$("#circle").css('background','rgb(215,113,0)');
	    } else{	
		$("#circle").css('background','rgb(0,0,0)');
	    }
	};
	boolean find = false;
	//on parcourt les 8 capteurs
	for (var iter = 0; i < 8; iter++){
	    if(message.data[iter]){
		find = true;
		//Stop the robot
		var msg = new ROSLIB.Message({
		    speed1 : 128,
		    speed2 : 128
		    //mode : 1			
		});
		topic_cmd.publish(msg);
		console.log("published : End line obstacles");

		$('#indication_board').append("<p> Obstacle au sol détecté à la position " + iter +"</p>");
		//scroll le div à la fin 
		$('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight},1000);

		periode = setInterval(clignotement, 100);
		//function(){clearInterval(periode)};   
		switch (iter) {
		case 0 :
		    $("#circle_alert").css('background','rgb(255,0,0)');
		    move_up    = false;
		    turn_left  = false;
		    $("#up_possibility").css('color','rgb(255,0,0)');
		    $("#left_possibility").css('color','rgb(255,0,0)');
		    break;
		case 1 :
		    $("#circle_alert").css('background','rgb(255,0,0)');
		    move_up    = false;
		    turn_right = false;
		    $("#up_possibility").css('color','rgb(255,0,0)');
		    $("#right_possibility").css('color','rgb(255,0,0)');
		    break;
		case 2 :
		    $("#circle_alert1").css('background','rgb(255,0,0)');
		    move_up    = false;
		    turn_left  = false;
		    $("#up_possibility").css('color','rgb(255,0,0)');
		    $("#left_possibility").css('color','rgb(255,0,0)');
		    break;
		case 3 :
		    $("#circle_alert1").css('background','rgb(255,0,0)');
		    move_down  = false;
		    turn_right = false;
		    $("#down_possibility").css('color','rgb(255,0,0)');
		    $("#right_possibility").css('color','rgb(255,0,0)');
		    break;
		case 4 :
		    $("#circle_alert2").css('background','rgb(255,0,0)');
		    move_down  = false;
		    turn_right = false;
		    $("#down_possibility").css('color','rgb(255,0,0)');
		    $("#right_possibility").css('color','rgb(255,0,0)');
		    break;
		case 5 :
		    $("#circle_alert2").css('background','rgb(255,0,0)');
		    move_down  = false;
		    turn_left  = false;
		    $("#down_possibility").css('color','rgb(255,0,0)');
		    $("#left_possibility").css('color','rgb(255,0,0)');
		    break;
		case 6 :
		    $("#circle_alert3").css('background','rgb(255,0,0)');
		    move_down  = false;
		    turn_right = false;
		    $("#down_possibility").css('color','rgb(255,0,0)');
		    $("#right_possibility").css('color','rgb(255,0,0)');
		    break;
		default :
		    $("#circle_alert3").css('background','rgb(255,0,0)');
		    move_down  = false;
		    turn_left  = false;
		    $("#down_possibility").css('color','rgb(255,0,0)');
		    $("#left_possibility").css('color','rgb(255,0,0)');
		    break;

		}
		break;
	    }
		
	}
	if (!find) {
	    move_up    = true;
	    move_down  = true;
	    turn_left  = true;
            turn_right = true;
	    $("#up_possibility").css('color','rgb(0,0,0)');
	    $("#down_possibility").css('color','rgb(0,0,0)');
	    $("#left_possibility").css('color','rgb(0,0,0)');
	    $("#right_possibility").css('color','rgb(0,0,0)');
	    $("#circle").css('background','rgb(0,0,0)');
	}
    });

    //==================================
    //Topic for bandwidth_quality
    //==================================	
    var topic_bandwidth_quality = new ROSLIB.Topic({
	ros : ros,
	name : '/bandwidth_quality',
	messageType : 'std_msgs/Byte'
    });

    topic_bandwidth_quality.subscribe(function(message) {
	console.log('Received message on' + topic_bandwidth_quality.name);
	$('#brandwith_quality').text(message.data);

=======*/
        ros: ros,
        name: '/end_line_obstacles',
        messageType: 'std_msgs/Int8MultiArray'
//>>>>>>> 8edc042ee5d92104aa1d66b6b63c048cad452681
    });

    topic_end_line_obstacles.subscribe(function (message) {
        console.log('Received message on' + topIic_end_line_obstacles.name);

        var clignotement = function () {
            if ($("#circle").css('background') == 'rgb(0,0, 0)') {
                $("#circle").css('background', 'rgb(215,113,0)');
            } else {
                $("#circle").css('background', 'rgb(0,0,0)');
            }
        };
        boolean
        find = false;
                //on parcourt les 8 capteurs
                for (var iter = 0; i < 8; iter++){
        if (message.data[iter]){
        find = true;
                //Stop the robot
                var msg = new ROSLIB.Message({
                speed1 : 128,
                        speed2 : 128
                        //mode : 1			
                });
                topic_cmd.publish(msg);
                console.log("published : End line obstacles");
                $('#indication_board').append("<p> Obstacle au sol détecté à la position " + iter + "</p>");
                //scroll le div à la fin 
                $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);
                periode = setInterval(clignotement, 100);
                clearInterval(periode);
        switch (iter) {
            case 0 :
                $("#circle_alert").css('background', 'rgb(255,0,0)');
                move_up = false;
                turn_left = false;
                $("#up_possibility").css('color', 'rgb(255,0,0)');
                $("#left_possibility").css('color', 'rgb(255,0,0)');
                break;
            case 1 :
                $("#circle_alert").css('background', 'rgb(255,0,0)');
                move_up = false;
                turn_right = false;
                $("#up_possibility").css('color', 'rgb(255,0,0)');
                $("#right_possibility").css('color', 'rgb(255,0,0)');
                break;
            case 2 :
                $("#circle_alert1").css('background', 'rgb(255,0,0)');
                move_up = false;
                turn_left = false;
                $("#up_possibility").css('color', 'rgb(255,0,0)');
                $("#left_possibility").css('color', 'rgb(255,0,0)');
                break;
            case 3 :
                $("#circle_alert1").css('background', 'rgb(255,0,0)');
                move_down = false;
                turn_right = false;
                $("#down_possibility").css('color', 'rgb(255,0,0)');
                $("#right_possibility").css('color', 'rgb(255,0,0)');
                break;
            case 4 :
                $("#circle_alert2").css('background', 'rgb(255,0,0)');
                move_down = false;
                turn_right = false;
                $("#down_possibility").css('color', 'rgb(255,0,0)');
                $("#right_possibility").css('color', 'rgb(255,0,0)');
                break;
            case 5 :
                $("#circle_alert2").css('background', 'rgb(255,0,0)');
                move_down = false;
                turn_left = false;
                $("#down_possibility").css('color', 'rgb(255,0,0)');
                $("#left_possibility").css('color', 'rgb(255,0,0)');
                break;
            case 6 :
                $("#circle_alert3").css('background', 'rgb(255,0,0)');
                move_down = false;
                turn_right = false;
                $("#down_possibility").css('color', 'rgb(255,0,0)');
                $("#right_possibility").css('color', 'rgb(255,0,0)');
                break;
            default :
                $("#circle_alert3").css('background', 'rgb(255,0,0)');
                move_down = false;
                turn_left = false;
                $("#down_possibility").css('color', 'rgb(255,0,0)');
                $("#left_possibility").css('color', 'rgb(255,0,0)');
                break;

                }
                break;
        }

    }
    if (!find) {
    move_up = true;
    move_down = true;
    turn_left = true;
    turn_right = true;
    $("#up_possibility").css('color', 'rgb(0,0,0)');
    $("#down_possibility").css('color', 'rgb(0,0,0)');
    $("#left_possibility").css('color', 'rgb(0,0,0)');
    $("#right_possibility").css('color', 'rgb(0,0,0)');
    $("#circle").css('background', 'rgb(0,0,0)');
    }
}
);
        //==================================
        //Topic for bandwidth_quality
        //==================================	
        var topic_bandwidth_quality = new ROSLIB.Topic({
            ros: ros,
            name: '/bandwidth_quality',
            messageType: 'std_msgs/Byte'
        });

topic_bandwidth_quality.subscribe(function (message) {
    console.log('Received message on' + topic_bandwidth_quality.name);
    $('#brandwith_quality').text(message.data);

});

//==================================
//Topic for battery_level
//==================================
var topic_battery_level = new ROSLIB.Topic({
    ros: ros,
    name: '/battery_level',
    messageType: 'std_msgs/Byte'
});

topic_battery_level.subscribe(function (message) {
    console.log('Received message on' + topic_battery_level.name);
    console.log('Battery value' + message.battery_level);

    //Update the battery view in room_user.html
    var battery = $('battery');
    var level = parseInt(message.data) / 255 * 100;
    var batteryLevel = $('#battery-level');
    batteryLevel.css('width', level + '%');
    if (level > 50) {
        batteryLevel.addClass('high');
        batteryLevel.removeClass('medium');
        batteryLevel.removeClass('low');
    } else if (level >= 25) {
        batteryLevel.addClass('medium');
        batteryLevel.removeClass('high');
        batteryLevel.removeClass('low');
    } else {
        batteryLevel.addClass('low');
        batteryLevel.removeClass('high');
        batteryLevel.removeClass('medium');
        }
    }
    );
}
