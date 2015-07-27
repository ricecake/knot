;(function($, _){
'use strict';

var containerMarkup = _.template(
"<div class='<%= chatClass %>'>"+
	"<div class='<%= headerClass %>'>"+
		"<%= channel %>"+
	"</div>"+
	"<ul class='<%= dialogClass %>'></ul>"+
	"<div class='<%= inputSectionClass %>'>"+
		"<input type='text' class='<%= inputClass %>'></input>"+
		"<button class='<%= buttonClass %>'>"+
			"<%= buttonText %>"+
		"</button>"+
	"</div>"+
"</div>"
);

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
		$(this).append($(containerMarkup(options)));
		options.connection.send('join-channel', { channel: options.channel });
		$(this).find('.'+options.buttonClass).on('click', function() {
		});
	});
};

}(jQuery, _));
