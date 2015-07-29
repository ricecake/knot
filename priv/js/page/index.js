;(function(){
'use strict';

$(document).ready(function(){
        var connection = new KnotConn({
		url: 'ws',
		onOpen: function() {
			$('#testcontent').knotChat({ connection: connection, channel: 'mainpage' });
		}
	});
});

}());
