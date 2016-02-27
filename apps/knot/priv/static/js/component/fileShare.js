;define([
	'jquery',
	'KnotConn',
	'component/peerConnection'
], function($, KnotConn, peerManager){
'use strict';

var conn;
var defaults = {
};

var pcm = new peerManager(function(session, Peer, initiator) {
	//if(initiator) {
	//	var dc = new KnotConn({
	//		connector: function(options) {
	//			return Peer.createDataChannel("myLabel");
	//		},
	//		onOpen: function(){
	//			console.log("start send");
	//			dc.send('ping', null);
	//		},
	//		eventHandlers: {
	//			'ping': function() {
	//				console.log('pong');
	//				dc.send('pong', null);
	//			},
	//			'pong': function() {
	//				console.log('ping');
	//				dc.send('ping', null);
	//			}
	//		}
	//	});
	//}
	Peer.ondatachannel = function(event) {
		new KnotConn({
			connector: function(options) {
				return event.channel;
			},
			onOpen: function() {
				console.log("Start get");
			},
			eventHandlers: {
				'ping': function() {
					console.log('pong');
					dc.send('pong', null);
				},
				'pong': function() {
					console.log('ping');
					dc.send('ping', null);
				}
			},
			onClose: function() {
				console.log("closed");
			}
		});
	};
});


$.fn.knotFileShare = function (options) {
	options = $.extend({}, defaults, options);
	conn = options.connection;


	return $(this).each(function() {
	});

};
});
