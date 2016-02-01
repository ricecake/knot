;define(['jquery', 'tpl!template/chat','tpl!template/chat-message'], function($,containerMarkup,messageMarkup){
'use strict';

var defaults = {
	chatClass: 'knot-chat-window',
	dialogClass: 'knot-dialog',
	messageClass: 'knot-chat-message',
	inputSectionClass: 'knot-user-input',
	inputClass: 'knot-chat-input',
	buttonClass: 'knot-chat-send-button',
	headerClass: 'knot-chat-header',
	buttonText: 'Send'
};

$.fn.knotChat = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(containerMarkup(options)));
		var that = $(this);
		var dialog = that.find('.'+options.dialogClass);
		var sendMessage = function() {
			var $input = that.find('.'+options.inputClass)[0];
			var message = $input.value;
			if (message !== '') {
				options.connection.send('knot.chat.message',
					{ message: message }
				);
				$input.value = '';
			}
			return false;
		};
		options.connection.addEventHandlers({
			'knot.chat.message': function(key, content){
				dialog.append($(messageMarkup($.extend({}, content, options))));
				dialog[0].scrollTop = dialog[0].scrollHeight;
			}
		});
		$(this).find('.'+options.inputSectionClass).on('submit', sendMessage);
	});
};

});
