;(function($, _){
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
	CodeMirror.modeURL = options.modeURL;
	return $(this).each(function() {
		var editor = CodeMirror(this, options.editorOptions);
		conn.addEventHandlers({
			'edit.doc.update': function(key, event, raw){
				editor.doc.replaceRange(event.text.join(''), event.from, event.to);
			}
		});
		editor.on('change', function(ed, event){
			conn.send('edit.doc.update', {
				text: event.text,
				from: event.from,
				to: event.to
			});
			//setTimeout(function(){
			//	console.log(editor, event);
			//	editor.doc.replaceRange(event.text.join(''), event.from, event.to);
			//}, 10);
		});
	});
};

}(jQuery, _));
