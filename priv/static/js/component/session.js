;(function($,_){
'use strict';
var containerMarkup = _.template("");

var defaults = {
};

$.fn.knotSession = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(containerMarkup(options)));
	});
};

}(jQuery, _));
