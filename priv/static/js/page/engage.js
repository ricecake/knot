;(function(){
'use strict';

$(document).ready(function(){
        var connection = new KnotConn({
		url: '/ws/',
		eventHandlers: {
			'#': function(key, content) {
			}
		},
		onOpen: function() {
			connection.send('session.join', { channel: $('#knot-channel-name').val() });
			$('#knot-chat').knotChat({
				connection: connection
			});
		}
	});
});

}());
