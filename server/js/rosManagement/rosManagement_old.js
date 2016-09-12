
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
    //====== Init the direction control======
    //=======================================
    //-------------------------------------------------------------------------
    var cameraCtrl = document.getElementById("cam");


//    console.log("taille " + normCamW + " " + normCamH);
//    var camTx = cameraCtrl.getContext("2d");

    var mouseCtrl = document.getElementById("mouse");
    var mouseTx = mouseCtrl.getContext("2d");
    mouseTx.beginPath();
    //left arrow
    mouseTx.moveTo(145, 75);
    mouseTx.lineTo(120, 75);
    mouseTx.lineTo(125, 70);
    mouseTx.moveTo(120, 75);
    mouseTx.lineTo(125, 80);
    //right arrow
    mouseTx.moveTo(145, 75);
    mouseTx.lineTo(168, 75);
    mouseTx.lineTo(164, 70);
    mouseTx.moveTo(168, 75);
    mouseTx.lineTo(164, 80);
    //up arrow
    mouseTx.moveTo(145, 75);
    mouseTx.lineTo(145, 60);
    mouseTx.lineTo(135, 65);
    mouseTx.moveTo(145, 60);
    mouseTx.lineTo(155, 65);
    //down arrow
    mouseTx.moveTo(145, 75);
    mouseTx.lineTo(145, 90);
    mouseTx.lineTo(135, 85);
    mouseTx.moveTo(145, 90);
    mouseTx.lineTo(155, 85);

    mouseTx.closePath();
    mouseTx.stroke();

    //-------------------------------------------------------------------------
    //=======================================
    //====== Connecting to ROS======
    //=======================================
    //-------------------------------------------------------------------------

    var ros;
    var topic_gaze_direction;
    var topic_cmd;
    var topic_angle_position;
    var topic_battery_level;
    var topic_collision;
    var topic_panic_event;
    var topic_hug_event;
    var topic_proximity_obstacles;
    var topic_bandwidth_quality;

    var xmlhttpros = new XMLHttpRequest();
    xmlhttpros.onreadystatechange = function () {
        if (xmlhttpros.readyState === 4 && xmlhttpros.status === 200) {
            config = JSON.parse(xmlhttpros.responseText);
            init_ros(config.signal.ros);
        }
    };
    xmlhttpros.open("GET", "../config.json", true);
    xmlhttpros.send(null);

    var init_ros = function (ip) {
        console.log("ip trouvée : " + ip);
        ros = new ROSLIB.Ros({
            //url : 'ws://localhost:9090'101
            url: ip
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
        // Publishers

        //Gaze direction
        topic_gaze_direction = new ROSLIB.Topic({
            ros: ros,
            name: '/gaze_direction',
            messageType: 'std_msgs/UInt8'
        });

        //Command motor
        topic_cmd = new ROSLIB.Topic({
            ros: ros,
            name: '/cmdmotors',
            messageType: 'md49test/MotorCmd'
        });

        //Head position
        topic_angle_position = new ROSLIB.Topic({
            ros: ros,
            name: '/angle_position',
            messageType: 'std_msgs/UInt8'
        });

        //-------------------------------------------------------------------------
        // Subscribers

        //Topic for battery_level
        topic_battery_level = new ROSLIB.Topic({
            ros: ros,
            name: '/battery_level',
            messageType: 'std_msgs/Byte'
        });

        //Topic for collision
        topic_collision = new ROSLIB.Topic({
            ros: ros,
            name: '/collision_event',
            messageType: 'std_msgs/Bool'
        });

        //Topic for panic event
        topic_panic_event = new ROSLIB.Topic({
            ros: ros,
            name: '/panic_event',
            messageType: 'std_msgs/Bool'
        });

        //Topic for hug event
        topic_hug_event = new ROSLIB.Topic({
            ros: ros,
            name: '/social_touch_event',
            messageType: 'std_msgs/Bool'
        });

        //Topic for proximity obstacles
        topic_proximity_obstacles = new ROSLIB.Topic({
            ros: ros,
            name: '/proximity_obstacles',
            messageType: 'md49test/Sonars'
        });

        //Topic for end_line_obstacles (not yet implemented)
//    var topic_end_line_obstacles = new ROSLIB.Topic({
//        ros: ros,
//        name: '/end_line_obstacles',
//        messageType: 'std_msgs/Int8MultiArray'
//    });

        //Topic for bandwidth_quality	
        topic_bandwidth_quality = new ROSLIB.Topic({
            ros: ros,
            name: '/wifi_quality',
            messageType: 'std_msgs/Int8'
        });

        var collision_periode = false;
        var wait_after_collision = 0;
        topic_collision.subscribe(function (message) {
            console.log('Received message on ' + topic_collision.name + ': ' + message.data);
            //get indication_board div and append the message only if there is a collision

            var boolClign = 1;
            var clignotement = function () {
                wait_after_collision++;
                if (boolClign === 0) {
                    boolClign = 1;
                    $("#circle").css('color', red_alert);
                    $("#circle").css('background', white_ok);
                    $("#circle").css('border-color', red_alert);

                }
                else {
                    boolClign = 0;
                    $("#circle").css('color', white_ok);
                    $("#circle").css('background', red_alert);
                    $("#circle").css('border-color', white_ok);

                }
            };

            if (message.data) {
                //movement are prohibited and robot stop
                console.log('COLLISION');
                move_up = true;
                move_down = true;
                turn_left = true;
                turn_right = true;
//            var speed1 = 0;
//            var speed2 = 0;
//            var msg = new ROSLIB.Message({
//                speed1: speed_stop,
//                speed2: speed_stop
//            });
//
//            current_speed1 = speed1;
//            current_speed2 = speed2;
//            topic_cmd.publish(msg);
                console.log("published : Emergency Stop");

                if (!collision_periode) {
                    collision_periode = setInterval(clignotement, 500);
                }

                $("#up_possibility").css('color', red_alert);
                $("#down_possibility").css('color', red_alert);
                $("#left_possibility").css('color', red_alert);
                $("#right_possibility").css('color', red_alert);

            } else {
                if (collision_periode) {
                    //if (wait_after_collision < 5) {
                    //    sleep(3000);
                    //}
                    clearInterval(collision_periode);
                    collision_periode = false;
                }
                wait_after_collision = 0;
                $("#circle").css('color', green_ok);
                $("#circle").css('background', white_ok);
                $("#circle").css('border-color', white_ok);
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


        });

        //-------------------------------------------------------------------------
        // Hug event control

        var hug_periode = false;
        topic_hug_event.subscribe(function (message) {
            console.log('Received message on ' + topic_hug_event.name);
            var clignotement = function () {
                if ($("#hug").css('color') === red_alert) {
                    $("#hug").css('color', black_ok);
                }
                else {
                    $("#hug").css('color', red_alert);
                }
            };

            var stop = function () {
                $("#hug").css('color', black_ok);
                hug_periode = false;
            }

            //TODO Add sound
            if (message.data) {
                if (!hug_periode) {
                    hug_periode = setInterval(clignotement, 500);
                    setTimeout(function () {
                        clearInterval(hug_periode);
                    }, 5000);
                    setTimeout(stop, 5001);
                }
            }
        });

        //-------------------------------------------------------------------------
        // Panic button event control

        var panic_periode = false;
        topic_panic_event.subscribe(function (message) {
            console.log('Received message on ' + topic_panic_event.name + " " + topic_panic_event.data);

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

            var stop = function () {
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

                panic_periode = false;
            }

            if (message.data === true) {
                //Stop the robot
//            var msg = new ROSLIB.Message({
//                speed1: speed_stop,
//                speed2: speed_stop
//            });
//            current_speed1 = 0;
//            current_speed2 = 0;
//            topic_cmd.publish(msg);
//            console.log("published : Panic Button");

                //movement are prohibited during 15s
                $("#up_possibility").css('color', red_alert);
                $("#down_possibility").css('color', red_alert);
                $("#left_possibility").css('color', red_alert);
                $("#right_possibility").css('color', red_alert);
                move_up = false;
                move_down = false;
                turn_left = false;
                turn_right = false;

                if (!panic_periode) {
                    panic_periode = setInterval(clignotement, 700);
                    setTimeout(function () {
                        clearInterval(panic_periode);
                    }, periode_of_panic_buton);
                    setTimeout(stop, periode_of_panic_buton + 1);
                }
            }

        });

        //-------------------------------------------------------------------------
        // Proximity obstacle event control
        var proximity_alert = false;
        topic_proximity_obstacles.subscribe(function (message) {
            console.log('Received message on' + topic_proximity_obstacles.name
                    + " " + message.x1
                    + " " + message.x2
                    + " " + message.x3
                    + " " + message.x4
                    + " " + message.x5
                    + " " + message.x6
                    + " " + message.x7
                    + " " + message.x8);

            var data = [message.x1, message.x2, message.x3, message.x4, message.x5, message.x6, message.x7, message.x8];
            //in case of sonar trouble
            if (message.x1 === 0) {
                data[0] = 255;
            }
            if (message.x2 === 0) {
                data[1] = 255;
            }
            if (message.x3 === 0) {
                data[2] = 255;
            }
            if (message.x4 === 0) {
                data[3] = 255;
            }
            if (message.x5 === 0) {
                data[4] = 255;
            }
            if (message.x6 === 0) {
                data[5] = 255;
            }
            if (message.x7 === 0) {
                data[6] = 255;
            }
            if (message.x8 === 0) {
                data[7] = 255;
            }
            //from top left in horloge cycle
            $("#proximity7").css('border-color', grey_p_ok);
            $("#proximity7_level2").css('border-color', grey_p_ok);
            $("#proximity5").css('border-color', grey_p_ok);
            $("#proximity5_level2").css('border-color', grey_p_ok);
            $("#proximity4").css('border-color', grey_p_ok);
            $("#proximity4_level2").css('border-color', grey_p_ok);
            $("#proximity6").css('border-color', grey_p_ok);
            $("#proximity6_level2").css('border-color', grey_p_ok);
            $("#proximity3").css('border-color', grey_p_ok);
            $("#proximity3_level2").css('border-color', grey_p_ok);
            $("#proximity2").css('border-color', grey_p_ok);
            $("#proximity2_level2").css('border-color', grey_p_ok);
            $("#proximity1").css('border-color', grey_p_ok);
            $("#proximity1_level2").css('border-color', grey_p_ok);
            $("#proximity").css('border-color', grey_p_ok);
            $("#proximity_level2").css('border-color', grey_p_ok);
            var find = false;
            for (var iter = 0; iter < 8; iter++) {

                if (data[iter] < proximity_level1) {
                    switch (iter) {
                        case 0 :
                            $("#proximity7").css('border-color', green_p_ok); //7
                            break;
                        case 1 :
                            $("#proximity6").css('border-color', green_p_ok); //5
                            break;
                        case 2 :
                            $("#proximity5").css('border-color', green_p_ok); //4
                            break;
                        case 3 :
                            $("#proximity4").css('border-color', green_p_ok); //6
                            break;
                        case 4 :
                            $("#proximity2").css('border-color', green_p_ok); //3
                            break;
                        case 5 :
                            $("#proximity1").css('border-color', green_p_ok); //2
                            break;
                        case 6 :
                            $("#proximity3").css('border-color', green_p_ok); //1
                            break;
                        default :
                            $("#proximity0").css('border-color', green_p_ok);  //0
                            break;
                    }
                }
                if (data[iter] < proximity_level2) {
                    switch (iter) {
                        case 0 :
                            $("#proximity7").css('border-color', orange_p_warning);
                            $("#proximity7_level2").css('border-color', green_p_ok);
                            break;
                        case 1 :
                            $("#proximity6").css('border-color', orange_p_warning);  //3
                            $("#proximity6_level2").css('border-color', green_p_ok);
                            break;
                        case 2 :
                            $("#proximity5").css('border-color', orange_p_warning);  //5
                            $("#proximity5_level2").css('border-color', green_p_ok);
                            break;
                        case 3 :
                            $("#proximity4").css('border-color', orange_p_warning);  //4
                            $("#proximity4_level2").css('border-color', green_p_ok);
                            break;
                        case 4 :
                            $("#proximity2").css('border-color', orange_p_warning);  //2
                            $("#proximity2_level2").css('border-color', green_p_ok);
                            break;
                        case 5 :
                            $("#proximity1").css('border-color', orange_p_warning);   //0
                            $("#proximity1_level2").css('border-color', green_p_ok);
                            break;
                        case 6 :
                            $("#proximity3").css('border-color', orange_p_warning);  //1
                            $("#proximity3_level2").css('border-color', green_p_ok);
                            break;
                        default :
                            $("#proximity").css('border-color', orange_p_warning);   //6
                            $("#proximity_level2").css('border-color', green_p_ok);
                            break;
                    }
                }
                if (data[iter] < proximity_level3) {
                    switch (iter) {
                        case 0 :
                            $("#proximity7").css('border-color', red_alert);
                            $("#proximity7_level2").css('border-color', orange_p_warning);
                            break;
                        case 1 :
                            $("#proximity6").css('border-color', red_p_alert);
                            $("#proximity6_level2").css('border-color', orange_p_warning);
                            break;
                        case 2 :
                            $("#proximity5").css('border-color', red_p_alert);
                            $("#proximity5_level2").css('border-color', orange_p_warning);
                            break;
                        case 3 :
                            $("#proximity4").css('border-color', red_p_alert);
                            $("#proximity4_level2").css('border-color', orange_p_warning);
                            break;
                        case 4 :
                            $("#proximity2").css('border-color', red_p_alert);
                            $("#proximity2_level2").css('border-color', orange_p_warning);
                            break;
                        case 5 :
                            $("#proximity1").css('border-color', red_p_alert);
                            $("#proximity1_level2").css('border-color', orange_p_warning);
                            break;
                        case 6 :
                            $("#proximity3").css('border-color', red_p_alert);
                            $("#proximity3_level2").css('border-color', orange_p_warning);
                            break;
                        default :
                            $("#proximity").css('border-color', red_p_alert);
                            $("#proximity_level2").css('border-color', orange_p_warning);
                            break;
                    }
                }
                if (data[iter] < proximity_level4) {
                    switch (iter) {
                        case 0 :
                            $("#proximity7").css('border-color', red_p_alert);
                            $("#proximity7_level2").css('border-color', red_p_alert);
                            break;
                        case 1 :
                            $("#proximity6").css('border-color', red_p_alert);
                            $("#proximity6_level2").css('border-color', red_p_alert);
                            break;
                        case 2 :
                            $("#proximity5").css('border-color', red_p_alert);
                            $("#proximity5_level2").css('border-color', red_p_alert);
                            break;
                        case 3 :
                            $("#proximity4").css('border-color', red_p_alert);
                            $("#proximity4_level2").css('border-color', red_p_alert);
                            break;
                        case 4 :
                            $("#proximity2").css('border-color', red_p_alert);
                            $("#proximity2_level2").css('border-color', red_p_alert);
                            break;
                        case 5 :
                            $("#proximity1").css('border-color', red_p_alert);
                            $("#proximity1_level2").css('border-color', red_p_alert);
                            break;
                        case 6 :
                            $("#proximity3").css('border-color', red_p_alert);
                            $("#proximity3_level2").css('border-color', red_p_alert);
                            break;
                        default :
                            $("#proximity").css('border-color', red_p_alert);
                            $("#proximity_level2").css('border-color', red_p_alert);
                            break;
                    }
                    find = true;
                    //allow movement with speed limit 
                    if (!proximity_alert) {
                        speed_limit = Math.round(speed_reduction * current_speed_max / speed_max);

                        proximity_alert = true;
                        var speed1 = speed_stop;
                        var speed2 = speed_stop;
                        if (current_speed1 > speed_stop) {
                            speed1 = current_speed1 - speed_limit;
                        } else if (current_speed1 < speed_stop) {
                            speed1 = current_speed1 + speed_limit;
                        }
                        if (current_speed2 > speed_stop) {
                            speed2 = current_speed2 - speed_limit;
                        } else if (current_speed1 < speed_stop) {
                            speed2 = current_speed2 + speed_limit;
                        }
                        $("#circle").css('background', orange_warning);
                        $("#up_possibility").css('color', orange_warning);
                        $("#down_possibility").css('color', orange_warning);
                        $("#left_possibility").css('color', orange_warning);
                        $("#right_possibility").css('color', orange_warning);
                        current_speed2 = speed2;
                        current_speed1 = speed1;

                        var msg = new ROSLIB.Message({
                            speed1: speed1,
                            speed2: speed2
                        });
                        topic_cmd.publish(msg);
                    }

                }
            }
            if (!find) {
                //allow movement with full speed (ie 100%)
                $("#circle").css('background', white_ok);
                if (!gamePad) {
                    $("#up_possibility").css('color', black_ok);
                    $("#down_possibility").css('color', black_ok);
                    $("#left_possibility").css('color', black_ok);
                    $("#right_possibility").css('color', black_ok);
                } else {
                    $("#up_possibility").css('color', orange_warning);
                    $("#down_possibility").css('color', orange_warning);
                    $("#left_possibility").css('color', orange_warning);
                    $("#right_possibility").css('color', orange_warning);
                }
                speed_limit = 0;
                proximity_alert = false;

            }
        });


        //-------------------------------------------------------------------------
        // Bandwith quality event control

        var periode_brandwith;
        topic_bandwidth_quality.subscribe(function (message) {
            console.log('Received message on' + topic_bandwidth_quality.name + +" " + message.data);

            $("#brandwith_quality_critical").css('background', green_ok);
            $("#brandwith_quality_low").css('background', green_ok);
            $("#brandwith_quality_medium").css('background', green_ok);
            $("#brandwith_quality_high").css('background', green_ok);

            if (message.data < brandwith_quality_L1) {
                $("#brandwith_quality_high").css('background', green_warning);
            }
            if (message.data < brandwith_quality_L2) {
                $("#brandwith_quality_high").css('background', grey_ok);
            }
            if (message.data < brandwith_quality_L3) {
                $("#brandwith_quality_medium").css('background', green_warning);
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
                var boolClign = 0;
                var clignotement = function () {
                    if (boolClign === 0) {
                        boolClign = 1;
                        $("#brandwith_quality_critical").css('background', grey_ok);
                    }
                    else {
                        boolClign = 0;
                        $("#brandwith_quality_critical").css('background', red_alert);
                    }
                };
                periode_brandwith = setInterval(clignotement, periode_of_brandwith);
            } else {
                clearInterval(periode_brandwith);
            }

        });

        //-------------------------------------------------------------------------
        // battery level control

        topic_battery_level.subscribe(function (message) {
            console.log('Received message on' + topic_battery_level.name);
            console.log('Battery value ' + message.data);

            //Update the battery view in room_user.html
            var level = parseInt(message.data) / battery_max * 100;
            var batteryLevel = $('#battery-level');
            batteryLevel.css('width', level + '%');
            if (level > battery_level2) {
                batteryLevel.addClass('high');
                batteryLevel.removeClass('medium');
                batteryLevel.removeClass('low');
            } else if (level <= battery_level2 && level > battery_level1) {
                batteryLevel.addClass('medium');
                batteryLevel.removeClass('high');
                batteryLevel.removeClass('low');
            } else {
                batteryLevel.addClass('low');
                batteryLevel.removeClass('high');
                batteryLevel.removeClass('medium');
            }
        });


//-------------------------------------------------------------------------
        // End line obstacle event control
        // /!\ not yet implemented and tested

//    topic_end_line_obstacles.subscribe(function (message) {
//        console.log('Received message on' + topic_end_line_obstacles.name);
//
//        var boolClign;
//        var clignotement = function () {
//            if (boolClign === 0) { // Si rouge
//                boolClign = 1;
//                $("#circle").css('background', white_ok); // blanc
//
//            }
//            else {
//                boolClign = 0;
//                $("#circle").css('background', orange_warning); // orange
//
//            }
//        };
//        find = false;
//        //on parcourt les 8 capteurs
//        for (var iter = 0; iter < 8; iter++) {
//            if (message.data[iter]) {
//                find = true;
//                //Stop the robot
//                var msg = new ROSLIB.Message({
//                    speed1: speed_stop,
//                    speed2: speed_stop
//                });
//                topic_cmd.publish(msg);
//                console.log("published : End line obstacles");
//                periode = setInterval(clignotement, 500);
//                switch (iter) {
//                    case 0 :
//                        $("#endline_alert").css('background', red_alert);
//                        move_up = false;
//                        turn_left = false;
//                        $("#up_possibility").css('color', red_alert);
//                        $("#left_possibility").css('color', red_alert);
//                        break;
//                    case 1 :
//                        $("#endline_alert").css('background', red_alert);
//                        move_up = false;
//                        turn_right = false;
//                        $("#up_possibility").css('color', red_alert);
//                        $("#right_possibility").css('color', red_alert);
//                        break;
//                    case 2 :
//                        $("#endline_alert1").css('background', red_alert);
//                        move_up = false;
//                        turn_left = false;
//                        $("#up_possibility").css('color', red_alert);
//                        $("#left_possibility").css('color', red_alert);
//                        break;
//                    case 3 :
//                        $("#endline_alert1").css('background', red_alert);
//                        move_down = false;
//                        turn_right = false;
//                        $("#down_possibility").css('color', red_alert);
//                        $("#right_possibility").css('color', red_alert);
//                        break;
//                    case 4 :
//                        $("#endline_alert2").css('background', red_alert);
//                        move_down = false;
//                        turn_right = false;
//                        $("#down_possibility").css('color', red_alert);
//                        $("#right_possibility").css('color', red_alert);
//                        break;
//                    case 5 :
//                        $("#endline_alert2").css('background', red_alert);
//                        move_down = false;
//                        turn_left = false;
//                        $("#down_possibility").css('color', red_alert);
//                        $("#left_possibility").css('color', red_alert);
//                        break;
//                    case 6 :
//                        $("#endline_alert3").css('background', red_alert);
//                        move_down = false;
//                        turn_right = false;
//                        $("#down_possibility").css('color', red_alert);
//                        $("#right_possibility").css('color', red_alert);
//                        break;
//                    default :
//                        $("#endline_alert3").css('background', red_alert);
//                        move_down = false;
//                        turn_left = false;
//                        $("#down_possibility").css('color', red_alert);
//                        $("#left_possibility").css('color', red_alert);
//                        break;
//
//                }
//                break;
//            }
//
//        }
//        if (!find) {
//            move_up = true;
//            move_down = true;
//            turn_left = true;
//            turn_right = true;
//            $("#endline_alert").css('background', red_alert);
//            $("#endline_alert1").css('background', red_alert);
//            $("#endline_alert2").css('background', red_alert);
//            $("#endline_alert3").css('background', red_alert);
//            $("#up_possibility").css('color', white_ok);
//            $("#down_possibility").css('color', white_ok);
//            $("#left_possibility").css('color', white_ok);
//            $("#right_possibility").css('color', white_ok);
//            $("#circle").css('background', white_ok);
//        }
//    });

    };
    
    //-------------------------------------------------------------------------
    //============================================================
    //=============Global Variables and Constant======
    //============================================================
    //-------------------------------------------------------------------------

    //allow or not movement (if collision,panic_button,...)
    var move_up = true;
    var move_down = true;
    var turn_left = true;
    var turn_right = true;

    //interval of speed
    var speed_max = 127;
    var speed_stop = 0;
    var speed_min = -127;
    var current_speed_max = speed_max;
    var current_speed_min = speed_min;
    var current_angle = Math.PI/2;

    //current speed
    var current_speed1 = speed_stop;
    var current_speed2 = speed_stop;

    //limit of speed in case proximity (ie 100% = 0)
    var speed_limit = 0;
    //max speed - speed reduction = speed limit
    var speed_reduction = 50;
    var speed_stop_delay = 20;

    //Default keyboard control
    var key_stop = 83;       //'s' 
    var key_forward = 38;    // arrow up
    var key_backward = 40;   // arrow down
    var key_turn_left = 37;  // arrow left
    var key_turn_right = 39; // arrow right
    var key_gaze_left = 81;  //'q'
    var key_gaze_right = 68; //'d'
    var key_head_left = 65;  //'a'
    var key_head_right = 69; //'e'
    var key_speed_up = 80;   //+ P
    var key_speed_down = 77; //- M
    var key_hud = 72;  //h

    //allow hud for showing line direction
    var hud_activated = false;

    //initial Gaze_direction [0,255]
    var gaze_max = 256;
    var gaze_min = 0;
    //in this case 127
    var gaze_front_value = 128;
    var gaze_value = gaze_front_value;
    //In this case 8 possibility whith 64 degres by increments or decrements
    var gaze_increment = 32;
    //55 100 101 155 200 255

    //initial Head_Direction [0,180]
    var head_max = 180;
    var head_min = 0;
    var head_front_direction = 90;
    var head_direction = head_front_direction;
    //In this case 36 possibility whith 5 degres by increments or decrements
    //pas de
    var head_increment = 5;

    //proximity level in centimeter in [0,255]
    var proximity_level1 = 90;
    var proximity_level2 = 80;
    var proximity_level3 = 70;
    var proximity_level4 = 60;

    //max battery level
    var battery_max = 24;
    //battery level in percent of battery_max
    var battery_level2 = Math.round(battery_max * 0.5);
    var battery_level1 = Math.round(battery_max * 0.25);

    //brandwith quality level [60,100]
    var brandwith_quality_L7 = 65;
    var brandwith_quality_L6 = 70;
    var brandwith_quality_L5 = 75;
    var brandwith_quality_L4 = 80;
    var brandwith_quality_L3 = 85;
    var brandwith_quality_L2 = 90;
    var brandwith_quality_L1 = 95;

    //in ms
    var periode_of_brandwith = 500;
    var periode_of_panic_buton = 15000;
    var periode_of_gaze_reset = 30000;
    var periode_of_send_speed = 200;

    //define normal/warning/alert color
    var white_ok = 'rgb(255, 255, 255)';
    var black_ok = 'rgb(0, 0, 0)';
    var green_ok = 'rgb(0, 200, 0)';
    var yellow_ok = 'rgb(255, 204, 0)';
    var green_p_ok = 'transparent transparent transparent rgb(0, 85, 0)';
    var grey_ok = 'rgb(102, 102, 102)';
    var grey_p_ok = 'transparent transparent transparent rgb(102, 102, 102)';
    var green_warning = 'rgb(0, 85, 0)';
    var orange_warning = 'rgb(218, 97, 0)';
    var orange_p_warning = 'transparent transparent transparent rgb(218, 97, 0)';
    var red_alert = 'rgb(255, 0, 0)';
    var red_p_alert = 'transparent transparent transparent rgb(255, 0, 0)';

    //-------------------------------------------------------------------------
    //============================================================
    //==================Topics declaration==================
    //============================================================
    //-------------------------------------------------------------------------


    

    //-------------------------------------------------------------------------
    //============================================================
    //==================Publisher============================
    //============================================================

    var setLine = function () {
        if (!hud_activated) {
            var normCamW = $("#div_cam3").css('width');
            var normCamH = $("#div_cam3").css('height');
            normCamW = normCamW.substring(normCamW.length - 2, 0);
            normCamH = normCamH.substring(normCamH.length - 2, 0);
            cameraCtrl.width = (normCamW - 10) * 0.8;
            cameraCtrl.height = normCamH - 16;
            hud_activated = true;
            affichStatement(head_front_direction - head_direction,current_speed1,current_speed2);
        } else {
            var camTx = cameraCtrl.getContext("2d");
            camTx.clearRect(0, 0, cameraCtrl.width, cameraCtrl.height);
            hud_activated = false;
        }
    };

    var affichStatement = function (angle, speed1, speed2,theta) {
        if (hud_activated) {
            var camTx = cameraCtrl.getContext("2d");
            var currentW = cameraCtrl.width * 0.8;
            var currentH = cameraCtrl.height * 1.3;
            var middleH = (currentH / 2);
            var middleW = (currentW / 2);
            var angle2 = angle + 90;
            angle = -angle - 270;

            camTx.clearRect(0, 0, cameraCtrl.width, cameraCtrl.height);
            
            var xFirst = middleH + 220 * Math.cos(angle2 * Math.PI / 180) + 20;
            var yFirst = middleW + 150 - 150 * Math.sin(angle * Math.PI / 180) ;
            var xFirst2 = xFirst;
            var yFirst2 = yFirst;
            if ( theta === Math.PI) {
                xFirst = 0;
                yFirst = currentW - 40;
                yFirst2 = yFirst2 + 50;
            }
            
            camTx.beginPath();
            camTx.moveTo(xFirst,yFirst); 

            camTx.quadraticCurveTo(xFirst2,
                yFirst2, 
                middleH + 20, 
                currentW - 40);
            if ((speed1>=0 && speed2>=0) ||(speed1>0 && speed2<0 && speed1>=-speed2)
                    ||(speed1<0 && speed2>0 && speed2>=-speed1)) {
                camTx.strokeStyle = 'rgba(0,127,0,0.5)';
            } else {
                camTx.strokeStyle = 'rgba(127,0,0,0.5)';
            }
            camTx.lineWidth = 15;
            camTx.stroke();
        }

    };

    var affichLine = function () {
        var camTx = cameraCtrl.getContext("2d");
        var currentW = cameraCtrl.width * 0.8;
        var currentH = cameraCtrl.height * 1.3;
        var middleH = (currentH / 2);
        var middleW = (currentW / 2);

        var courbe = 140;
        var courbe2 = 280;
        var courbe3 = 40;

        //lignes
        camTx.beginPath();
        camTx.moveTo(middleH - 80 + courbe2, middleW + 50);
        camTx.quadraticCurveTo(middleH - 80 + courbe2 - courbe, middleW + 50, middleH - 200, currentW - 20);
        camTx.strokeStyle = 'rgba(127,0,0,0.5)';
        camTx.lineWidth = 15;
        camTx.stroke();

        camTx.beginPath();
        camTx.moveTo(middleH + 80 + courbe2, middleW + 50);
        camTx.quadraticCurveTo(middleH + 80 + courbe, middleW + 50 + courbe3, middleH + 200 - courbe / 2, currentW - 20);
        camTx.strokeStyle = 'rgba(127,0,0,0.5)';
        camTx.lineWidth = 15;
        camTx.stroke();

        camTx.beginPath();
        camTx.moveTo(middleH - 185, currentW - 20);
        camTx.quadraticCurveTo(middleH - 65 + courbe2 - courbe, middleW + 50, middleH - 65 + courbe2, middleW + 50);
        camTx.lineTo(middleH + 65 + courbe2, middleW + 50);
        camTx.quadraticCurveTo(middleH + 65 + courbe, middleW + 50 + courbe3, middleH + 185 - courbe / 2, currentW - 20);
        camTx.fillStyle = 'rgba(0,100,0,0.3)';
        camTx.closePath();
        camTx.fill();



    };

    var setCurrentSpeed = function () {

        var msg = new ROSLIB.Message({
            speed1: current_speed1,
            speed2: current_speed2
        });

        topic_cmd.publish(msg);
        console.log("published  speed1 " + current_speed1 + " speed2 " + current_speed2);
    };


    var stop_periode;
    var sendStop = function () {
        current_speed1 = speed_stop;
        current_speed2 = speed_stop;
        var msg = new ROSLIB.Message({
            speed1: speed_stop,
            speed2: speed_stop
        });

        topic_cmd.publish(msg);
        console.log("published  stop motors");
    };

    //-------------------------------------------------------------------------
    //Gaze_direction

    var gaze_default_position = 6;
    var gaze_current_position = 0;
    //function called after 30s of setting gaze direction
    var resetGazeDirection = function () {
        gaze_value = gaze_front_value;
        var gaze = new ROSLIB.Message({
            data: Math.round(gaze_value)
        });
        gaze_current_position += 2;
        $('#gaze-dir').css('margin-left', gaze_default_position);
        $('#gaze-dir').css('background', black_ok);
        $('#gaze').css('border-color', black_ok);
        console.log("gaze direction published 127");
        topic_gaze_direction.publish(gaze);
        gaze_timeout = false;
    };

    var gaze_timeout = false;
    var setGazeDirection = function (key) {


        //Key code
        //q 81
        //d 68
        if (key === key_gaze_left)
        {
            if (gaze_value - gaze_increment >= gaze_min) {
                gaze_value -= gaze_increment;
                gaze_current_position -= 2;
                $('#gaze-dir').css('margin-left', gaze_default_position + gaze_current_position);
                $('#gaze-dir').css('background', green_ok);
                $('#gaze').css('border-color', green_ok);
                console.log("Turn sight to Left ");
            }
            else {
                console.log("Max left position reached");
                gaze_value = gaze_min;
            }

        } else if (key === key_gaze_right) {
            if (gaze_value + gaze_increment <= gaze_max - 1) {
                gaze_value += gaze_increment;
                gaze_current_position += 2;
                $('#gaze-dir').css('margin-left', gaze_default_position + gaze_current_position);
                $('#gaze-dir').css('background', green_ok);
                $('#gaze').css('border-color', green_ok);
                console.log("Turn sight to Right");
            }
            else {
                console.log("Max right position reached");
                gaze_value = gaze_max;
            }

        }

        if (gaze_value > gaze_max - 1) {
            gaze_value = gaze_max - 1;
        }
        if (gaze_value < gaze_min) {
            gaze_value = gaze_min;
        }

        //prepare reset of gaze reset
        if (!gaze_timeout) {
            gaze_timeout = setTimeout(resetGazeDirection, periode_of_gaze_reset);
        } else {
            clearTimeout(gaze_timeout);
            gaze_timeout = setTimeout(resetGazeDirection, periode_of_gaze_reset);
        }

        var gaze = new ROSLIB.Message({
            data: Math.round(gaze_value)
        });
        topic_gaze_direction.publish(gaze);
        console.log("gaze direction published " + gaze_value);

    };

    //gaze direction with mouse clic on video
    //x and y are calculate but only x is used
    //TODO calculate great gaze
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
        //erase 'px' from norm string;
        normX = normX.substring(normX.length - 2, 0);
        normY = normY.substring(normY.length - 2, 0);

        var dx = (window_elem.left + normX / 2) - (x0 - window_elem.left);
        var rx = -dx * gaze_front_value / (normX / 2) + gaze_front_value;

        var dy = (window_elem.top + normY / 2) - (y0 - window_elem.top);
        var ry = -dy * gaze_front_value / (normY / 2) + gaze_front_value;

        if (rx > gaze_max) {
            rx = gaze_max;
        }
        if (rx < gaze_min) {
            rx = gaze_min;
        }
        if (ry > gaze_max) {
            ry = gaze_max;
        }
        if (ry < gaze_min) {
            ry = gaze_min;
        }

        //prepare reset of gaze reset
        if (!gaze_timeout) {
            gaze_timeout = setTimeout(resetGazeDirection, periode_of_gaze_reset);
        } else {
            clearTimeout(gaze_timeout);
            gaze_timeout = setTimeout(resetGazeDirection, periode_of_gaze_reset);
        }

        //gaze_valueY not yet implemented
        gaze_value = Math.round(rx);
        var gaze = new ROSLIB.Message({
            data: Math.round(gaze_value)
        });
        topic_gaze_direction.publish(gaze);
        console.log("gaze direction published " + Math.round(gaze_value));

    };
    var mouse_event_gaze = document.getElementById('div_cam3');
    mouse_event_gaze.onclick = function (e) {
        e = e || window.event;
        screenGazeDirection(e);
    };

    //-------------------------------------------------------------------------
    // Head rotation

    //indication of head rotation
    var setHeadIndication = function (key) {
        var angle = head_front_direction - key;
        var string1 = "'" + "rotate(" + Math.round(angle) + "deg)'";
        //remove  "" from string
        affichStatement(Math.round(angle),current_speed1,current_speed2,current_angle);
        var string2 = string1.substring(string1.length - 2, 1);
        $('#triangle-up').css('transform', string2);
    };

    // head rotation command
    var setHeadDirection = function (key) {

        //Key code
        //a 65
        //e 69
        elem = document.getElementById('triangle-up');
        if (key === key_head_left)
        {
            if (head_direction < head_max + head_increment) {
                head_direction += head_increment;
                console.log("Turn head to Left");
            }
            else {
                console.log("Max left position reached");
                head_direction = head_max;
            }

        } else if (key === key_head_right) {
            if (head_direction > head_min - head_increment) {
                head_direction -= head_increment;
                console.log("Turn head to Right");
            }
            else {
                console.log("Max right position reached");
                head_direction = head_min;
            }

        }
        if (head_direction > head_max) {
            head_direction = head_max;
        }
        if (head_direction < head_min) {
            head_direction = head_min;
        }
        //change the head indication
        setHeadIndication(head_direction);

        console.log(head_direction);
        var head = new ROSLIB.Message({
            data: Math.round(head_direction)
        });
        topic_angle_position.publish(head);
        console.log("head direction published " + head_direction);
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
    but[key_forward] = this.remote.up;
    but[key_backward] = this.remote.down;
    but[key_turn_left] = this.remote.left;
    but[key_turn_right] = this.remote.right;
    but[key_stop] = this.remote.stop;
    but[key_head_left] = this.remote.head_l;
    but[key_head_right] = this.remote.head_r;
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
        if (key === key_head_left || key === key_head_right) {
            console.log("Head Movement");
            setHeadDirection(key);
        } else {

            //Robot movement
            if (key === key_forward && move_up) {
                // up arrow
                console.log("up Arrow");
                current_angle  = Math.PI/2;
                speed1 = current_speed_max - speed_limit;
                speed2 = current_speed_max - speed_limit;
            } else if (key === key_backward && move_down) {
                // down arrow
                current_angle  = 3*Math.PI/2;
                console.log("down Arrow");
                speed1 = current_speed_min + speed_limit;
                speed2 = current_speed_min + speed_limit;
            } else if (key === key_turn_left && turn_left) {
                // left arrow
                console.log("left Arrow");
                current_angle  = Math.PI;
                speed2 = current_speed_max - speed_limit;
                speed1 = current_speed_min + speed_limit;
            } else if (key === key_turn_right && turn_right) {
                // right arrow
                console.log("right Arrow");
                current_angle  = 0;
                speed2 = current_speed_min + speed_limit;
                speed1 = current_speed_max - speed_limit;
            } else if (key === key_stop
                    || !move_up
                    || !move_down
                    || !turn_left
                    || !turn_right) {
                // 's' key -> stop
                current_angle  = Math.PI/2;
                console.log("'s' key (Stop)");
                speed1 = speed_stop;
                speed2 = speed_stop;
            }

            if (speed1 === speed_stop && speed2 === speed_stop) {
                stop_periode = setInterval(sendStop, speed_stop_delay);
                setTimeout(function () {
                    clearInterval(stop_periode);
                    stop_periode = false;
                }, speed_stop_delay * 3 + 1);
            } else {
                var msg = new ROSLIB.Message({
                    speed1: speed1,
                    speed2: speed2
                });
                //Publish on Topic
                current_speed1 = speed1;
                current_speed2 = speed2;
                
                affichStatement(head_front_direction-head_direction,current_speed1,current_speed2,current_angle);
                topic_cmd.publish(msg);
                console.log("published " + key + " speed1 " + speed1 + " speed2 " + speed2);
            }
        }
    };

    //-------------------------------------------------------------------------
    //Keyboard control : - arrow for robot movement
    //                   - 's' for STOP
    //                   - 'q' and 'd' for gaze direction
    //                   - 'a' and 'e' for head direction
    //                   - '+' and '-' for speed limitation
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
            //speed configuration
        } else if (keyCode === key_speed_up || keyCode === key_speed_down) {
            e.preventDefault();
            setSpeedLimit(e.keyCode);
            //drawing line
        } else if (keyCode === key_hud) {
            setLine();
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


    var setSpeedLimit = function (key) {
        if (key === key_speed_up) {
            if (current_speed_max + 8 <= speed_max) {
                current_speed_max += 8;
                current_speed_min -= 8;
                var level = current_speed_max / speed_max * 100;
                $('#speed-level').css('width', level + '%');
                console.log("speed up");
            }
        } else {
            if (current_speed_max - 8 >= speed_stop) {
                current_speed_max -= 8;
                current_speed_min += 8;
                var level = current_speed_max / speed_max * 100;
                $('#speed-level').css('width', level + '%');
                console.log("speed down");
            }
        }
    };

    //-------------------------------------------------------------------------
    // Control with mouse motion


    //allow/disable mouse control by clicdown on mouse pad
    var mouse_event_enter = false;
    // bind mouse
    var mouse_event = document.getElementById('remote-controls-mouse');
    mouse_event.onmousedown = function (e) {
        e = e || window.event;
        if (mouse_event_enter === false) {
            mouse_event_enter = true;
            $("#remote-controls-mouse").css('background-color', green_ok);
            if (!movement) {
                movement = setInterval(setCurrentSpeed, periode_of_send_speed);
            }
            mouseMotionCtrl(e);
        } else {
            exitMouseCtrl();
        }
    };
    //stop the robot and disable mouse control when click is up or pointer exit area
    var exitMouseCtrl = function () {
        $("#remote-controls-mouse").css('background-color', white_ok);
        mouse_event_enter = false;
        clearInterval(movement);
        movement = false;
        stop_periode = setInterval(sendStop, speed_stop_delay);
        setTimeout(function () {
            clearInterval(stop_periode);
            stop_periode = false;
        }, speed_stop_delay * 3 + 1);


    };


    //fonction which calculate robot movement with mouse control
    var mouseMotionCtrl = function mouseMotionCtrl() {

        // distance of the window 
        var normX = $("#remote-controls-mouse").css('width');
        var normY = $("#remote-controls-mouse").css('height');
        var window_elem = $("#remote-controls-mouse").offset();
        //erase 'px' from norm
        normX = normX.substring(normX.length - 2, 0);
        normY = normY.substring(normY.length - 2, 0);

        var kx = 2 * current_speed_max / normX;
        var ky = 2 * current_speed_max / normY;

        var x0 = normX / 2 + window_elem.left;
        var y0 = normY / 2 + window_elem.top;

        //stop mouse control if pointer exit the area
        mouse_event.onmouseout = function () {
            if (mouse_event_enter === true) {
                exitMouseCtrl();
            }
        };

        //stop mouse control left button is up
        mouse_event.onmouseup = function () {
            if (mouse_event_enter === true) {
                exitMouseCtrl();
            }
        };

        //allow mouse control on area
        mouse_event.onmousemove = function (event) {
            if (mouse_event_enter === true) {

                var x;
                var y;
                if (event.x !== undefined && event.y !== undefined)
                {
                    x = event.x;
                    y = event.y;
                }
                else // Firefox method to get the position
                {
                    x = event.clientX + document.body.scrollLeft +
                            document.documentElement.scrollLeft;
                    y = event.clientY + document.body.scrollTop +
                            document.documentElement.scrollTop;
                }


                var dx = x - x0;
                var dy = -(y - y0);

                var theta = Math.atan(dy / dx); // En radian
                if (dx <= 0 && dy >= 0) {
                    theta = theta + Math.PI;
                } else if (dx <= 0 && dy <= 0) {
                    theta = theta + Math.PI;
                } else if (dx >= 0 && dy <= 0) {
                    theta = theta + 2 * Math.PI;
                }

                var v, speed1, speed2;

                if (theta >= 0 && theta <= Math.PI / 2) { // 1er cadran
                    if (theta <= Math.PI / 4) { // 1ère moitié du 1er cadran
                        v = dx * kx;
                        speed1 = v * Math.sin(theta + Math.PI / 4);
                        speed2 = v * Math.sin(theta * 2 - Math.PI / 4);
                    } else {
                        v = dy * ky;
                        speed1 = v;
                        speed2 = v * Math.sin(theta);
                    }

                } else if (theta > Math.PI / 2 && theta <= Math.PI) { // 2ème cadran
                    if (theta <= 3 * Math.PI / 4) { // 1ère moitié du 2ème cadran
                        v = dy * ky;
                        speed1 = v * Math.sin(theta);
                        speed2 = v;
                    } else {
                        v = -dx * kx;
                        speed1 = v * Math.sin(theta * 2 - 3 * Math.PI / 4);
                        speed2 = v * Math.sin(theta - Math.PI / 4);
                    }

                } else if (theta > Math.PI && theta <= 3 * Math.PI / 2) { // 3ème cadran
                    if (theta <= 5 * Math.PI / 4) { // 1ère moitié du 3ème cadran
                        v = dx * kx;
                        speed2 = v * Math.sin(theta * 3 - 5 * Math.PI / 4);
                        speed1 = v * Math.sin(Math.PI / 4);
                    } else {
                        v = dy * ky;
                        speed1 = -v * Math.sin(theta);
                        speed2 = v;
                    }

                } else { // 4ème cadran
                    if (theta <= 7 * Math.PI / 4) { // 1ère moitié du 4ème cadran
                        v = dy * ky;
                        speed1 = v;
                        speed2 = -v * Math.sin(theta);
                    } else {
                        v = -dx * kx;
                        speed1 = -v * Math.sin(theta * 3 - 7 * Math.PI / 4);
                        speed2 = v * Math.sin(Math.PI / 4);
                    }

                }


                speed1 += speed_stop;
                speed2 += speed_stop;

                if (speed1 >= current_speed_max - speed_limit) {
                    speed1 = current_speed_max - speed_limit;
                }

                if (speed1 <= current_speed_min + speed_limit) {
                    speed1 = current_speed_min + speed_limit;
                }

                if (speed2 >= current_speed_max - speed_limit) {
                    speed2 = current_speed_max - speed_limit;
                }

                if (speed2 <= current_speed_min + speed_limit) {
                    speed2 = current_speed_min + speed_limit;
                }

                var msg = new ROSLIB.Message({
                    speed1: Math.round(speed1),
                    speed2: Math.round(speed2)
                });
                //Publish on Topic
                current_speed1 = Math.round(speed1);
                current_speed2 = Math.round(speed2);
                current_angle  = theta;
                affichStatement(head_front_direction-head_direction,current_speed1,current_speed2,current_angle);
                //topic_cmd.publish(msg);
                //console.log("published " + speed1 + " " + speed2);
            }
        };

    };


    //-------------------------------------------------------------------------
    //===================================================
    //================Subscriber=====================
    //===================================================
    //-------------------------------------------------------------------------

   

//-------------------------------------------------------------------------
//=====================================================================
//===================GAMEPAD CONTROL=========================
//=====================================================================
    var gamePeriode;
    var checkOk;
    var movement = false;
    var gamePad = false;

    $(window).on("gamepaddisconnected", function () {
        console.log("disconnection event");
        $(".img-game").css('background-color', black_ok);
        $("#up_possibility").css('color', black_ok);
        $("#down_possibility").css('color', black_ok);
        $("#left_possibility").css('color', black_ok);
        $("#right_possibility").css('color', black_ok);
        movement = false;
        gamePad = false;
        clearInterval(gamePeriode);
        clearInterval(checkOk);
    });

    $(window).on("gamepadconnected", function () {
        console.log("connection event");
        $(".img-game").css('background-color', orange_warning);
        checkOk = setInterval(canGame, 50);
    });

    function canGame() {
        var gp = navigator.getGamepads()[0];

        if (gp.buttons[16].pressed) {
            $(".img-game").css('background-color', green_warning);
            gamePeriode = setInterval(gameLoop, 100);
            $("#up_possibility").css('color', orange_warning);
            $("#down_possibility").css('color', orange_warning);
            $("#left_possibility").css('color', orange_warning);
            $("#right_possibility").css('color', orange_warning);
            clearInterval(checkOk);
        }
    }
    ;

    function gameLoop() {
        var gp = navigator.getGamepads()[0];
        gamePad = true;

        if (Math.round((Math.round(gp.axes[2] * 100) / 100) * 256 / 2) > 5 || gp.buttons[1].pressed) {
            setHeadDirection(key_head_right);
        }

        if (Math.round((Math.round(gp.axes[2] * 100) / 100) * 256 / 2) < -5 || gp.buttons[2].pressed) {
            setHeadDirection(key_head_left);
        }
        //debug
//        for(var i=0;i<gp.buttons.length;i++) {
//            if(gp.buttons[i].pressed) console.log("pressed " + i);
//        }

        if (gp.buttons[3].pressed) {
            setSpeedLimit(key_speed_up);
        }

        if (gp.buttons[0].pressed) {
            setSpeedLimit(key_speed_down);
        }

        if (gp.buttons[8].pressed) {
            setGazeDirection(key_gaze_right);
        }
        if (gp.buttons[9].pressed) {
            setGazeDirection(key_gaze_left);
        }

        if (gp.buttons[11].pressed || gp.buttons[10].pressed) {
            if (!movement) {
                movement = setInterval(setCurrentSpeed, periode_of_send_speed);
            }
            $("#up_possibility").css('color', green_warning);
            $("#down_possibility").css('color', green_warning);
            $("#left_possibility").css('color', green_warning);
            $("#right_possibility").css('color', green_warning);

            if (Math.round((Math.round(gp.axes[1] * 100) / 100) * 256 / 2) > 5 ||
                    Math.round((Math.round(gp.axes[1] * 100) / 100) * 256 / 2) < -5) {
                analogGamepad(Math.round((Math.round(gp.axes[0] * 100) / 100) * 256 / 2),
                        Math.round((Math.round(gp.axes[1] * 100) / 100) * 256 / 2));
            }

            if (Math.round((Math.round(gp.axes[0] * 100) / 100) * 256 / 2) > 5 ||
                    Math.round((Math.round(gp.axes[0] * 100) / 100) * 256 / 2) < -5) {
                analogGamepad(Math.round((Math.round(gp.axes[0] * 100) / 100) * 256 / 2),
                        Math.round((Math.round(gp.axes[1] * 100) / 100) * 256 / 2));
            }

            if (gp.buttons[4].pressed) {
                clickButton(key_forward);
            }
            if (gp.buttons[6].pressed) {
                clickButton(key_backward);
            }
            if (gp.buttons[7].pressed) {
                clickButton(key_turn_left);
            }
            if (gp.buttons[5].pressed) {
                clickButton(key_turn_right);
            }
            if (gp.buttons[12].pressed || gp.buttons[13].pressed) {
                stop_periode = setInterval(sendStop, speed_stop_delay);
                setTimeout(function () {
                    clearInterval(stop_periode);
                    stop_periode = false;
                }, speed_stop_delay * 3 + 1);
            }

        } else if (movement && !mouse_event_enter) {
            stop_periode = setInterval(sendStop, speed_stop_delay);
            setTimeout(function () {
                clearInterval(stop_periode);
                stop_periode = false;
            }, speed_stop_delay * 3 + 1);
            clearInterval(movement);
            movement = false;
            $("#up_possibility").css('color', orange_warning);
            $("#down_possibility").css('color', orange_warning);
            $("#left_possibility").css('color', orange_warning);
            $("#right_possibility").css('color', orange_warning);
        }

    }
    ;


    function analogGamepad(dx, dy) {

        var kx = current_speed_max / 128;
        var ky = current_speed_max / 128;

        speed1 = speed_stop;
        speed2 = speed_stop;

        var theta = Math.atan(dy / dx); // En radian
        if (dx <= 0 && dy >= 0) {
            theta = -theta + 2 * Math.PI / 2;
        } else if (dx <= 0 && dy <= 0) {
            theta = -theta + Math.PI;
        } else if (dx >= 0 && dy <= 0) {
            theta = -theta;
        } else {
            theta = -theta + 2 * Math.PI;
        }

        var v, speed1, speed2;

        if (theta >= 0 && theta <= Math.PI / 2) { // 1er cadran
            if (theta <= Math.PI / 4) { // 1ère moitié du 1er cadran
                v = dx * kx;
                speed1 = -v * Math.sin(theta + Math.PI / 4);
                speed2 = -v * Math.sin(theta * 2 - Math.PI / 4);
            } else {
                v = dy * ky;
                speed1 = v;
                speed2 = v * Math.sin(theta);
            }

        } else if (theta > Math.PI / 2 && theta <= Math.PI) { // 2ème cadran
            if (theta <= 3 * Math.PI / 4) { // 1ère moitié du 2ème cadran
                v = dy * ky;
                speed1 = v * Math.sin(theta);
                speed2 = v;
            } else {
                v = -dx * kx;
                speed1 = -v * Math.sin(theta * 2 - 3 * Math.PI / 4);
                speed2 = -v * Math.sin(theta - Math.PI / 4);
            }

        } else if (theta > Math.PI && theta <= 3 * Math.PI / 2) { // 3ème cadran
            if (theta <= 5 * Math.PI / 4) { // 1ère moitié du 3ème cadran
                v = dx * kx;
                speed2 = -v * Math.sin(theta * 3 - 5 * Math.PI / 4);
                speed1 = -v * Math.sin(Math.PI / 4);
            } else {
                v = dy * ky;
                speed1 = -v * Math.sin(theta);
                speed2 = v;
            }

        } else { // 4ème cadran
            if (theta <= 7 * Math.PI / 4) { // 1ère moitié du 4ème cadran
                v = dy * ky;
                speed1 = v;
                speed2 = -v * Math.sin(theta);
            } else {
                v = -dx * kx;
                speed1 = v * Math.sin(theta * 3 - 7 * Math.PI / 4);
                speed2 = -v * Math.sin(Math.PI / 4);
            }

        }

        speed1 += speed_stop;
        speed2 += speed_stop;

        speed1 = -speed1;
        speed2 = -speed2;


        if (speed1 >= current_speed_max - speed_limit) {
            speed1 = current_speed_max - speed_limit;
        }

        if (speed1 <= current_speed_min + speed_limit) {
            speed1 = current_speed_min + speed_limit;
        }

        if (speed2 >= current_speed_max - speed_limit) {
            speed2 = current_speed_max - speed_limit;
        }

        if (speed2 <= current_speed_min + speed_limit) {
            speed2 = current_speed_min + speed_limit;
        }

        var msg = new ROSLIB.Message({
            speed1: Math.round(speed1),
            speed2: Math.round(speed2)
        });
        //Publish on Topic
        current_speed1 = Math.round(speed1);
        current_speed2 = Math.round(speed2);
        current_angle  = theta;
        affichStatement(head_front_direction-head_direction,current_speed1,current_speed2,current_angle);
        //topic_cmd.publish(msg);
        //console.log("published " + Math.round(speed1) + " " + Math.round(speed2));

    }
    ;

};
