;define([
	'jquery',
	'component/datastore',
	'tpl!template/session',
	'tpl!template/session-entry'
], function($,KnotData,containerMarkup,entry){
'use strict';
var defaults = {
	sessionClass: 'knot-session-widgit',
	iconsClass: 'knot-session-icon-container',
	iconClass: 'knot-session-icon',
	identifier: 'Anonymous User'
};

$.fn.knotSession = function (options) {
	var dataStore = new KnotData;
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		var viewer = $(containerMarkup(options));
		$(this).append(viewer);
		options.connection.addEventHandlers({
			'knot.session.join': function(key, content, raw){
				dataStore.set(raw.from, {});
				viewer.find('.'+options.iconsClass).append($(entry($.extend({}, content, options))));
			}
		});
	});
};

});
