;(function($,_){
'use strict';
var containerMarkup = _.template(
"<div class='<%= sessionClass %>'>"+
	"<ul class='<%= iconsClass %>'></ul>"+
"</div>"
);

var iconMarkup = _.template(
	"<li class='<%= iconClass %>'><span><%= identifier %></span></li>"
);

var defaults = {
	sessionClass: 'knot-session-widgit',
	iconsClass: 'knot-session-icon-container',
	iconClass: 'knot-session-icon',
	identifier: 'Anonymous User'
};

$.fn.knotSession = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(containerMarkup(options)));
	});
};

}(jQuery, _));
