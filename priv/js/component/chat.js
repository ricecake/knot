;(function($){
'use strict';

function markup(options) {
	return [
		"<div class='",options.chatClass, "'>",
			"<ul class='",options.dialogClass, "'></ul>",
			"<div class='",options.inputSectionClass, "'>",
				"<input type='text' class='",options.inputClass,"'></input>",
				"<button class='",options.buttonClass,"'>",
					options.buttonText,
				"</button>",
			"</div>",
		"</div>"
	].join('');
};

var defaults = {
	chatClass: 'knot-chat-window',
	dialogClass: 'knot-dialog',
	messageClass: 'knot-chat-message',
	inputSectionClass: 'knot-user-input',
	inputClass: 'knot-chat-input',
	buttonClass: 'knot-chat-send-button',
	buttonText: 'Send',
	channel: 'lobby'
};

$.fn.knotChat = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(markup(options)));
		options.channel.send('join-channel', { channel: options.channel });
		$(this).find('.'+options.buttonClass).on('click', function() {
		});
	});
};

}(jQuery));
