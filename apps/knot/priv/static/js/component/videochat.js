;define([
	'jquery',
	'component/datastore',
	'tpl!template/videoChatWidget',
	'tpl!template/videoChat-remote',
	'lib/webRTCAdapter'
], function($,KnotData,containerMarkup,remoteMarkup){
'use strict';

var dataStore = new KnotData;
var localStream;
var conn;

var remoteElements = {};
var peerConnections = {};

var defaults = {
};

$.fn.knotVideoChat = function (options) {
	options = $.extend({}, defaults, options);
	conn = options.connection;

	return $(this).each(function() {
		var container = $(containerMarkup(options));
		$(this).append(container);
		window.getUserMedia({ audio: true, video: true }, function (stream) {
			var localVideo = container.find('.local-video')[0];
			localStream = stream;
			window.attachMediaStream(localVideo, localStream);
			conn.addEventHandlers({
				'knot.videochat.join': function(key, content, raw) {
					if(initiator(raw.from)) {
						rtcHandshake(container, raw.from);
					}
				},
				'knot.videochat.offer': function(key, content, raw) {
					rtcHandshake(container, raw.from, content)
				},
				'knot.videochat.answer': function(key, content, raw) {
					peerConnections[raw.from].setRemoteDescription(new window.RTCSessionDescription(content));
				},
				'knot.videochat.icecandidate': function(key, content, raw) {
					var icecandidate = new window.RTCIceCandidate({
						sdpMLineIndex: content.sdpMLineIndex,
						candidate: content.candidate
					});
					peerConnections[raw.from].addIceCandidate(icecandidate);
				},
				'knot.session.disconnected': function(key, content, raw) {
					hangup(raw.from);
				}
			});
			conn.send('knot.videochat.join', {});
		}, function (e) {
			window.console.log(e);
		});

	});
};

$(document).on('click', '.video-container video', function() {
	$('.video-container video').removeClass('main').addClass('pip');
	$(this).removeClass('pip').addClass("main");
});

function initiator(them) {
	return !(dataStore.get('self').id === them);
}

function hangup(session) {
	if ($(remoteElements[session]).hasClass('main')) {
		if (!Object.keys(remoteElements).length) {
			$('.local-video').removeClass('pip').addClass('main');
		}
		else {
			$(Object.keys(remoteElements).find(function(el){
				return el !== session;
			})).removeClass('pip').addClass('main');
		}
	}
	remoteElements[session].remove();
	peerConnections[session].close();
	delete remoteElements[session];
	delete peerConnections[session];
}

function rtcHandshake(container, session, content) {
	var peerConnection = new window.RTCPeerConnection(
		{ iceServers: [
			{ url: 'stun:stun.l.google.com:19302' },
			{ url: 'stun:stun1.l.google.com:19302' },
			{ url: 'stun:stun2.l.google.com:19302' },
			{ url: 'stun:stun3.l.google.com:19302' },
			{ url: 'stun:stun4.l.google.com:19302' }
		] },
		{ optional: [{ DtlsSrtpKeyAgreement: true }] }
		);

	peerConnection.onaddstream = function (event) {
		var remoteElement = $(remoteMarkup());
		container.find('.main').toggleClass('main pip');
		$(container).find('.video-container').append(remoteElement);
		remoteElements[session] = remoteElement;
		var remoteVideoElement = remoteElement[0];
		window.attachMediaStream(remoteVideoElement, event.stream);
		// This is just for dev debugging of styles.
		//for(var i=0; i<5; i++) {
		//	var remoteElement = $(remoteMarkup());
		//	remoteElement.toggleClass('main pip');
		//	$(container).find('.video-container').append(remoteElement);
		//	window.attachMediaStream(remoteElement[0], event.stream);
		//}
	};

	peerConnection.onicecandidate = function (event) {
		if (event.candidate) {
			conn.send('knot.videochat.icecandidate', {
				sdpMLineIndex: event.candidate.sdpMLineIndex,
				sdpMid: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			}, { to: session });
		}
	};

	peerConnection.oniceconnectionstatechange = function () {
		if (peerConnection.iceConnectionState === 'disconnected') {
			hangup(session);
		}
	};

	peerConnection.addStream(localStream);

	if (typeof content === 'undefined') {
		peerConnection.createOffer(function (desc) {
			peerConnection.setLocalDescription(desc, function () {
				conn.send('knot.videochat.offer', desc, { to: session });
			}, function (e) { window.console.log(e); });
		}, function (e) { window.console.log(e); });
	}
	else {
		var offer = new window.RTCSessionDescription(content);

		peerConnection.setRemoteDescription(offer);

		peerConnection.createAnswer(function (answer) {
			peerConnection.setLocalDescription(answer);
			conn.send('knot.videochat.answer', answer, { to: session });
		}, function (e) { window.console.log(e); });
	}

	peerConnections[session] = peerConnection;
}

});
