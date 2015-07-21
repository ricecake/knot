;(function($){
'use strict';

function markup(options) {
	return [
	].join('');
};

var defaults = {
};

$.fn.knotGroupEdit = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(markup(options)));
	});
};

}(jQuery));
