;define(['jquery', 'lib/codemirror'], function($, CodeMirror){
'use strict';

var defaults = {
	modeURL: '/static/js/lib/mode/%N/%N.js',
	mode: 'erlang',
	editorOptions: {
		lineNumbers: true
	}
};

$.fn.knotGroupEdit = function (options) {
	options = $.extend({}, defaults, options);
	var conn = options.connection;
	var propagateChange = function(ed, event) {
		conn.send('knot.edit.doc.update', {
			text: event.text,
			from: event.from,
			to: event.to
		});
		return event.cancel();
	};
	CodeMirror.modeURL = options.modeURL;
	return $(this).each(function() {
		var editor = CodeMirror(this, options.editorOptions);
		conn.addEventHandlers({
			'knot.edit.doc.update': function(key, event, raw){
				editor.off('beforeChange', propagateChange)
				editor.doc.replaceRange(event.text, event.from, event.to);
				editor.on('beforeChange', propagateChange)
			}
		});
		editor.on('beforeChange', propagateChange);
	});
};

});
