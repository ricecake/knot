requirejs.config({
	baseUrl: 'static/js',
	paths: {
		jquery: 'lib/jquery-2.1.1.min',
		underscore: 'lib/underscore-min',
		KnotConn: 'component/connection',
		msgpack: 'lib/msgpack.min',
		text: 'lib/text',
		tpl: 'lib/tpl',
		template: '../template',
		materialize: 'lib/materialize.min',
		hammerjs: 'lib/hammer.min',
	},
	shim: {
		jquery: {
			exports: '$'
		},
		underscore: {
			exports: '_'
		},
		materialize: {
			deps: ['jquery', 'hammerjs']
		},
		KnotConn: {
			exports: 'KnotConn'
		}
	}
});
