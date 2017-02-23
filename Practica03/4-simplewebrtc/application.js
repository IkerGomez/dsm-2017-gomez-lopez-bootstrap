/*
 ps-webrtc-simplewebrtc.js
 Author: Lisa Larson-Kelley (http://learnfromlisa.com)
 WebRTC Fundamentals -- Pluralsight.com
 Version 1.0.0
 --
 Example of basic multiway conferencing with SimpleWebRTC framework
 Adapted from SimpleWebRTC documentation 
 */

window.onload = function () { 
	// Grab the room name from the URL
	var room = location.search && location.search.split('?')[1];

	// Create our WebRTC connection
	var webrtc = new SimpleWebRTC({
			// the element that will hold local video
			localVideoEl: 'localVideo',
			// the element that will hold remote videos
			remoteVideosEl: 'remotes',
			autoRequestMedia: true,
			log: true
		});

	// When it's ready, and we have a room from the URL, join the call
	webrtc.on('readyToCall', function() {
		if (room) webrtc.joinRoom(room);
	});

	// Set the room name
	function setRoom(name) {
        $('form').remove();
        $('h1').text('Welcome to room: ' + name);
        $('#subTitle').text('Share this link to have friends join you:');
        $('#roomLink').text(location.href);
        $('body').addClass('active');
    }

    // If there's a room, show it in the UI
    if (room) {
    	setRoom(room);
    } else {  // If not, create one when the user submits the form
    	$('form').submit(function () {
    		var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
    		webrtc.createRoom(val, function(err, name) {
    			var newUrl = location.pathname + '?' + name;
    			if (!err) {
    				history.replaceState({foo: 'bar'},null, newUrl);
    				setRoom(name);
    			}
    		});
    		return false;
    	});
    }
   
}
        