
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
    var move_up    = true;
    var move_down  = true;
    var turn_left  = true;
    var turn_right = true;

    //interval of speed
    var speed_max  = 255;
    var speed_stop = 127;
    var speed_min  = 0;

    //limit of speed in case proximity (ie 100% = 0)
    var speed_limit = 0;
    //max speed - speed reduction = speed limit
    var speed_reduction  = 100;

    //Default keyboard control
    var key_stop       = 83; //'s' 
    var key_forward    = 38; // arrow up
    var key_backward   = 40; // arrow down
    var key_turn_left  = 37; // arrow left
    var key_turn_right = 39; // arrow right
    var key_gaze_left  = 81; //'q'
    var key_gaze_right = 68; //'d'
    var key_head_left  = 65; //'a'
    var key_head_right = 69; //'e'

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
    
    //define normal/warning/alert color
    var white_ok         = 'rgb(255, 255, 255)';
    var black_ok         = 'rgb(0, 0, 0)';
    var green_ok         = 'rgb(0, 85, 0)';
    var green_p_ok       = 'transparent transparent transparent rgb(0, 85, 0)';
    var grey_ok          = 'rgb(102, 102, 102)';
    var grey_p_ok        = 'transparent transparent transparent rgb(102, 102, 102)';
    var orange_warning   = 'rgb(218, 97, 0)';
    var orange_p_warning = 'transparent transparent transparent rgb(218, 97, 0)';
    var red_alert        = 'rgb(255, 0, 0)';
    var red_p_alert      = 'transparent transparent transparent rgb(255, 0, 0)';

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
        name: '/cmdmotors',
        messageType: 'md49test/MotorCmd'
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
        if (key === key_gaze_left)
        {
            if (gazeValue !== 0) {
                gazeValue--;
                console.log("Turn sight to Left");
            }
            else {
                console.log("Max left position reached");
            }

        } else if (key === key_gaze_right) {
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

    //gaze direction with mouse clic on video
    //x and y are calculate but only x is used
    var screenGazeDirection = function (event) {
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

        // distance of the window 
        var window_elem = $("#div_cam3").position();
        var normX = $("#div_cam3").css('width');
        var normY = $("#div_cam3").css('height');
        //erase 'px' from norm and window_elem;
        normX = normX.substring(normX.length - 2, 0);
        normY = normY.substring(normY.length - 2, 0);

        var dx = (window_elem.left + normX / 2) - (x0 - window_elem.left);
        var rx = -dx * 127 / (normX / 2) + 128;

        var dy = (window_elem.top + normY / 2) - (y0 - window_elem.top);
        var ry = -dy * 127 / (normY / 2);
        
        if (rx > 255) {
            rx = 255;
        }
        if (rx < 0) {
            rx = 0;
        }
        if (ry > 255) {
            ry = 255;
        }
        if (ry < 0) {
            ry = 0;
        }
        //gazeValueY not yet implemented
        gazeValue =Math.round(rx);
        var gaze = new ROSLIB.Message({
            data: gazeValue
        });
        topic_gaze_direction.publish(gaze);
        console.log("gaze direction published " + gazeValue);
        
    };
    var mouse_event_gaze = document.getElementById('div_cam3');
    mouse_event_gaze.onclick = function (e) {
        e = e || window.event;
        screenGazeDirection(e);
    };

    //-------------------------------------------------------------------------
    //Angle_position
    var setHeadDirection = function (key) {

        //Key code
        //a 65
        //e 69
        elem = document.getElementById('triangle-up');
        if (key === key_head_left)
        {
            if (headDirection !== 0) {
                headDirection--;
                console.log("Turn head to Left");
            }
            else {
                console.log("Max left position reached");
                $('#indication_board').append("<p> Limite de rotation de la tête à gauche atteinte </p>");
            }

        } else if (key === key_head_right) {
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
        console.log("head direction published " + headDirection);
    };

    //-------------------------------------------------------------------------
    //Command_motor
    /** Object storing references to the remote screen DOM elements */
    this.remote = {
        div    : $('#remote'),
        left   : $('#remote-left'),
        right  : $('#remote-right'),
        up     : $('#remote-up'),
        down   : $('#remote-down'),
        head_l : $('#remote-left-head'),
        head_r : $('#remote-right-head'),
        move   : $('#remote-controls-mouse'),
        stop   : $('#remote-stop'),
        img    : $('#remote-img'),
        visible: false
    };

    var but = {};
    but[key_forward]    = this.remote.up;
    but[key_backward]   = this.remote.down;
    but[key_turn_left]  = this.remote.left;
    but[key_turn_right] = this.remote.right;
    but[key_stop]       = this.remote.stop;
    but[key_head_left]  = this.remote.head_l;
    but[key_head_right] = this.remote.head_r;
    var lastPressed     = this.remote.stop; // only one action at a time

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
        if (key === key_head_left || key === key_head_right) {
            console.log("Head Movement");
            setHeadDirection(key);
        } else {
            //Robot movement
            if (key === key_forward && move_up) {
                // up arrow
                console.log("up Arrow");
                speed1 = speed_max-speed_limit;
                speed2 = speed_max-speed_limit;
            } else if (key === key_backward && move_down) {
                // down arrow
                console.log("down Arrow");
                speed1 = speed_min+speed_limit;
                speed2 = speed_min+speed_limit;
            } else if (key === key_turn_left && turn_left) {
                // left arrow
                console.log("left Arrow");
                speed1 = speed_max-speed_limit;
                speed2 = speed_stop;
            } else if (key === key_turn_right && turn_right) {
                // right arrow
                console.log("right Arrow");
                speed1 = speed_stop;
                speed2 = speed_max-speed_limit;
            } else if (key === key_stop
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
            console.log("published " + key + " speed1 " + speed1 + " speed2 " + speed2);
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
        if (keyCode === key_forward || keyCode === key_backward
                || keyCode === key_turn_left
                || keyCode === key_turn_right || keyCode === key_stop) {
            e.preventDefault();
            clickButton(e.keyCode);
            //Gaze direction    
        } else if (keyCode === key_gaze_left || keyCode === key_gaze_right) {
            e.preventDefault();
            setGazeDirection(e.keyCode);
            //Head movement
        } else if (keyCode === key_head_left || keyCode === key_head_right) {
            e.preventDefault();
            setHeadDirection(e.keyCode);
        }
    }, false);

    // bind buttons clicks as well
    this.remote.left.click(clickButton.bind(null, key_turn_left));
    this.remote.right.click(clickButton.bind(null, key_turn_right));
    this.remote.up.click(clickButton.bind(null, key_forward));
    this.remote.down.click(clickButton.bind(null, key_backward));
    this.remote.stop.click(clickButton.bind(null, key_stop));
    this.remote.head_l.click(clickButton.bind(null, key_head_left));
    this.remote.head_r.click(clickButton.bind(null, key_head_right));

    //-------------------------------------------------------------------------
    // Control with mouse motion
    var mouseMotionCtrl = function mouseMotionCtrl(event) {
        
        // distance of the window 
        var normX = $("#remote-controls-mouse").css('width');
        var normY = $("#remote-controls-mouse").css('height');
        var window_elem = $("#remote-controls-mouse").position();
        //erase 'px' from norm
        normX = normX.substring(normX.length - 2, 0);
        normY = normY.substring(normY.length - 2, 0);

        var x0 = normX/2+ window_elem.left;
        var y0 = normY/2+ window_elem.top;
        
        mouse_event.onmousemove = function (event) {

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
            
            
            //TODO : calibrate and vérify calcul
            var rx1 = (dx + (normX/2))/normX;
            var rx2 = 1 - rx1;
            dy = (y0 - dy) * normY /255;
            var v = dy;
            
            console.log("X0 " + x0 +" Y0 "+ y0 +" rx1 "+ rx1+" rx2 " + rx2); 
            

            //process speed with ponderation
            speed1 = v * rx1;
            speed2 = v * rx2;
            //var rx1 = (dx + (normX/2))/normX;
            //var rx2 = 1 - rx1;
            //var dx12 = dx;
            //var dx13 = dy;
//            dx = dx -x0;
//            dy = dy - y0;
//            x0 = dx12;
//            y0 = dx13;
//            var moX = normX/2-dx;
//            var moY = normY/2-dy;
//            var mod = Math.sqrt(dx*dx + dy*dy);
            //var mod = Math.sqrt(moX*moX + moY*moY);
            //var rx1 = (x0 - dx) / (normX) * speed_limit;
            //var rx2 = (y0 - dy) / (normY) * speed_limit;

            //dy = (y0-event.y)*normY/255;
            //v = dy+128;
            
            //process speed with ponderation
//            console.log("dx " +dx + " dy " + dy + " mod " + mod); 
//            
//            var speed1 = 127*dx/mod*Math.cos(Math.atan(dy/dx));
//            var speed2 = 127*dy/mod*Math.sin(Math.atan(dy/dx));
            
            if (speed1 > speed_max-speed_limit) {
                speed1 = speed_max-speed_limit;
            }
            if (speed1 < speed_min+speed_limit) {
                speed1 = speed_min+speed_limit;
            }
            if (speed2 > speed_max-speed_limit) {
                speed2 = speed_max-speed_limit;
            }
            if (speed2 < speed_min+speed_limit) {
                speed2 = speed_min+speed_limit;
            }
            var msg = new ROSLIB.Message({
                speed1: Math.round(speed1),
                speed2: Math.round(speed2)
            });
            //Publish on Topic
            topic_cmd.publish(msg);
            console.log("published " + speed1 + " " + speed2);
        };
        mouse_event.onmouseup = function () {
            //document.onmousemove = null;
            return;
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
                $("#circle").css('color', red_alert);
                $("#circle").css('background', white_ok); // blanc
                $("#circle").css('border-color', red_alert);

            }
            else {
                boolClign = 0;
                $("#circle").css('color', white_ok);
                $("#circle").css('background', red_alert); // rouge
                $("#circle").css('border-color', white_ok);

            }
        };

        if (message.data) {
            //movement are prohibited and robot stop
            move_up    = false;
            move_down  = false;
            turn_left  = false;
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

            $("#up_possibility").css('color', red_alert);
            $("#down_possibility").css('color', red_alert);
            $("#left_possibility").css('color', red_alert);
            $("#right_possibility").css('color', red_alert);

        } else {
            $("#circle").css('color', green_ok);
            $("#circle").css('background', white_ok);
            $("#up_possibility").css('color', black_ok);
            $("#down_possibility").css('color', black_ok);
            $("#left_possibility").css('color', black_ok);
            $("#right_possibility").css('color', black_ok);
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
        if ($("#hug").css('color') === red_alert) {
            $("#hug").css('color', white_ok);
        }
        else {
            $("#hug").css('color', red_alert);
        }
    };


    topic_hug_event.subscribe(function (message) {
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
                $("#circle").css('background', white_ok);
            }
            else {
                boolClign = 0;
                $("#circle").css('background', orange_warning);
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
            $("#circle").css('background', white_ok);
        }
    });

    //-------------------------------------------------------------------------
    //Topic for proximity obstacles
    var topic_proximity_obstacles = new ROSLIB.Topic({
        ros: ros,
        name: '/proximity_obstacles',
        messageType: 'std_msgs/Float32MultiArray'
    });

    topic_proximity_obstacles.subscribe(function (message) {
        console.log('Received message on' + topic_proximity_obstacles.name + " " + message.data[0]
                + " " + message.data[1]
                + " " + message.data[2]
                + " " + message.data[3]
                + " " + message.data[4]
                + " " + message.data[5]
                + " " + message.data[6]
                + " " + message.data[7]);

        $("#proximity").css('border-color', grey_p_ok);
        $("#proximity_level1").css('border-color', grey_p_ok);
        $("#proximity1").css('border-color', grey_p_ok);
        $("#proximity1_level1").css('border-color', grey_p_ok);
        $("#proximity2").css('border-color', grey_p_ok);
        $("#proximity2_level1").css('border-color', grey_p_ok);
        $("#proximity3").css('border-color', grey_p_ok);
        $("#proximity3_level1").css('border-color', grey_p_ok);
        $("#proximity4").css('border-color', grey_p_ok);
        $("#proximity4_level1").css('border-color', grey_p_ok);
        $("#proximity5").css('border-color', grey_p_ok);
        $("#proximity5_level1").css('border-color', grey_p_ok);
        $("#proximity6").css('border-color', grey_p_ok);
        $("#proximity6_level1").css('border-color', grey_p_ok);
        $("#proximity7").css('border-color', grey_p_ok);
        $("#proximity7_level1").css('border-color', grey_p_ok);
        var find = false;
        for (var iter = 0; i < 8; iter++) {

            if (message.data[iter] < proximity_level1) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', green_p_ok);
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', green_p_ok);
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', green_p_ok);
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', green_p_ok);
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', green_p_ok);
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', green_p_ok);
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', green_p_ok);
                        break;
                    default :
                        $("#proximity7").css('border-color', green_p_ok);
                        break;
                }
            }
            if (message.data[iter] < proximity_level2) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', orange_p_warning);
                        $("#proximity_level1").css('border-color', green_p_ok);
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', orange_p_warning);
                        $("#proximity1_level1").css('border-color', green_p_ok);
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', orange_p_warning);
                        $("#proximity2_level1").css('border-color', green_p_ok);
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', orange_p_warning);
                        $("#proximity3_level1").css('border-color', green_p_ok);
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', orange_p_warning);
                        $("#proximity4_level1").css('border-color', green_p_ok);
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', orange_p_warning);
                        $("#proximity5_level1").css('border-color', green_p_ok);
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', orange_p_warning);
                        $("#proximity6_level1").css('border-color', green_p_ok);
                        break;
                    default :
                        $("#proximity7").css('border-color', orange_p_warning);
                        $("#proximity7_level1").css('border-color', green_p_ok);
                        break;
                }
            }
            if (message.data[iter] < proximity_level3) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', red_alert);
                        $("#proximity_level1").css('border-color', orange_p_warning);
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', red_p_alert);
                        $("#proximity1_level1").css('border-color', orange_p_warning);
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', red_p_alert);
                        $("#proximity2_level1").css('border-color', orange_p_warning);
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', red_p_alert);
                        $("#proximity3_level1").css('border-color', orange_p_warning);
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', red_p_alert);
                        $("#proximity4_level1").css('border-color', orange_p_warning);
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', red_p_alert);
                        $("#proximity5_level1").css('border-color', orange_p_warning);
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', red_p_alert);
                        $("#proximity6_level1").css('border-color', orange_p_warning);
                        break;
                    default :
                        $("#proximity7").css('border-color', red_p_alert);
                        $("#proximity7_level1").css('border-color', orange_p_warning);
                        break;
                }
            }
            if (message.data[iter] < proximity_level4) {
                switch (iter) {
                    case 0 :
                        $("#proximity").css('border-color', red_p_alert);
                        $("#proximity_level1").css('border-color', red_p_alert);
                        break;
                    case 1 :
                        $("#proximity1").css('border-color', red_p_alert);
                        $("#proximity1_level1").css('border-color', red_p_alert);
                        break;
                    case 2 :
                        $("#proximity2").css('border-color', red_p_alert);
                        $("#proximity2_level1").css('border-color', red_p_alert);
                        break;
                    case 3 :
                        $("#proximity3").css('border-color', red_p_alert);
                        $("#proximity3_level1").css('border-color', red_p_alert);
                        break;
                    case 4 :
                        $("#proximity4").css('border-color', red_p_alert);
                        $("#proximity4_level1").css('border-color', red_p_alert);
                        break;
                    case 5 :
                        $("#proximity5").css('border-color', red_p_alert);
                        $("#proximity5_level1").css('border-color', red_p_alert);
                        break;
                    case 6 :
                        $("#proximity6").css('border-color', red_p_alert);
                        $("#proximity6_level1").css('border-color', red_p_alert);
                        break;
                    default :
                        $("#proximity7").css('border-color', red_p_alert);
                        $("#proximity7_level1").css('border-color', red_p_alert);
                        break;
                }
                find = true;
                //allow movement with speed limit 
                speed_limit = speed_reduction;
                $('#indication_board').append("<p> Obstacle détecté à la position " + iter + " à la distance " + message.data[iter] + "</p>");
                //scroll le div à la fin 
                $('#indication_board').animate({scrollTop: $('#indication_board')[0].scrollHeight}, 1000);
            }
        }
        if (!find) {
            //allow movement with full speed (ie 100%)
            speed_limit = 0;
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
                $("#circle").css('background', white_ok); // blanc

            }
            else {
                boolClign = 0;
                $("#circle").css('background', orange_warning); // orange

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
                        $("#endline_alert").css('background', red_alert);
                        move_up = false;
                        turn_left = false;
                        $("#up_possibility").css('color', red_alert);
                        $("#left_possibility").css('color', red_alert);
                        break;
                    case 1 :
                        $("#endline_alert").css('background', red_alert);
                        move_up = false;
                        turn_right = false;
                        $("#up_possibility").css('color', red_alert);
                        $("#right_possibility").css('color', red_alert);
                        break;
                    case 2 :
                        $("#endline_alert1").css('background', red_alert);
                        move_up = false;
                        turn_left = false;
                        $("#up_possibility").css('color', red_alert);
                        $("#left_possibility").css('color', red_alert);
                        break;
                    case 3 :
                        $("#endline_alert1").css('background', red_alert);
                        move_down = false;
                        turn_right = false;
                        $("#down_possibility").css('color', red_alert);
                        $("#right_possibility").css('color', red_alert);
                        break;
                    case 4 :
                        $("#endline_alert2").css('background', red_alert);
                        move_down = false;
                        turn_right = false;
                        $("#down_possibility").css('color', red_alert);
                        $("#right_possibility").css('color', red_alert);
                        break;
                    case 5 :
                        $("#endline_alert2").css('background', red_alert);
                        move_down = false;
                        turn_left = false;
                        $("#down_possibility").css('color', red_alert);
                        $("#left_possibility").css('color', red_alert);
                        break;
                    case 6 :
                        $("#endline_alert3").css('background', red_alert);
                        move_down = false;
                        turn_right = false;
                        $("#down_possibility").css('color', red_alert);
                        $("#right_possibility").css('color', red_alert);
                        break;
                    default :
                        $("#endline_alert3").css('background', red_alert);
                        move_down = false;
                        turn_left = false;
                        $("#down_possibility").css('color', red_alert);
                        $("#left_possibility").css('color', red_alert);
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
            $("#endline_alert").css('background', red_alert);
            $("#endline_alert1").css('background', red_alert);
            $("#endline_alert2").css('background', red_alert);
            $("#endline_alert3").css('background', red_alert);
            $("#up_possibility").css('color', white_ok);
            $("#down_possibility").css('color', white_ok);
            $("#left_possibility").css('color', white_ok);
            $("#right_possibility").css('color', white_ok);
            $("#circle").css('background', white_ok);
        }
    });


    //-------------------------------------------------------------------------
    //Topic for bandwidth_quality	
    var topic_bandwidth_quality = new ROSLIB.Topic({
        ros: ros,
        name: '/bandwidth_quality',
        messageType: 'std_msgs/Byte'
    });

    //$("#proximity").css('border-color', grey_ok);
    topic_bandwidth_quality.subscribe(function (message) {
        console.log('Received message on' + topic_bandwidth_quality.name + + " " + message.data);

        $("#brandwith_quality_critical").css('background', green_ok);
        $("#brandwith_quality_low").css('background', green_ok);
        $("#brandwith_quality_medium").css('background', green_ok);
        $("#brandwith_quality_high").css('background', green_ok);

        if (message.data < brandwith_quality_L1) {
            $("#brandwith_quality_high").css('background', orange_warning);
        }
        if (message.data < brandwith_quality_L2) {
            $("#brandwith_quality_high").css('background', grey_ok);
        }
        if (message.data < brandwith_quality_L3) {
            $("#brandwith_quality_medium").css('background', orange_warning);
        }
        if (message.data < brandwith_quality_L4) {
            $("#brandwith_quality_medium").css('background', grey_ok);
        }
        if (message.data < brandwith_quality_L5) {
            $("#brandwith_quality_low").css('background', orange_warning);
            $("#brandwith_quality_critical").css('background', orange_warning);
        }
        if (message.data < brandwith_quality_L6) {
            $("#brandwith_quality_low").css('background', grey_ok);
            $("#brandwith_quality_critical").css('background', red_alert);
        }
        if (message.data < brandwith_quality_L7) {
            var boolClign;
            var clignotement = function () {
                if (boolClign === 0) {
                    boolClign = 1;
                    $("#brandwith_quality_critical").css('background', white_ok); 
                }
                else {
                    boolClign = 0;
                    $("#brandwith_quality_critical").css('background', red_alert); 
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