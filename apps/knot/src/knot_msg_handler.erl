-module(knot_msg_handler).

%% Cowboy callback
-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).
-export([terminate/3]).

%% ===================================================================
%% Cowboy callbacks
%% ===================================================================

init(Req, Opts) ->
	{ok, Req2, State} = initSession(Req, Opts),
	{cowboy_websocket, Req2, State}.

websocket_handle({text, JSON} = Data, Req, State) ->
	Message = jsx:decode(JSON, [return_maps]),
	case handle_client_task(Message, State) of
		{reply, Data, NewState} -> {reply, {text, jsx:encode(Data)}, Req, NewState};
		{ok, NewState} -> {ok, Req, NewState}
	end;
websocket_handle(_Frame, Req, State) ->
	{ok, Req, State}.

websocket_info({send, Message}, Req, State) ->
	{reply, {text, Message}, Req, State};
websocket_info(Message, Req, State) ->
	{reply, Message, Req, State}.

terminate(_, Req, #{ channel := Channel, sessionid := UID } = State) ->
	pubsub:publish(Channel, <<"knot.session.disconnected">>, #{
		from => UID,
		type => <<"knot.session.disconnected">>,
		content => #{}
	}),
	{ok, Req, State}.

%% ------------------------------------------------------------------
%% API Function Definitions
%% ------------------------------------------------------------------

send(Handler, Message) when is_map(Message) ->
	Handler ! {send, jsx:encode(Message)},
	ok.


%% ------------------------------------------------------------------
%% Internal Function Definitions
%% ------------------------------------------------------------------

initSession(Req, State) ->
	#{ sessionid := SessionId } = cowboy_req:match_cookies([{sessionid, [], undefined}], Req),
	{ok, Req2, NewState} = case SessionId of
		undefined       -> initializeNewSession(Req, State);
		ExistingSession -> bindExistingSession(Req, State, ExistingSession)
	end,
	#{ sessionid := Sess } = NewState,
	send(self(), #{
		from    => Sess,
		type    => <<"knot.session.details">>,
		content => #{
			id => Sess
		}
	}),
	{ok, Req2, NewState}.

initializeNewSession(Req, State) ->
	UUID = erlang:list_to_binary(uuid:uuid_to_string(uuid:get_v4())),
	Req2 = cowboy_req:set_resp_cookie(<<"sessionid">>, UUID, [{path, cowboy_req:path(Req)}], Req),
	{ok, Req2, State#{ sessionid => UUID }}.

bindExistingSession(Req, State, SessionId) ->
	{ok, Req, State#{ sessionid => SessionId }}.

handle_client_task(#{ <<"type">> := <<"knot.session.join">>, <<"content">> := #{ <<"channel">> := Channel} } = Msg, #{ sessionid := UID } = State) ->
	pubsub:subscribe(Channel, [
		UID,
		<<"knot.#">>
	], fun(Sub, _From, {_Topic, Message})->
		send(Sub, Message)
	end),
	pubsub:publish(Channel, <<"knot.session.join">>, Msg#{ from => UID }),
	{ok, State#{ channel => Channel }};
handle_client_task(#{ <<"to">> := To } = Msg, #{ channel := Channel, sessionid := UID } = State) ->
	pubsub:publish(Channel, To, Msg#{ from => UID }),
	{ok, State};
handle_client_task(#{ <<"type">> := Type } = Msg, #{ channel := Channel, sessionid := UID } = State) ->
	pubsub:publish(Channel, Type, Msg#{ from => UID }),
	{ok, State};
handle_client_task(_Message, State) -> {ok, State}.
