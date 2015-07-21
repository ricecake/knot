;(function(){
'use strict';

$(document).ready(function(){
        var connection = new knotConn({ url:'/ws/' });
	$('#testcontent').knotChat({ connection: connection, channel: 'mainpage' });
});

}());
