;define([
	'jquery',
	'underscore'
], function($, _){
'use strict';

var defaults = {
};

$.fn.knotChecklist = function (options) {
	options = $.extend({}, defaults, options);
	var conn = options.connection;
	return $(this).each(function() {
		conn.addEventHandlers({});
		$(this).append($(containerMarkup(options)));
	});
};

});
