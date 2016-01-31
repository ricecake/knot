;(function(){
'use strict';

$(document).ready(function(){
	var connection;
	var needSetup = true;
	var forwardToChannel = function() {
		console.log('here');
		connection.send('knot.session.data.update', {
			nickname: $('#nick_name').val()
		});
		$('.wait-content').slideToggle(500);
		$('.wait-indicator').slideToggle(500);
		setTimeout(function(){
			window.location.href = '/'+$('#channel_name').val();
		}, 1000);
		return false;
	};

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
							$('.knot-user-info').find(':submit').click();
						});
						$('.knot-user-info').on('submit', forwardToChannel);
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
