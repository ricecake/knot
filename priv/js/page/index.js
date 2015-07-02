;(function(){
'use strict';

$(document).ready(function(){
        var channel = new knotConn({url:'/ws/'});
	$('#testcontent').knotChat({channel: channel});
});

}());
