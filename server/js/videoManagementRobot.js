//Mediaoption

// grab the room from the URL
var room = location.href && location.href.split('room/')[1];
console.log("room name : " + room);
console.log("location.href = " + location.href);

/*MediaStreamTrack.getSources(function (deviceOptions){
        if (deviceOptions){
            var camNum = 1; //count the number of cameras for id if device label is unavailable
            for (var x=0; x<deviceOptions.length; x++){
                if (deviceOptions[x].kind == 'video') {
		    console.log("camera found : ");
		    console.log("   label: " + deviceOptions[x].label);
		    console.log("   id : " + deviceOptions[x].id);
               }
            }
        }
        else {
            console.log("No device sources found");
        }
    });
*/

// create our webrtc connection
//head
var webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'principal',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false,
    media :{
	audio:true,
        //audio:{
	//	stereo:true,
	//	echoCancellation:false
	//},
        video:{
                mandatory:
                    {
			//sourceId: 'ca2b61bc934d47ef9cd9fcc6f8fc567fa7f20d400fb6ff5841f7c2b6f4760694',
                        maxWidth:640,
                        maxHeight:480,
			minWidth:640,
			minHeight:480,
                        //maxFrameRate:10
                    }
              }
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

