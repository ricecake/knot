;define([
	'jquery',
	'component/peerConnection'
], function($,KnotData,peerManager){
'use strict';

var conn;
var defaults = {
};

$.fn.knotFileShare = function (options) {
	options = $.extend({}, defaults, options);
	conn = options.connection;

	return $(this).each(function() {
	var pcm = new peerManager(function(session, Peer, initiator) {
		if(initiator) {
			var dataChannel = Peer.createDataChannel("myLabel");
			dataChannel.onerror = function (error) {
				console.log('error', dataChannel);
				console.log("Data Channel Error:", error);
			};

			dataChannel.onmessage = function (event) {
				console.log('message', dataChannel);
				console.log("Got Data Channel Message:", event.data);
				dataChannel.send("Hello World!");
			};

			dataChannel.onopen = function () {
				console.log('open', dataChannel);
				dataChannel.send("Hello World!");
			};

			dataChannel.onclose = function () {
				console.log('close', dataChannel);
				console.log("The Data Channel is Closed");
			};
		}

		Peer.ondatachannel = function(event) {
			var dataChannel = event.channel;
			dataChannel.onerror = function (error) {
				console.log('error', dataChannel);
				console.log("Data Channel Error:", error);
			};

			dataChannel.onmessage = function (event) {
				console.log('message', dataChannel);
				console.log("Got Data Channel Message:", event.data);
				dataChannel.send("Hello World!");
			};

			dataChannel.onopen = function () {
				console.log('open', dataChannel);
				dataChannel.send("Hello World!");
			};

			dataChannel.onclose = function () {
				console.log('close', dataChannel);
				console.log("The Data Channel is Closed");
			};
		};

	}, function(session, initiator){
	});
	pcm.ensureSignalChannel(conn);
	pcm.ready();
	});
};

});
