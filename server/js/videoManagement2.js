

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
});

//add the remote video
//the assistance video from the robot is also displayed in the same room
//the video-conf camera must be connected first. Then the assistance camera in 2nd.
var nbPeers = 0;
webrtc.on('videoAdded', function(video,peer) {
	//console.log("remote video added");
	nbPeers = nbPeers + 1; 
	if (nbPeers == 2){ //caméra assistance du sol
		var remotes = document.getElementById('remote_assistance');
		if (remotes) {
			var container = document.createElement('div');
			container.className = 'videoContainerAssistance';
			container.id = 'container_' + webrtc.getDomId(peer);
			container.appendChild(video);

			//suppress contextMenu
			video.oncontextMenu = function() {return false; };

			remotes.appendChild(container);
		}
	} else { //caméra principale de vidéo-conf
		var remotes = document.getElementById('remotes');
		if (remotes) {
			var container = document.createElement('div');
			container.className = 'videoContainer';
			container.id = 'container_' + webrtc.getDomId(peer);
			container.appendChild(video);

			//suppress contextMenu
			video.oncontextMenu = function() {return false; };

			remotes.appendChild(container);
                        
                        // show the accelerometer
                    var accelerometer = document.createElement('div');
                    accelerometer.id = 'accelerometer';
                    accelerometer.className = 'accelerometer';
                    container.appendChild(accelerometer);
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





