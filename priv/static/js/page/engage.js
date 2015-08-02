;(function(){
'use strict';

$(document).ready(function(){
        var connection = new KnotConn({
		url: '/ws/',
		eventHandlers: {
			'#': function(key, content) {
				console.log(key, content);
			}
		},
		onOpen: function() {
			$('#knot-chat').knotChat({ connection: connection, channel: 'mainpage' });
		}
	});
});

}());
