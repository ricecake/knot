-module(knot_app).

-behaviour(application).

%% Application callbacks
-export([start/2, stop/1]).

%% ===================================================================
%% Application callbacks
%% ===================================================================

start(_StartType, _StartArgs) ->
	case knot_sup:start_link() of
		{ok, Pid} ->
			Dispatch = cowboy_router:compile([
				{'_', [
					{"/ws/",          knot_msg_handler, #{}},
					{"/:channel",     knot_page,        engage},
					{"/",             knot_page,        index},
					{"/static/[...]", cowboy_static, {priv_dir, knot, "static/"}}
				]}
			]),
			{ok, _} = cowboy:start_clear(knot, 25, [{ip, {127,0,0,1}}, {port, 8585}], #{
							env => #{ dispatch => Dispatch }
			}),
			{ok, Pid}
	end.

stop(_State) ->
	ok.
