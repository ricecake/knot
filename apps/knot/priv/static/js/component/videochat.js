;define([
	'jquery',
	'component/peerConnection',
	'tpl!template/videoChatWidget',
	'tpl!template/videoChat-remote'
], function($,peerManager,containerMarkup,remoteMarkup){
'use strict';

var localStream;
var conn;

var remoteElements = {};

var defaults = {
};

$.fn.knotVideoChat = function (options) {
	options = $.extend({}, defaults, options);
	conn = options.connection;

	return $(this).each(function() {
		var container = $(containerMarkup(options));
		$(this).append(container);
		var pcm = new peerManager(function(session, Peer, initiator){
			hangup(session);
			Peer.addStream(localStream);
			Peer.onaddstream = function (event) {
				var remoteElement = $(remoteMarkup());
				container.find('.main').toggleClass('main pip');
				$(container).find('.videofeed-container').append(remoteElement);
				remoteElements[session] = remoteElement;
				var remoteVideoElement = remoteElement[0];
				window.attachMediaStream(remoteVideoElement, event.stream);
				// This is just for dev debugging of styles.
				//for(var i=0; i<5; i++) {
				//	var remoteElement = $(remoteMarkup());
				//	remoteElement.toggleClass('main pip');
				//	$(container).find('.videofeed-container').append(remoteElement);
				//	window.attachMediaStream(remoteElement[0], event.stream);
				//}
			};
		}, function(session, initiator){
			hangup(session);
		});
		pcm.wait('videochat');

		window.getUserMedia({ audio: true, video: true }, function (stream) {
			var localVideo = container.find('.local-video')[0];
			localStream = stream;
			window.attachMediaStream(localVideo, localStream);
			pcm.ready('videochat');
		}, function (e) {
			window.console.log(e);
			pcm.ready('videochat');
		});

	});
};

$(document).on('click', '.videofeed-container video', function() {
	$('.videofeed-container video').removeClass('main').addClass('pip');
	$(this).removeClass('pip').addClass("main");
});

function hangup(session) {
	if ($(remoteElements[session]).hasClass('main')) {
		$(remoteElements[session]).removeClass('main');
		if (Object.keys(remoteElements).length === 1) {
			$('.local-video').removeClass('pip').addClass('main');
		}
		else {
			$(Object.keys(remoteElements).find(function(el){
				return el !== session;
			})).removeClass('pip').addClass('main');
		}
	}
	if (remoteElements[session]) {
		remoteElements[session].remove();
		delete remoteElements[session];
	}
}

});
