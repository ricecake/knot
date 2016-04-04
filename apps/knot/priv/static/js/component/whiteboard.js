;define([
	'jquery',
        'underscore',
	'tpl!template/whiteboardWidget'
], function($, _, containerMarkup){
'use strict';

var defaults = {
	width: 1800,
	height: 900
};

$.fn.knotWhiteBoard = function (options) {
	options = $.extend({}, defaults, options);
        var conn = options.connection;
	return $(this).each(function() {
                conn.addEventHandlers({});
		$(this).append($(containerMarkup(options)));
	});
};

});
