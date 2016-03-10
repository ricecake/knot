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
	remote: false
};

var peerRouters = {};

var sharedFilesLocal = {};
var sharedFilesRemote = {};

var pcm = new peerManager(function(session, Peer, initiator) {
	var sessionDefaults = $.extend({}, defaults, {
		session: session,
		remote: true
	});
	var maybeInitiateSession = function(Args) {
		if(initiator) {
			peerRouters[session] = new KnotConn($.extend({}, Args, {
				connector: function(options) {
					return Peer.createDataChannel("fileshare-negotiate", {
						ordered: true,
						reliable: true
					});
				},
			}));
		}
	};
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
			'knot.fileshare.announce': function(key, content) {
				var newFileList = $.extend({}, content);
				sharedFilesRemote[session] = newFileList;
				$('.knot-fileshare-container .knot-files-remote').each(function() {
					$(this).find('[data-session="'+ session +'"]').remove();
					for (var key in content) {
						var args = $.extend({}, sessionDefaults, content[key]);
						var container = $(entryMarkup(args));
						$(this).append(container);
					}
				});
			},
			'knot.fileshare.rescind': function(key, content) {
				var fileName = content.name;
				$('.knot-fileshare-container .knot-files-remote [data-session="'+ session +'"][data-name="'+ fileName +'"]').remove();
				delete sharedFilesRemote[session][fileName];
			},
			'knot.fileshare.request': function(key, content) {
				var fileReader = new FileReader();
				console.log(content);
				fileReader.onload = function(dataEvent) {
					console.log(dataEvent);
					var shareChannel = Peer.createDataChannel(content.name, {
						ordered: true,
						reliable: true
					});
					shareChannel.onopen = function() {
						console.log("sending");
						shareChannel.send(dataEvent.target.result);
						shareChannel.close();
					}
				};
				fileReader.readAsDataURL(sharedFilesLocal[content.name]);
			}
		},
		onOpen: function(){
			this.connection.onerror = function(e) {
				console.log(e);
			};
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
			console.log("Closing", this.connection.label);
			//if(Peer.signalingState !== 'disconnected') {
			//	maybeInitiateSession(commonArgs);
			//}
		}
	};

	Peer.ondatachannel = function(event) {
		var channel = event.channel;
		if(channel.label === "fileshare-negotiate") {
			peerRouters[session] = new KnotConn($.extend({}, commonArgs, {
				connector: function(options) {
					return channel;
				},
			}));
		} else {
			channel.onmessage = function(msg) {
				console.log(channel.label, msg);
				var link = document.createElement("a");
				link.download = channel.label;
				link.href = msg.data;
				link.click();
			}
		}
	};

	maybeInitiateSession(commonArgs);
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
	this.value = null;
	var manifest = generateShareManifest();
	for (var peer in peerRouters) {
		peerRouters[peer].send('knot.fileshare.announce', manifest);
	}
	$('.knot-fileshare-container .knot-files-local').each(function() {
		$(this).empty();
		for (var key in manifest) {
			var args = $.extend({}, defaults, manifest[key]);
			var container = $(entryMarkup(args));
			$(this).append(container);
		}
	});

});

$(document).on('click', '.knot-file-remove', function(){
	var fileName = $(this).parent().data('name');
	$(this).parent().remove();
	delete sharedFilesLocal[fileName];
	for (var peer in peerRouters) {
		peerRouters[peer].send('knot.fileshare.rescind', { name: fileName });
	}
});

$(document).on('click', '.knot-file-download', function(){
	var fileName = $(this).parent().data('name');
	var session  = $(this).parent().data('session');
	peerRouters[session].send('knot.fileshare.request', { name: fileName });
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
