;define([
	'jquery',
	'tpl!template/whiteboardWidget'
], function($,containerMarkup){
'use strict';

var defaults = {
	width: 1800,
	height: 900
};

$.fn.knotWhiteBoard = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(containerMarkup(options)));
	});
};

});
