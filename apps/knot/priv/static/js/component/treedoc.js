;define([], function(){
'use strict';

var TreeDoc = function () {
	this._tree = {};
	return this;
};

TreeDoc.prototype.insertLocal = function(pos, value) {
	var tree = this._tree;
	var idP, idF;
	var incrementPOS = function(curr, incr) {
		if (typeof curr.left !== 'undefined') {
			incrementPOS(curr.left, incr);
		}
		curr.pos += incr;
		if (typeof curr.right !== 'undefined') {
			incrementPOS(curr.right, incr);
		}
	};
	var searcher = function(curr) {
		if (typeof curr.uuid === 'undefined') {
			curr.uuid = '0';
			curr.pos = pos;
			curr.value = value;
			idP = '00';
			idF = '01';
		}
		else if (curr.pos >= pos) {
			curr.pos += 1;
			if (typeof curr.right !== 'undefined') {
				incrementPOS(curr.right, 1);
			}
			idF = curr.uuid;
			if (curr.left) {
				searcher(curr.left);
			}
			else {
				if (typeof idP === 'undefined') {
					idP = curr.uuid + '00';
				}
				curr.left = {
					uuid: curr.uuid + '0',
					pos: pos,
					value: value
				}
			}
		}
		else if (curr.pos < pos) {
			idP = curr.uuid;
			if (curr.right) {
				searcher(curr.right);
			}
			else {
				if (typeof idF === 'undefined') {
					idF = curr.uuid + '11';
				}
				curr.right = {
					uuid: curr.uuid + '1',
					pos: pos,
					value: value
				}
			}
		}
	};
	searcher(tree);
	//console.log(JSON.stringify(tree, undefined, 2));
	//console.log(this.serialize());
	return {
		p: idP,
		f: idF,
		v: value,
		op: '+'
	};
};

TreeDoc.prototype.serialize = function() {
	var res = [];
	var traverse = function(curr) {
		if (typeof curr.left !== 'undefined') {
			traverse(curr.left);
		}
		res.push(curr.value);
		if (typeof curr.right !== 'undefined') {
			traverse(curr.right);
		}
	};
	traverse(this._tree);
	return res.join('');
};

return TreeDoc;
});
