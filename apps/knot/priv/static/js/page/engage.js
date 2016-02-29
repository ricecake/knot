;define([
	'jquery',
	'KnotConn',
	'component/peerConnection',
	'component/chat',
	'component/groupedit',
	'component/session',
	'component/videochat',
	'component/fileShare'
], function($, KnotConn, peerManager){
'use strict';
var needsSetup = true;
var pcm = new peerManager();

pcm.wait('load');

$(document).ready(function(){
        var connection = new KnotConn({
		url: '/ws/',
		onOpen: function() {
			pcm.ensureSignalChannel(connection);
			if (needsSetup) {
				connection.send('knot.session.join', {
					channel: $('#knot-channel-name').val()
				});

				$('#knot-chat').knotChat({
					connection: connection
				});
				$('#knot-edit').knotGroupEdit({
					connection: connection
				});
				$('#knot-video').knotVideoChat({
					connection: connection
				});
				//$('#knot-fileshare').knotWhiteBoard({
				//	connection: connection
				//});
				$('#knot-session').knotSession({
					connection: connection
				});
				//$('#knot-fileshare').knotFileShare({
				//	connection: connection
				//});

				pcm.ready('load');
			}
		}
	});
});

});
