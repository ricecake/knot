-module(knot_page).

-export([init/2]).

init(Req, Page) ->
	Template = binary_to_existing_atom(
		<< "knot_", (atom_to_binary(Page,utf8))/binary, "_dtl" >>, utf8
	),
	{ok, Body} = Template:render(cowboy_req:bindings(Req)),
	Req2 = cowboy_req:reply(200, [
		{<<"content-type">>, <<"text/html">>}
	], Body, Req),
	{ok, Req2, Page}.
