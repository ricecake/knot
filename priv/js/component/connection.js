;(function(){
'use strict';


//var obj = { value: [], tree: {} };
//'a.b.c.d.e.f'.split('.').reduce(function (last, curr) {
//  console.log(last);
//  last.tree[curr] = { value: [], tree: {} };
//  return last.tree[curr];
//},obj);

/*
 * Need to write some logic to implement trie behavior for matching
 * Basically: '*' matches any one label; '#' matches any number of labels
 * when a message comes in, we traverse the tree, executing callbacks in depth first pre order
 * when we hit a star in the binding, we'll need to traverse the subtree with the next label popped off,
 * regardless of what it is.
 * When we hit a hash, we'll need to do that many times, untill we've exhausted the entire routing key,
 * and then execute any callbacks bound to the hash itself.
 */

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

KnotConn.prototype.addEventHandlers = function(Handlers) {
	_.each(Handlers, function(callback, key) {
		key.split('.').reduce(function (node, label) {
		  node.tree[label] = { value: [], tree: {} };
		  return node.tree[label];
		}, this.eventHandlers);
	});
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
