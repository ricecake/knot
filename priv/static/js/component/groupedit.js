;(function($, _){
'use strict';

var defaults = {
	editorOptions: {
		lineNumbers: true
	}
};

$.fn.knotGroupEdit = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		var editor = CodeMirror(this, options.editorOptions);
	});
};

}(jQuery, _));
