;(function(){
'use strict';


//var obj = { value: [], tree: {} };
//'a.b.c.d.e.f'.split('.').reduce(function (last, curr) {
//  console.log(last);
//  last.tree[curr] = { value: [], tree: {} };
//  return last.tree[curr];
//},obj);

var defaults = {
	eventHandlers: {}
};

var KnotConn = function (options) {
	options = _.extend({}, defaults, options);
	this.eventHandlers = { value: [], tree: {} };
	this.addEventHandlers(options.eventHandlers);
	var ws = this.WebSocket = new WebSocket(options.url);
	ws.onopen = options.onOpen;
	ws.onmessage = this._messageHandler.bind(this);
};

KnotConn.prototype._messageHandler = function(event) {
	var type, content;
	var decoded = JSON.parse(event.data);
	type = decoded.type;
	content = decoded.content;
	console.log([type, content]);
	_.map(this.eventHandlers[type], function(callback) {
		callback(content);
	});
}

KnotConn.prototype.send = function(key, content) {
	var message = JSON.stringify({
		'type': key,
		'content': content
	});
	this.WebSocket.send(message);
	return this;
}

window.KnotConn = KnotConn;
}());
