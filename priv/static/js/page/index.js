;(function(){
'use strict';

$(document).ready(function(){
	var needSetup = true;
	var connection;
	$('.modal-trigger').leanModal({
		ready: function() {
			if (needSetup) {
				connection = new KnotConn({
					url: 'ws',
					eventHandlers: {
						'#': function(key, content) {
							console.log(key, content);
						}
					},
					onOpen: function() {
					}
				});
			}
		},
		complete: function() {
			alert('gone');
		}
	});
});

}());
