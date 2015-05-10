
window.onload = function () {

    //-------------------------------------------------------------------------
    //=======================================
    //==== Launch Touch or Screen Control ===
    //=======================================
    //-------------------------------------------------------------------------

    //see ../control.js
    init();

    //-------------------------------------------------------------------------
    //=======================================
    //====== Connecting to ROS======
    //=======================================
    //-------------------------------------------------------------------------
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

    //-------------------------------------------------------------------------
    //============================================================
    //==================Global-Variables==================
    //============================================================
    //-------------------------------------------------------------------------

    //allow or not movement (if collision,panic_button,...)
    var move_up = true;
    var move_down = true;
    var turn_left = true;
    var turn_right = true;

    //interval of speed
    var speed_max = 127;
    var speed_slow = 15;
    var speed_stop = 0;

    //limit of speed in case proximity max=127 min=0
    var speed_limit = speed_max;

    //initial Gaze_direction [0,255]
    var gazeValue = 127;

    //initial Head_Direction [0,255]
    var headDirection = 127;

    //proximity level in centimeter
    var proximity_level1 = 40;
    var proximity_level2 = 30;
    var proximity_level3 = 20;
    var proximity_level4 = 10;

    //battery level in percent
    var battery_level1 = 50;
    var battery_level2 = 25;

    //brandwith quality level [0,255]
    var brandwith_quality_L7 = 32;
    var brandwith_quality_L6 = 64;
    var brandwith_quality_L5 = 96;
    var brandwith_quality_L4 = 128;
    var brandwith_quality_L3 = 160;
    var brandwith_quality_L2 = 192;
    var brandwith_quality_L1 = 224;

    //-------------------------------------------------------------------------
    //============================================================
    //==================Publisher============================
    //============================================================
    //-------------------------------------------------------------------------


    //==================Topics=================================

    //Gaze_direction
    var topic_gaze_direction = new ROSLIB.Topic({
        ros: ros,
        name: '/gaze_direction',
        messageType: 'std_msgs/Byte'
    });

    //Command_motor
    var topic_cmd = new ROSLIB.Topic({
        ros: ros,
        name: '/command_motor',
        messageType: 'MotorCmd'
    });

    //Angle_position
    var topic_angle_position = new ROSLIB.Topic({
        ros: ros,
        name: '/angle_position',
        messageType: 'std_msgs/Byte'
    });


    //==================Publications======================

    //-------------------------------------------------------------------------
    //Gaze_direction
    var setGazeDirection = function (key) {

        //Key code
        //q 81
        //d 68
        if (key === 81)
        {
            if (gazeValue !== 0) {
                gazeValue--;
                console.log("Turn sight to Left");
            }
            else {
                console.log("Max left position reached");
            }

        } else if (key === 68) {
            if (gazeValue !== 255) {
                gazeValue++;
                console.log("Turn sight to Right");
            }
            else {
                console.log("Max right position reached");
            }

        }
        console.log(gazeValue);
        var gaze = new ROSLIB.Message({
            data: gazeValue
        });
        topic_gaze_direction.publish(gaze);
        console.log("gaze direction published " + key);

    };

    //-------------------------------------------------------------------------
    //Angle_position
    var setHeadDirection = function (key) {

        //Key code
        //a 65
        //e 69
        elem = document.getElementById('triangle-up');
        if (key === 65)
        {
            if (headDirection !== 0) {
                headDirection--;
                console.log("Turn head to Left");
            }
            else {
                console.log("Max left position reached");
                $('#indication_board').append("<p> Limite de rotation de la tête à gauche atteinte </p>");
            }

        } else if (key === 69) {
            if (headDirection !== 255) {
                headDirection++;
                console.log("Turn head to Right");
            }
            else {
                console.log("Max right position reached");
                $('#indication_board').append("<p> Limite de rotation de la tête à droite atteinte </p>");
            }

        }
        console.log(headDirection);
        var head = new ROSLIB.Message({
            data: headDirection
        });
        topic_angle_position.publish(head);
        console.log("head direction published " + head);
    };

    //-------------------------------------------------------------------------
    //Command_motor
    /** Object storing references to the remote screen DOM elements */
    this.remote = {
        div: $('#remote'),
        left: $('#remote-left'),
        right: $('#remote-right'),
        up: $('#remote-up'),
        down: $('#remote-down'),
        head_l: $('#remote-left-head'),
        head_r: $('#remote-right-head'),
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
    but[65] = this.remote.head_l;
    but[69] = this.remote.head_r;
    var lastPressed = this.remote.stop; // only one action at a time

    //-------------------------------------------------------------------------
    //Control with click button
    var clickButton = function clickButton(key) {
        var speed1, speed2 = speed_stop;
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
        // Head movement
        if (key === 65 || key === 69) {
            console.log("Head Movement");
            setHeadDirection(key);
        } else {
            //Robot movement
            if (key === 38 && move_up) {
                // up arrow
                console.log("up Arrow");
                speed1 = speed_limit;
                speed2 = speed_limit;
            } else if (key === 40 && move_down) {
                // down arrow
                console.log("down Arrow");
                speed1 = -speed_limit;
                speed2 = -speed_limit;
            } else if (key === 37 && turn_left) {
                // left arrow
                console.log("left Arrow");
                speed1 = speed_limit;
                speed2 = speed_stop;
            } else if (key === 39 && turn_right) {
                // right arrow
                console.log("right Arrow");
                speed1 = speed_stop;
                speed2 = speed_limit;
            } else if (key === 83
                    || !move_up
                    || !move_up
                    || !turn_left
                    || !turn_right) {
                // 's' key -> stop
                console.log("'s' key (Stop)");
                speed1 = speed_stop;
                speed2 = speed_stop;
            }

            var msg = new ROSLIB.Message({
                speed1: speed1,
                speed2: speed2
                        //mode : 1			
            });
            //Publish on Topic
            topic_cmd.publish(msg);
            console.log("published " + key);
        }
    };

    //-------------------------------------------------------------------------
    //Keyboard control : - arrow for robot movement
    //                   - 's' for STOP
    //                   - 'q' and 'd' for gaze direction
    //                   - 'a' and 'e' for head direction
    document.addEventListener('keydown', function (e) {
        e = e || window.event;

        var keyCode = e.keyCode;
        //Robot movement
        if (keyCode === 38 || keyCode === 40 || keyCode === 37
                || keyCode === 39 || keyCode === 83) {
            e.preventDefault();
            clickButton(e.keyCode);
            //Gaze direction    
        } else if (keyCode === 81 || keyCode === 68) {
            e.preventDefault();
            setGazeDirection(e.keyCode);
            //Head movement
        } else if (keyCode === 65 || keyCode === 69) {
            e.preventDefault();
            setHeadDirection(e.keyCode);
        }
    }, false);

    // bind buttons clicks as well
    this.remote.left.click(clickButton.bind(null, 37));
    this.remote.right.click(clickButton.bind(null, 39));
    this.remote.up.click(clickButton.bind(null, 38));
    this.remote.down.click(clickButton.bind(null, 40));
    this.remote.stop.click(clickButton.bind(null, 83));
    this.remote.head_l.click(clickButton.bind(null, 65));
    this.remote.head_r.click(clickButton.bind(null, 69));

    //-------------------------------------------------------------------------
    // Control with mouse motion
    var mouseMotionCtrl = function mouseMotionCtrl(event) {

        var x0;
        var y0;
        if (event.x !== undefined && event.y !== undefined)
        {
            x0 = event.x;
            y0 = event.y;
        }
        else // Firefox method to get the position
        {
            x0 = event.clientX + document.body.scrollLeft +
                    document.documentElement.scrollLeft;
            y0 = event.clientY + document.body.scrollTop +
                    document.documentElement.scrollTop;
        }

        mouse_event.onmouseup = function (event) {

            var dx;
            var dy;
            if (event.x !== undefined && event.y !== undefined)
            {
                dx = event.x;
                dy = event.y;
            }
            else // Firefox method to get the position
            {
                dx = event.clientX + document.body.scrollLeft +
                        document.documentElement.scrollLeft;
                dy = event.clientY + document.body.scrollTop +
                        document.documentElement.scrollTop;
            }
            
            // distance of the window 
            var normX = $("#remote-controls-mouse").css('width');
            var normY = $("#remote-controls-mouse").css('height');
            //erase 'px' from norm
            normX = normX.substring(normX.length-2,0);
            normY = normY.substring(normY.length-2,0);
            
            //TODO : calibrate and vérify calcul
            var rx1 = (x0 - dx)/(normX)*speed_limit;
            var rx2 = (y0 - dy)/(normY)*speed_limit;

            //process speed with ponderation
            
            var speed1 = rx1*4;
            var speed2 = rx2*4;
            
            if (speed1 > speed_limit) {
                speed1 = speed_limit;
            }
            if (speed1 < -speed_limit) {
                speed1 = -speed_limit;
            }
            if (speed2 > speed_limit) {
                speed2 = speed_limit;
            }
            if (speed2 < -speed_limit) {
                speed2 = speed_limit;
            }
            var msg = new ROSLIB.Message({
                speed1: Math.round(speed1),
                speed2: Math.round(speed2)
            });
            //Publish on Topic
            topic_cmd.publish(msg);
            console.log("published "+ speed1 +" " +speed2);
        };
        mouse_event.onmousemove = function () {
            document.onmousemove = null;

        };

    };
    // bind mouse
    var mouse_event = document.getElementById('remote-controls-mouse');
    mouse_event.onclick = function (e) {
        e = e || window.event;
        mouseMotionCtrl(e);
    };



    //-------------------------------------------------------------------------
    //=====================================================================
    //===================GAMEPAD CONTROL=========================
    //=====================================================================

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

    //-------------------------------------------------------------------------
    //===================================================
    //================Subscriber=====================
    //===================================================
    //-------------------------------------------------------------------------

    //-------------------------------------------------------------------------
    //Topic for collision
    var topic_collision = new ROSLIB.Topic({
        ros: ros,
        name: '/collision_event',
        messageType: 'std_msgs/Bool'
    });

    topic_collision.subscribe(function (message) {
        console.log('Received message on ' + topic_collision.name + ': ' + message.collision);
        //get indication_board div and append the message only if there is a collision

        var boolClign = 1;
        var clignotement = function () {
            if (boolClign === 0) {
                boolClign = 1;
                $("#circle").css('color', '#FF0000');
                $("#circle").css('background', '#FFFFFF'); // blanc
                $("#circle").css('border-color', '#FF0000');

            }
            else {
                boolClign = 0;
                $("#circle").css('color', '#FFFFFF');
                $("#circle").css('background', '#FF0000'); // rouge
                $("#circle").css('border-color', '#FFFFFF');

            }
        };

        if (message.data) {
            //movement are prohibited and robot stop
            move_up = false;
            move_down = false;
            turn_left = false;
            turn_right = false;

            var msg = new ROSLIB.Message({
                speed1: speed_stop,
                speed2: speed_stop
                        //mode : 1			
            });
            topic_cmd.publish(msg);
            console.log("published : Emergency Stop");

            //display error
            $('#indication_board').append("<p> Collision détectée </p>");
            periode = setInterval(clignotement, 500);

            $("#up_possibility").css('color', 'rgb(255,0,0)');
            $("#down_possibility").css('color', 'rgb(255,0,0)');
            $("#left_possibility").css('color', 'rgb(255,0,0)');
            $("#right_possibility").css('color', 'rgb(255,0,0)');

        } else {
            $("#circle").css('color', 'rgb(0,85,0)');
            $("#circle").css('background', 'rgb(255,255,255)');
            $("#up_possibility").css('color', 'rgb(255,255,255)');
            $("#down_possibility").css('color', 'rgb(255,255,255)');
            $("#left_possibility").css('color', 'rgb(255,255,255)');
            $("#right_possibility").css('color', 'rgb(255,255,255)');
            //allow movement
            move_up = true;
            move_down = true;
            turn_left = true;
            turn_right = true;
        }
        //scroll le div à la fin 
        $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);


    });

    //-------------------------------------------------------------------------
    //Topic for hug event
    var topic_hug_event = new ROSLIB.Topic({
        ros: ros,
        name: '/social_touch_event',
        messageType: 'std_msgs/Bool'
    });


    var clignotement = function () {
        if ($("#hug").css('color') === 'rgb(255, 0, 0)') {
            $("#hug").css('color', 'rgb(255,255,255)');
        }
        else {
            $("#hug").css('color', 'rgb(255,0,0)');
        }
    };


    topic_hug_event.subscribe(function (message) {
        //console.log('Received message on' + topic_panic_event.name);
        if (message.data) {
            periode = setInterval(clignotement, 1000);
            setTimeout(function () {
                clearInterval(periode);
            }, 4000);
        }
    });

    //-------------------------------------------------------------------------
    //Topic for panic event
    var topic_panic_event = new ROSLIB.Topic({
        ros: ros,
        name: '/panic_event',
        messageType: 'std_msgs/Bool'
    });

    topic_panic_event.subscribe(function (message) {
        //console.log('Received message on' + topic_panic_event.name);

        var boolClign;
        var clignotement = function () {
            if (boolClign === 0) {
                boolClign = 1;
                $("#circle").css('background', '#FFFFFF'); // blanc
            }
            else {
                boolClign = 0;
                $("#circle").css('background', 'rgb(215,113,0)'); // rouge
            }
        };

        if (message.data) {
            //Stop the robot
            var msg = new ROSLIB.Message({
                speed1: speed_stop,
                speed2: speed_stop
            });
            topic_cmd.publish(msg);
            console.log("published : Panic Button");

            //display error
            $('#indication_board').append("<p> \"Panic button\" activé </p>");
            //scroll le div à la fin 
            $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);
            periode = setInterval(clignotement, 1000);
            setTimeout(function () {
                clearInterval(periode);
            }, 4000);
        }
        else {
            $("#circle").css('background', 'rgb(255,255,255)');
        }
    });

    //-------------------------------------------------------------------------
    //Topic for proximity obstacles
    var topic_proximity_obstacles = new ROSLIB.Topic({
        ros: ros,
        name: '/proximity_obstacles',
        messageType: 'std_msgs/Int32MultiArray'
    });

    topic_proximity_obstacles.subscribe(function (message) {
        console.log('Received message on' + topic_proximity_obstacles.name);

        $("#proximity").css('border-color', 'rgb(102,102,102)');
        $("#proximity_level1").css('border-color', 'rgb(102,102,102)');
        $("#proximity1").css('border-color', 'rgb(102,102,102)');
        $("#proximity1_level1").css('border-color', 'rgb(102,102,102)');
        $("#proximity2").css('border-color', 'rgb(102,102,102)');
        $("#proximity2_level1").css('border-color', 'rgb(102,102,102)');
        $("#proximity3").css('border-color', 'rgb(102,102,102)');
        $("#proximity3_level1").css('border-color', 'rgb(102,102,102)');
        $("#proximity4").css('border-color', 'rgb(102,102,102)');
        $("#proximity4_level1").css('border-color', 'rgb(102,102,102)');
        $("#proximity5").css('border-color', 'rgb(102,102,102)');
        $("#proximity5_level1").css('border-color', 'rgb(102,102,102)');
        $("#proximity6").css('border-color', 'rgb(102,102,102)');
        $("#proximity6_level1").css('border-color', 'rgb(102,102,102)');
        $("#proximity7").css('border-color', 'rgb(102,102,102)');
        $("#proximity7_level1").css('border-color', 'rgb(102,102,102)');
        var find = false;
        for (var iter = 0; i < 8; iter++) {

            if (message.data[iter] < proximity_level1) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', 'rgb(85,0,0)');
                        break;
                    default :
                        $("#proximity7").css('border-color', 'rgb(85,0,0)');
                        break;
                }
            }
            if (message.data[iter] < proximity_level2) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', 'rgb(204,78,0)');
                        $("#proximity_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', 'rgb(204,78,0)');
                        $("#proximity1_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', 'rgb(204,78,0)');
                        $("#proximity2_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', 'rgb(204,78,0)');
                        $("#proximity3_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', 'rgb(204,78,0)');
                        $("#proximity4_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', 'rgb(204,78,0)');
                        $("#proximity5_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', 'rgb(204,78,0)');
                        $("#proximity6_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                    default :
                        $("#proximity7").css('border-color', 'rgb(204,78,0)');
                        $("#proximity7_level1").css('border-color', 'rgb(85,0,0)');
                        break;
                }
            }
            if (message.data[iter] < proximity_level3) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', 'rgb(255,0,0)');
                        $("#proximity_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', 'rgb(255,0,0)');
                        $("#proximity1_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', 'rgb(255,0,0)');
                        $("#proximity2_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', 'rgb(255,0,0)');
                        $("#proximity3_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', 'rgb(255,0,0)');
                        $("#proximity4_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', 'rgb(255,0,0)');
                        $("#proximity5_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', 'rgb(255,0,0)');
                        $("#proximity6_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                    default :
                        $("#proximity7").css('border-color', 'rgb(255,0,0)');
                        $("#proximity7_level1").css('border-color', 'rgb(204,78,0)');
                        break;
                }
            }
            if (message.data[iter] < proximity_level4) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', 'rgb(255,0,0)');
                        $("#proximity_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', 'rgb(255,0,0)');
                        $("#proximity1_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', 'rgb(255,0,0)');
                        $("#proximity2_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', 'rgb(255,0,0)');
                        $("#proximity3_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', 'rgb(255,0,0)');
                        $("#proximity4_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', 'rgb(255,0,0)');
                        $("#proximity5_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', 'rgb(255,0,0)');
                        $("#proximity6_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                    default :
                        $("#proximity7").css('border-color', 'rgb(255,0,0)');
                        $("#proximity7_level1").css('border-color', 'rgb(255,0,0)');
                        break;
                }
                find = true;
                speed_limit = speed_slow;
                $('#indication_board').append("<p> Obstacle détecté à la position " + iter + " à la distance " + message.data[iter] + "</p>");
                //scroll le div à la fin 
                $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);
            }
        }
        if (!find) {
            speed_limit = speed_max;
        }
    });

    //-------------------------------------------------------------------------
    //Topic for end_line_obstacles
    var topic_end_line_obstacles = new ROSLIB.Topic({
        ros: ros,
        name: '/end_line_obstacles',
        messageType: 'std_msgs/Int8MultiArray'
    });

    topic_end_line_obstacles.subscribe(function (message) {
        console.log('Received message on' + topIic_end_line_obstacles.name);

        var boolClign;
        var clignotement = function () {
            if (boolClign === 0) { // Si rouge
                boolClign = 1;
                $("#circle").css('background', '#FFFFFF'); // blanc

            }
            else {
                boolClign = 0;
                $("#circle").css('background', 'rgb(215,113,0)'); // orange

            }
        };
        find = false;
        //on parcourt les 8 capteurs
        for (var iter = 0; i < 8; iter++) {
            if (message.data[iter]) {
                find = true;
                //Stop the robot
                var msg = new ROSLIB.Message({
                    speed1: speed_stop,
                    speed2: speed_stop
                });
                topic_cmd.publish(msg);
                console.log("published : End line obstacles");
                $('#indication_board').append("<p> Obstacle au sol détecté à la position " + iter + "</p>");
                //scroll le div à la fin 
                $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);
                periode = setInterval(clignotement, 500);
                switch (iter) {
                    case 0 :
                        $("#endline_alert").css('background', 'rgb(255,0,0)');
                        move_up = false;
                        turn_left = false;
                        $("#up_possibility").css('color', 'rgb(255,0,0)');
                        $("#left_possibility").css('color', 'rgb(255,0,0)');
                        break;
                    case 1 :
                        $("#endline_alert").css('background', 'rgb(255,0,0)');
                        move_up = false;
                        turn_right = false;
                        $("#up_possibility").css('color', 'rgb(255,0,0)');
                        $("#right_possibility").css('color', 'rgb(255,0,0)');
                        break;
                    case 2 :
                        $("#endline_alert1").css('background', 'rgb(255,0,0)');
                        move_up = false;
                        turn_left = false;
                        $("#up_possibility").css('color', 'rgb(255,0,0)');
                        $("#left_possibility").css('color', 'rgb(255,0,0)');
                        break;
                    case 3 :
                        $("#endline_alert1").css('background', 'rgb(255,0,0)');
                        move_down = false;
                        turn_right = false;
                        $("#down_possibility").css('color', 'rgb(255,0,0)');
                        $("#right_possibility").css('color', 'rgb(255,0,0)');
                        break;
                    case 4 :
                        $("#endline_alert2").css('background', 'rgb(255,0,0)');
                        move_down = false;
                        turn_right = false;
                        $("#down_possibility").css('color', 'rgb(255,0,0)');
                        $("#right_possibility").css('color', 'rgb(255,0,0)');
                        break;
                    case 5 :
                        $("#endline_alert2").css('background', 'rgb(255,0,0)');
                        move_down = false;
                        turn_left = false;
                        $("#down_possibility").css('color', 'rgb(255,0,0)');
                        $("#left_possibility").css('color', 'rgb(255,0,0)');
                        break;
                    case 6 :
                        $("#endline_alert3").css('background', 'rgb(255,0,0)');
                        move_down = false;
                        turn_right = false;
                        $("#down_possibility").css('color', 'rgb(255,0,0)');
                        $("#right_possibility").css('color', 'rgb(255,0,0)');
                        break;
                    default :
                        $("#endline_alert3").css('background', 'rgb(255,0,0)');
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
            $("#endline_alert").css('background', 'rgb(255,0,0)');
            $("#endline_alert1").css('background', 'rgb(255,0,0)');
            $("#endline_alert2").css('background', 'rgb(255,0,0)');
            $("#endline_alert3").css('background', 'rgb(255,0,0)');
            $("#up_possibility").css('color', 'rgb(255,255,255)');
            $("#down_possibility").css('color', 'rgb(255,255,255)');
            $("#left_possibility").css('color', 'rgb(255,255,255)');
            $("#right_possibility").css('color', 'rgb(255,255,255)');
            $("#circle").css('background', 'rgb(255,255,255)');
        }
    });


    //-------------------------------------------------------------------------
    //Topic for bandwidth_quality	
    var topic_bandwidth_quality = new ROSLIB.Topic({
        ros: ros,
        name: '/bandwidth_quality',
        messageType: 'std_msgs/Byte'
    });

    //$("#proximity").css('border-color', 'rgb(102,102,102)');
    topic_bandwidth_quality.subscribe(function (message) {
        console.log('Received message on' + topic_bandwidth_quality.name);

        $("#brandwith_quality_critical").css('background', 'rgb(0,255,0)');
        $("#brandwith_quality_low").css('background', 'rgb(0,255,0)');
        $("#brandwith_quality_medium").css('background', 'rgb(0,255,0)');
        $("#brandwith_quality_high").css('background', 'rgb(0,255,0)');

        if (message.data < brandwith_quality_L1) {
            $("#brandwith_quality_high").css('background', 'rgb(255,71,0)');
        }
        if (message.data < brandwith_quality_L2) {
            $("#brandwith_quality_high").css('background', 'rgb(102,102,102)');
        }
        if (message.data < brandwith_quality_L3) {
            $("#brandwith_quality_medium").css('background', 'rgb(255,71,0)');
        }
        if (message.data < brandwith_quality_L4) {
            $("#brandwith_quality_medium").css('background', 'rgb(102,102,102)');
        }
        if (message.data < brandwith_quality_L5) {
            $("#brandwith_quality_low").css('background', 'rgb(255,71,0)');
            $("#brandwith_quality_critical").css('background', 'rgb(255,71,0)');
        }
        if (message.data < brandwith_quality_L6) {
            $("#brandwith_quality_low").css('background', 'rgb(102,102,102)');
            $("#brandwith_quality_critical").css('background', 'rgb(255,0,0)');
        }
        if (message.data < brandwith_quality_L7) {
            var boolClign;
            var clignotement = function () {
                if (boolClign === 0) {
                    boolClign = 1;
                    $("#brandwith_quality_critical").css('background', '#FFFFFF'); // blanc
                }
                else {
                    boolClign = 0;
                    $("#brandwith_quality_critical").css('background', 'rgb(255,0,0)'); // rouge
                }
            };
            periode = setInterval(clignotement, 500);
        }

    });

    //-------------------------------------------------------------------------
    //Topic for battery_level
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
        if (level > battery_level1) {
            batteryLevel.addClass('high');
            batteryLevel.removeClass('medium');
            batteryLevel.removeClass('low');
        } else if (level >= battery_level2) {
            batteryLevel.addClass('medium');
            batteryLevel.removeClass('high');
            batteryLevel.removeClass('low');
        } else {
            batteryLevel.addClass('low');
            batteryLevel.removeClass('high');
            batteryLevel.removeClass('medium');
        }
    });

};