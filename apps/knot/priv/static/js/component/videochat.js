;define([
	'jquery',
	'tpl!template/videoChatWidget',
	'lib/webRTCAdapter'
], function($,containerMarkup){
'use strict';

var defaults = {
};

$.fn.knotVideoChat = function (options) {
	options = $.extend({}, defaults, options);
	var localStream;

	return $(this).each(function() {
		var container = $(containerMarkup(options));
		$(this).append(container);
		window.getUserMedia({ audio: true, video: true },
			function (stream) {
				var localVideo = container.find('.local-video')[0];
				localStream = stream;
				window.attachMediaStream(localVideo, localStream);
			},
			function (e) {
				window.console.log(e);
			}
		);
	});
};

});
