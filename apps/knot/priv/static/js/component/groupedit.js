;define([
	'jquery',
	'underscore',
	'component/treedoc',
	'lib/codemirror',
	'component/datastore',
], function($, _, TreeDoc, CodeMirror, KnotData){
'use strict';

var dataStore = new KnotData;

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
	var td = new TreeDoc;
	var propagateChange = function(ed, event) {
		var msg = _.pick(event, 'from', 'to', 'text', 'origin');
		//var startPos = ed.indexFromPos(event.from);
		//event.text.join('\n').split('').map(function(item, index){
		//	td.insertLocal(startPos+index, item);
		//});
		conn.send('knot.edit.doc.update', msg);
		return;
	};
	CodeMirror.modeURL = options.modeURL;
	return $(this).each(function() {
		var editor = CodeMirror(this, options.editorOptions);
		conn.addEventHandlers({
			'knot.edit.doc.update': function(key, event, raw){
				if (dataStore.get('self').id !== raw.from) {
					editor.off('beforeChange', propagateChange);
					var cursorPos = editor.doc.getCursor();
					editor.doc.replaceRange(event.text, event.from, event.to);
					editor.doc.setCursor(cursorPos);
					editor.on('beforeChange', propagateChange);
				}
			}
		});
		editor.on('beforeChange', propagateChange);
		editor.on('cursorActivity', function(ed){
			conn.send('knot.edit.cursor.move', editor.doc.getCursor());
		});
	});
};

});
