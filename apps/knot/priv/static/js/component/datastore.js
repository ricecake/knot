;define([], function(){
'use strict';

var KnotData = function () {
	this.monitors = {};
	return this;
};

KnotData.prototype.set = function(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
	for (var watched in this.monitors) {
		for (var i in this.monitors[watched]) {
			this.do(key, this.monitors[watched][i]);
		}
	}
	return value;
};

KnotData.prototype.get = function(key) {
	return JSON.parse(localStorage.getItem(key)) || {};
};

KnotData.prototype.do = function(key, callback) {
	var value = this.get(key) || {};
	var res = callback.call(value);
	this.set(key, value);
	return res;
};

KnotData.prototype.onChange = function(key, callback) {
	if(!(key in this.monitors)) {
		this.monitors[key] = [];
	}
	this.monitors[key].concat(callback);
	return this;
};

return KnotData;
});
