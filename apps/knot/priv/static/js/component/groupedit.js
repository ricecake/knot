;define([
	'jquery',
	'underscore',
	'component/treedoc',
	'lib/codemirror'
], function($, _, TreeDoc, CodeMirror){
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
	var td = new TreeDoc;
	var propagateChange = function(ed, event) {
		var msg = _.pick(event, 'from', 'to', 'text', 'origin');
		var startPos = ed.indexFromPos(event.from);
		event.text.join('\n').split('').map(function(item, index){
			td.insertLocal(startPos+index, item);
		});
		conn.send('knot.edit.doc.update', msg);
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
