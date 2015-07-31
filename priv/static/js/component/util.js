;(function(){
'use strict';
window.Knot = window.Knot || {};

var util = {
	url: function(s) {
		var l = window.location;
		return ((l.protocol === "https:") ? "wss://" : "ws://") + l.hostname + (((l.port != 80) && (l.port != 443)) ? ":" + l.port : "") + (l.pathname?l.pathname:'') + s;
	}
};

Knot.Util = util;

}());
