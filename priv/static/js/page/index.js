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
						$('.confirm').on('click', function(){
							console.log('yay!');
							$(this).parent().slideToggle(500);
						});
					}
				});
			}
		},
		complete: function() {
		}
	});
});

}());
