;(function($){
'use strict';

function markup(options) {
	return [
	].join('');
};

var defaults = {
};

$.fn.knotWhiteBoard = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(markup(options)));
	});
};

}(jQuery));
