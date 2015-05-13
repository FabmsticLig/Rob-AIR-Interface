

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
	autoAdjustMic: false,
    media :{
        audio:true,
        video:{
                mandatory:
                    {
                        //maxWidth:320,
                        //maxHeight:100,
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
/*                    var div_accelerometer = document.createElement('div');
                    div_accelerometer.id = 'demoWidget';
                    div_accelerometer.style = 'position: relative';

                    var inside_accelerometer = document.createElement('div');
                    inside_accelerometer.id = 'gaugeContainer';
                    inside_accelerometer.style = 'float: left';
                    
                    div_accelerometer.appendChild(inside_accelerometer);
                    
                    remotes.appendChild(div_accelerometer);
                    */
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





