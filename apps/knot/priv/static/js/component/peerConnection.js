;define([
	'component/datastore',
	'lib/webRTCAdapter'
], function(KnotData){
'use strict';

var conn;
var peerConnections = {};
var dataStore = new KnotData;
var onSetup = [];
var onClose = [];

var peerConnectionManager = function (setup, close) {
	onSetup.push(setup);
	onClose.push(close);
	return this;
};

peerConnectionManager.prototype.ready = function() {
		conn.send('knot.peerconnection.join', {});
};

peerConnectionManager.prototype.ensureSignalChannel = function(Connection) {
	if (!conn) {
		conn = Connection;
		conn.addEventHandlers({
			'knot.peerconnection.join': function(key, content, raw) {
				hangup(raw.from);
				if(initiator(raw.from)) {
					rtcHandshake(raw.from);
				}
			},
			'knot.peerconnection.offer': function(key, content, raw) {
				rtcHandshake(raw.from, content)
			},
			'knot.peerconnection.answer': function(key, content, raw) {
				peerConnections[raw.from].setRemoteDescription(new window.RTCSessionDescription(content));
			},
			'knot.peerconnection.icecandidate': function(key, content, raw) {
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
	}
	return conn;
};

function initiator(them) {
	return !(dataStore.get('self').id === them);
}

function hangup(session) {
	if (peerConnections[session]) {
		peerConnections[session].close();
		delete peerConnections[session];
	}
}

function rtcHandshake(session, content) {
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

	peerConnection.onicecandidate = function (event) {
		if (event.candidate) {
			conn.send('knot.peerconnection.icecandidate', {
				sdpMLineIndex: event.candidate.sdpMLineIndex,
				sdpMid: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			}, { to: session });
		}
	};

	peerConnection.oniceconnectionstatechange = function () {
		if (peerConnection.iceConnectionState === 'disconnected') {
			hangup(session);
			for (var callback in onClose) {
				onClose[callback](session, initiator(session));
			}
		}
	};

	for (var callback in onSetup) {
		onSetup[callback](session, peerConnection, initiator(session));
	}
	if (typeof content === 'undefined') {
		peerConnection.createOffer(function (desc) {
			peerConnection.setLocalDescription(desc, function () {
				conn.send('knot.peerconnection.offer', desc, { to: session });
			}, function (e) { window.console.log(e); });
		}, function (e) { window.console.log(e); });
	}
	else {
		var offer = new window.RTCSessionDescription(content);

		peerConnection.setRemoteDescription(offer);

		peerConnection.createAnswer(function (answer) {
			peerConnection.setLocalDescription(answer);
			conn.send('knot.peerconnection.answer', answer, { to: session });
		}, function (e) { window.console.log(e); });
	}

	peerConnections[session] = peerConnection;
}

return peerConnectionManager;
});
