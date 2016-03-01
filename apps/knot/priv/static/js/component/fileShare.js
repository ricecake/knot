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
	if(initiator) {
		var dc = new KnotConn({
			connector: function(options) {
				return Peer.createDataChannel("fileshare-negotiate");
			},
			onOpen: function(){
				dc.send('knot.fileshare.ping', null);
			},
			eventHandlers: {
				'knot.fileshare.ping': function() {
					this.state.ping = setTimeout(function(){
						dc.send('knot.fileshare.pong', null);
					}, 2500);
				},
				'knot.fileshare.pong': function() {
					this.state.pong = setTimeout(function(){
						dc.send('knot.fileshare.ping', null);
					}, 2500);
				}
			},
			onClose: function(){
				clearTimeout(this.state.ping);
				clearTimeout(this.state.pong);
			}
		});
	}
	Peer.ondatachannel = function(event) {
		var dc = new KnotConn({
			connector: function(options) {
				return event.channel;
			},
			eventHandlers: {
				'knot.fileshare.ping': function() {
					this.state.ping = setTimeout(function(){
						dc.send('knot.fileshare.pong', null);
					}, 2500);
				},
				'knot.fileshare.pong': function() {
					this.state.pong = setTimeout(function(){
						dc.send('knot.fileshare.ping', null);
					}, 2500);
				}
			},
			onClose: function(){
				clearTimeout(this.state.ping);
				clearTimeout(this.state.pong);
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
