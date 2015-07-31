;(function(){
'use strict';

$(document).ready(function(){
	$('.modal-trigger').leanModal({
		//dismissible: false,
		ready: function() {
			var connection = new KnotConn({
				url: 'ws',
				eventHandlers: {
					'#': function(key, content) {
						console.log(key, content);
					}
				},
				onOpen: function() {
				}
			});
		},
		complete: function() {
			alert('gone');
		}
	});
});

}());
