;(function(){
'use strict';

$(document).ready(function(){
        var connection = new KnotConn({
		url: '/ws/',
		eventHandlers: {
			'#': function(key, content, raw) {
				console.log([key, content, raw]);
			}
		},
		onOpen: function() {
			connection.send('knot.session.join', { channel: $('#knot-channel-name').val() });
			//$('#knot-chat').knotChat({
			//	connection: connection
			//});
			//$('#knot-edit').knotGroupEdit({
			//	connection: connection
			//});
			//$('#knot-video').knotVideoChat({});
			//$('#knot-board').knotWhiteBoard({});
			//$('#knot-session').knotSession({});
		}
	});
});

}());
