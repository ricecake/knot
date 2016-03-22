;(function(root, factory){
	if (typeof define === 'function' && define.amd) {
		define(['underscore'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('underscore'));
	} else {
		root.KnotConn = factory(root._);
	}
}(this, function(_){
'use strict';


var defaults = {
	url: '/ws/',
	traits: {},
	eventHandlers: {
		'ping': function() {
			this.send('pong', null);
		}
	},
	connector: function(options) {
		return new WebSocket(options.url);
	},
	onClose: function(){
		var object = this;
		setTimeout(function(){
			object.connect(object.options);
		}, 10000);
	}
};

/** Returns a new knotConnection object.
 *
 * @constructor
 *
 * @param {Object} options - Options controlling the construction of the connection
 * @param {Object} options.eventHandlers - Default route/callback pairs for connection
 * @param {Function} options.onOpen - Action to take when opening connection
 * @param {Function} options.onClose - Action to take when connection closes
 *
**/
var KnotConn = function (options) {
	options = _.extend({}, defaults, options);
	this.eventHandlers = { value: [], tree: {} };
	this.addEventHandlers(options.eventHandlers);
	options.url = url(options.url);
	if (options.connection) {
		this.connection = options.connection;
	} else {
		this.connect(options);
	}
	this.options = options;
	this.state = {};
	return this;
};

KnotConn.prototype.connect = function(options) {
	if (this.connection != undefined) {
		this.connection.close();
	}
	this.connection = options.connector(options);
	this.connection.onopen = options.onOpen.bind(this);
	this.connection.onmessage = this._messageHandler.bind(this);
	this.connection.onclose = options.onClose.bind(this);
	return this;
};

/** Adds route handlers to an existing connection
 *
 * @param {Object} Handlers - An object consisting of route -> callback pairs.
 *
**/
KnotConn.prototype.addEventHandlers = function(Handlers) {
	var handlers = this.eventHandlers;
	_.each(Handlers, function(callback, key) {
		var terminal = key.split('.').reduce(function (node, label) {
			if(!_.has(node.tree, label)) {
				node.tree[label] = { value: [], tree: {} };
			}
			return node.tree[label];
		}, handlers);
		terminal.value.push(callback);
	});
};

function matchingTrieNodes(Key, Trie) {
	var callbackList = [];
	Key.split('.').reduce(function (node, label, offset, array) {
		if (node === undefined) {
			return undefined;
		}
		if (offset === array.length-1 ) {
			if (_.has(node.tree, '#')) {
				callbackList = callbackList.concat(node.tree['#'].value);
			}
			if (_.has(node.tree, '*')) {
				callbackList = callbackList.concat(node.tree['*'].value);
			}
			if (_.has(node.tree, label)) {
				callbackList = callbackList.concat(node.tree[label].value);
			}
			return undefined;
		} else {
			if (_.has(node.tree, '#')) {
				for(var i=1; i<array.length;i++){
					var subKey = array.slice(offset+i).join('.');
					var newCallbacks = matchingTrieNodes(subKey, node.tree['#']);
					callbackList = callbackList.concat(newCallbacks);
				}
				callbackList = callbackList.concat(node.tree['#'].value);
			}
			if (_.has(node.tree, '*')) {
				var subKey = array.slice(offset+1).join('.');
				var newCallbacks = matchingTrieNodes(subKey, node.tree['*']);
				callbackList = callbackList.concat(newCallbacks);
			}
			return node.tree[label];
		}
	}, Trie);
	return callbackList;
}

/** Manually trigger a route to fire
 *
 * @param {String} key - The route key for event
 * @param {Object} content - the message content
 * @param {Object} [raw] - the "raw" decoded message
 *
**/
KnotConn.prototype.trigger = function(key, content, decoded) {
	var callbacks = matchingTrieNodes(key, this.eventHandlers);
	var object = this;
	_.map(callbacks, function(callback) {
		callback.call(object, key, content, decoded);
	});
}

KnotConn.prototype._messageHandler = function(event) {
	var type, content;
	var decoded = JSON.parse(event.data);
	type = decoded.type;
	content = decoded.content;
	this.trigger(type, content, decoded);
}

/** Send a message over the connection
 *
 * @param {String} key - message routing key
 * @param {Object} [content] - message body
 * @param {Object} [extra] - extra fields to set on message body
 *
**/
KnotConn.prototype.send = function(key, content, extra) {
	var data = _.extend({}, this.traits, extra, {
		'type': key
	});
	if (content) {
		data.content = content;
	}
	var message = JSON.stringify(data);
	this.connection.send(message);
	return this;
}

function url(s) {
	var l = window.location;
	return ((l.protocol === "https:") ? "wss://" : "ws://") + l.hostname + (((l.port != 80) && (l.port != 443)) ? ":" + l.port : "") + s;
}

return KnotConn;
}));
