;define(['jquery', 'tpl!template/session','tpl!template/session-entry'], function($,containerMarkup,entry){
'use strict';
var defaults = {
	sessionClass: 'knot-session-widgit',
	iconsClass: 'knot-session-icon-container',
	iconClass: 'knot-session-icon',
	identifier: 'Anonymous User'
};

$.fn.knotSession = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		var viewer = $(containerMarkup(options));
		$(this).append(viewer);
		options.connection.addEventHandlers({
			'knot.session.join': function(key, content){
				viewer.find('.'+options.iconsClass).append($(entry($.extend({}, content, options))));
			}
		});
	});
};

});
