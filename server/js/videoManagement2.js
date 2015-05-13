

// grab the room from the URL
var room = location.href && location.href.split('room/')[1];
console.log("room name : " + room);
console.log("location.href = " + location.href);
// create our webrtc connection
var webrtc = new SimpleWebRTC({
	// the id/element dom element that will hold "our" video
	localVideoEl: 'localVideo',
	// the id/element dom element that will hold remote videos
	remoteVideosEl: '', //empty string - the remote video is added just under
	// immediately ask for camera access
	autoRequestMedia: true,
	debug: true,
	detectSpeakingEvents: true,
	autoAdjustMic: false
    media :{
        audio:true,
        video:{
                mandatory:
                    {
                        maxWidth:320,
                        maxHeight:100,
                        maxFrameRate:60
                    }
              }
    }
});

//add the remote video
//the assistance video from the robot is also displayed in the same room
//the video-conf camera must be connected first. Then the assistance camera in 2nd.
var nbPeers = 0;
webrtc.on('videoAdded', function(video,peer) {
	//console.log("remote video added");
	nbPeers = nbPeers + 1; 
	if (nbPeers == 2){ //caméra assistance du sol
		var remotes = document.getElementById('div_cam2');
		if (remotes) {
			//suppress contextMenu
			video.oncontextMenu = function() {return false; };
			remotes.appendChild(video);
		}
	} else { //caméra principale de vidéo-conf
		var remotes = document.getElementById('div_cam3');
		if (remotes) {
			//suppress contextMenu
			video.oncontextMenu = function() {return false; };

			remotes.appendChild(video);
                        
                        // show the accelerometer
                    var div_accelerometer = document.createElement('div');
                    div_accelerometer.id = 'demoWidget';
                    div_accelerometer.style = 'position: relative';

                    var inside_accelerometer = document.createElement('div');
                    inside_accelerometer.id = 'gaugeContainer';
                    inside_accelerometer.style = 'float: left';
                    
                    div_accelerometer.appendChild(inside_accelerometer);
                    
                    container.appendChild(div_accelerometer);
                    
                    
//                    <div id="demoWidget" style="position: relative;">
//                        <div style="float: left;" id="gaugeContainer"></div>
//                    </div>
                    
                    // JAVASCRIPT POUR ACCELEROMETER
                    
                var labels = {visible: true, position: 'inside'};
                $('#gaugeContainer').jqxGauge({
                    ranges: [{startValue: 0, endValue: 220, style: {fill: '#e2e2e2', stroke: '#e2e2e2'}, startDistance: '50%', endDistance: '50%', endWidth: 13, startWidth: 13},
                        ],
                    startAngle : 0,
                    endAngle : 180,
                    value: 110,
                    style: {stroke: '#ffffff', 'stroke-width': '1px', fill: '#ffffff'},
                    animationDuration: 1500,
                    colorScheme: 'scheme04',
                    labels: labels,
                    ticksMinor: {interval: 5, size: '5%'},
                    ticksMajor: {interval: 10, size: '10%'}
                });

                $('#gaugeContainer').on('valueChanging', function (e) {
                    $('#gaugeValue').text(Math.round(e.args.value) + ' kph');
                });

                
                labels.visible = false;
                $('#gaugeContainer').jqxGauge('labels', labels);
                $('#gaugeContainer').jqxGauge('showRanges', false);
                $('#gaugeContainer').jqxGauge('border', { visible: false });
                //$('#gaugeContainer').jqxGauge('height', '200');
                //$('#gaugeContainer').jqxGauge({ pointer: { pointerType: 'default', style: { fill: '#ff0000', stroke: '#ff0000' }, length: '70%', width: '2%', visible: true }});
                $(document).keydown(function(e){
                    if(e.keyCode == 39){
                        $('#gaugeContainer').jqxGauge('value', $('#gaugeContainer').jqxGauge('value')+10);
                    }
                })
		}
	}
});
webrtc.on('videoRemoved', function(video, peer) {
	//console.log('video removed', peer);
	if (peer) {
		var remotes = document.getElementById('remotes');
		var el = document.getElementById('container_' + webrtc.getDomId(peer));
		if (remotes && el) {
			remotes.removeChild(el);
		}
		nbPeers = nbPeers - 1;
	}
});

// when it's ready, join if we got a room from the URL
webrtc.on('readyToCall', function () {
	// you can name it anything
	if (room) webrtc.joinRoom(room);
});

// Since we use this twice we put it here
function setRoom(name) {
	$('#joinRoom').remove();
	$('h1').text('Room name : ' + name);
	$('body').append('<input type="hidden" id="roomName" value="'+name+'"/>');
	$('body').addClass('active');
}

if (room) {
	setRoom(room);
} else {
	$('#joinRoom').submit(function () {
		webrtc.createRoom($('#sessionInput').val(), function (err, name) {
			console.log(' create room cb', arguments);
			var newUrl = location.pathname + 'room/' +  name;
			if (!err) {
				history.replaceState({foo: 'bar'}, null, newUrl);
				setRoom(name);
			} else {
				console.log(err);
			}
		});
		return false;
	});
}





