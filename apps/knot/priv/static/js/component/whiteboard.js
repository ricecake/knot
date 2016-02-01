;define([
	'jquery',
	'tpl!template/whiteboardWidget'
], function($,containerMarkup){
'use strict';

var containerMarkup = _.template(
"<div class='content'>"+
	"<div id='<% canvasClass %>' >"+
		"<canvas id='system-overlay' width='<% width %>' height='<% height %>' class='canvas'></canvas>"+
		"<canvas id='canvas' class='canvas' width='<% width %>' height='<% height %>' ></canvas>"+
	"</div>"+
	"<div id='controls'>"+
		"<div class='input-container'>"+
			"<label for='colorpicker'> Color:</label>"+
			"<input id='colorpicker' data-role='none' type='color' name='color' value='#000000' />"+
			"<label for='size-control'>Size:</label>"+
			"<div id='size-control' type='range' value=5 min=1 max=150></div><input id='size-display'>"+
		"</div>"+
		"<button id='clear-canvas' type='button'>Clear</button>"+
	"</div>"+
"</div>"
);

var defaults = {
	width: 1800,
	height: 900,
	canvasClass: 'knot-canvas'
};

$.fn.knotWhiteBoard = function (options) {
	options = $.extend({}, defaults, options);
	return $(this).each(function() {
		$(this).append($(containerMarkup(options)));
	});
};

});
