;(function(){
'use strict';

$(document).ready(function(){
	var needSetup = true;
	var connection;
	$('.modal-trigger').leanModal({
		ready: function() {
			if (needSetup) {
				connection = new KnotConn({
					url: '/ws/',
					eventHandlers: {
						'#': function(key, content) {
						}
					},
					onOpen: function() {
						$('.confirm').on('click', function(){
							connection.send('session.data.update', {
								nickname: $('#nick_name').val()
							});
							$('.wait-content').slideToggle(500);
							$('.wait-indicator').slideToggle(500);
							setTimeout(function(){
								window.location.href = '/'+$('#channel_name').val();
							}, 1000);
						});
					}
				});
				needSetup = false;
			}
		},
		complete: function() {
		}
	});
});

}());
