;define([
	'jquery',
	'underscore',
	'component/datastore',
	'lib/jdenticon-1.3.2.min',
	'tpl!template/session',
	'tpl!template/session-entry'
], function($,_,KnotData, identicon, containerMarkup,entry){
'use strict';
var defaults = {
	nickname: 'Anonymous User'
};

$.fn.knotSession = function (options) {
	var dataStore = new KnotData;
	options = $.extend({}, defaults, options);
	var conn = options.connection;
	return $(this).each(function() {
		var viewer = $(containerMarkup(options));
		$(this).append(viewer);
		conn.addEventHandlers({
			'knot.session.join': function(key, content, raw){
				dataStore.do(raw.from, function() {
					$.extend(this, content);
				});
				if (dataStore.get('self').id !== raw.from) {
					dataStore.do('self', function() {
						conn.send('knot.session.data.update', _.omit(this, 'id'), {
							to: raw.from
						});
					});
				} else {
					dataStore.do(raw.from, function() {
						$.extend(this, dataStore.get('self'));
					});
				}
				var entity = dataStore.get(raw.from);
				var element = $(entry($.extend({ session: raw.from }, options, entity)));
				identicon.update(element.find('.session-identicon')[0]);
				viewer.find('.knot-session-icon-container').append(element);
			},
			'knot.session.details': function(key, content, raw) {
				dataStore.do('self', function() {
					$.extend(this, content);
				});
			},
			'knot.session.data.update': function(key, content, raw) {
				dataStore.do(raw.from, function() {
					$.extend(this, content);
				});
				var entity = dataStore.get(raw.from);
				var element = $(entry($.extend({ session: raw.from }, options, entity)));
				identicon.update(element.find('.session-identicon')[0]);
				if(viewer.find('[data-session="'+ raw.from +'"]').length === 0) {
					viewer.find('.knot-session-icon-container').append(element);
				} else {
					viewer.find('[data-session="'+ raw.from +'"]').replaceWith(element);
				}
			},
			'knot.session.disconnected': function(key, content, raw) {
				viewer.find('[data-session="'+ raw.from +'"]').remove();
			}
		});
	});
};

});
