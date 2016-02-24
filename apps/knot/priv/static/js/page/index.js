;define(['jquery', 'KnotConn', 	'component/datastore', 'materialize'], function($, KnotConn, KnotData){
'use strict';

$(document).ready(function(){
	var connection;
	var needSetup = true;
	var dataStore = new KnotData;
	var forwardToChannel = function() {
		var details = {
			channel: $('#channel_name').val(),
			nickname: $('#nick_name').val()
		};
		dataStore.do('self', function() {
			$.extend(this, details);
		});
		connection.send('knot.session.join', {
			channel: details.channel
		});
		connection.send('knot.session.data.update', {
			nickname: details.nick
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

});
