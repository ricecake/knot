;(function($){
'use strict';

var defaults = {
	chatClass: 'knot-chat-window',
	messageClass: 'knot-chat-message',
	inputClass: 'knot-chat-input',
	buttonClass: 'knot-chat-send-button'
};

$.fn.knotChat = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
	});
}

}(jQuery));
