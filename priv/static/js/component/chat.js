;(function($, _){
'use strict';

var containerMarkup = _.template(
"<div class='<%= chatClass %>'>"+
	"<div class='<%= headerClass %>'>"+
		"Chat"+
	"</div>"+
	"<ul class='<%= dialogClass %>'></ul>"+
	"<form class='<%= inputSectionClass %>'>"+
		"<input type='text' class='<%= inputClass %>'></input>"+
		"<button class='<%= buttonClass %>'>"+
			"<%= buttonText %>"+
		"</button>"+
	"</form>"+
"</div>"
);
var messageMarkup = _.template(
	"<li class='<%= messageClass %>'><span><%= message %></span></li>"
);

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
				options.connection.send('chat.message',
					{ message: message }
				);
				$input.value = '';
			}
			return false;
		};
		options.connection.addEventHandlers({
			'chat.message': function(key, content){
				dialog.append($(messageMarkup($.extend({}, content, options))));
				dialog[0].scrollTop = dialog[0].scrollHeight;
			}
		});
		$(this).find('.'+options.inputSectionClass).on('submit', sendMessage);
	});
};

}(jQuery, _));
