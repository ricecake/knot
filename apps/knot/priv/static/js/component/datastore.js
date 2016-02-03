;define([], function(){
'use strict';

var KnotData = function () {
	return this;
};

KnotData.prototype.set = function(key, value) {
	return localStorage.setItem(key, JSON.stringify(value));
};

KnotData.prototype.get = function(key) {
	return JSON.parse(localStorage.getItem(key));
};

KnotData.prototype.do = function(key, callback) {
	var value = this.get(key) || {};
	var res = callback.call(value);
	this.set(key, value);
	return res;
};

return KnotData;
});
