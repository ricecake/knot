;(function($,_){
'use strict';
var containerMarkup = _.template("");

var defaults = {
};

$.fn.knotVideoChat = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(markup(options)));
	});
};

}(jQuery, _));
