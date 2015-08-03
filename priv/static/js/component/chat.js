;(function($, _){
'use strict';

var containerMarkup = _.template(
"<div class='<%= chatClass %>'>"+
	"<div class='<%= headerClass %>'>"+
		"<%= channel %>"+
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
	buttonText: 'Send',
	channel: 'lobby'
};

$.fn.knotChat = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		var that = this;
		var sendMessage = function() {
			var $input = $(that).find('.'+options.inputClass)[0];
			var message = $input.value;
			if (message !== '') {
				options.connection.send('chat.message',
					{ message: message }
				);
				$input.value = '';
			}
			return false;
		};
		$(this).append($(containerMarkup(options)));
		options.connection.addEventHandlers({
			'chat.message': function(key, content){
				console.log(key, content);
				$(that)
				.find('.'+options.dialogClass)
				.append($(messageMarkup($.extend({}, content, options))));
			}
		});
		$(this).find('.'+options.inputSectionClass).on('submit', sendMessage);
		//$(this).find('.'+options.buttonClass).on('click', sendMessage);
		options.connection.send('session.join', { channel: options.channel });
		options.connection.send('chat.message', { message: 'test' });
		options.connection.send('chat.message', { message: 'test more' });
	});
};

}(jQuery, _));
