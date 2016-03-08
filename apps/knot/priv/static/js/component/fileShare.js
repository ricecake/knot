;define([
	'jquery',
	'KnotConn',
	'component/peerConnection',
	'tpl!template/fileShareWidget',
	'tpl!template/fileShareEntry'
], function($, KnotConn, peerManager, containerMarkup, entryMarkup){
'use strict';

var conn;
var defaults = {
};

var peerRouters = {};

var sharedFilesLocal = {};
var sharedFilesRemote = {};

var pcm = new peerManager(function(session, Peer, initiator) {
	var commonArgs = {
		eventHandlers: {
			'knot.fileshare.ping': function() {
				this.state.ping = setTimeout(function(){
					this.send('knot.fileshare.pong', null);
				}.bind(this), 2500);
			},
			'knot.fileshare.pong': function() {
				this.state.pong = setTimeout(function(){
					this.send('knot.fileshare.ping', null);
				}.bind(this), 2500);
			},
			'knot.fileshare.announce': function(key, content, raw) {
				sharedFilesRemote[session] = $.extend({}, content);
				console.log(sharedFilesRemote);
			}
		},
		onOpen: function(){
			if(initiator) {
				this.send('knot.fileshare.ping', null);
			}
			var manifest = generateShareManifest();
			this.send('knot.fileshare.announce', manifest);
		},
		onClose: function(){
			clearTimeout(this.state.ping);
			clearTimeout(this.state.pong);
			delete peerRouters[session];
		}
	};

	if(initiator) {
		peerRouters[session] = new KnotConn($.extend({}, commonArgs, {
			connector: function(options) {
				return Peer.createDataChannel("fileshare-negotiate");
			},
		}));
	}
	Peer.ondatachannel = function(event) {
		peerRouters[session] = new KnotConn($.extend({}, commonArgs, {
			connector: function(options) {
				return event.channel;
			},
		}));
	};
});


$.fn.knotFileShare = function (options) {
	options = $.extend({}, defaults, options);

	return $(this).each(function() {
		var container = $(containerMarkup(options));
		$(this).append(container);
	});

};

$(document).on('change', '.knot-file-select', function() {
	for (var i = 0; i < this.files.length; i++) {
		var file = this.files[i];
		sharedFilesLocal[file.name] = file;
	}
	var manifest = generateShareManifest();
	for (var peer in peerRouters) {
		peerRouters[peer].send('knot.fileshare.announce', manifest);
	}
});

function generateShareManifest() {
	var manifest = {};
	for (var key in sharedFilesLocal) {
		manifest[key] = {
			name: sharedFilesLocal[key].name,
			size: sharedFilesLocal[key].size,
			type: sharedFilesLocal[key].type,
			lastModified: sharedFilesLocal[key].lastModified
		};
	}
	return manifest;
}

});
