-module(knot_msg_handler).

%% Cowboy callback
-export([init/2]).
-export([websocket_handle/3]).
-export([websocket_info/3]).


%% API exports
-export([send/3, send/4]).

%% ===================================================================
%% Cowboy callbacks
%% ===================================================================

init(Req, Opts) ->
	{ok, Req2, State} = initSession(Req, Opts),
	{cowboy_websocket, Req2, State}.

websocket_handle({text, JSON} = Data, Req, State) ->
	Message = jiffy:decode(JSON, [return_maps]),
	case handle_client_task(Message, State) of
		{reply, Data, NewState} -> {reply, {text, jiffy:encode(Data)}, Req, NewState};
		{ok, NewState} -> {ok, Req, NewState}
	end;
websocket_handle(_Frame, Req, State) ->
	{ok, Req, State}.

websocket_info({send, Message}, Req, State) ->
	{reply, {text, Message}, Req, State};
websocket_info(Message, Req, State) ->
	{reply, Message, Req, State}.


%% ------------------------------------------------------------------
%% API Function Definitions
%% ------------------------------------------------------------------

send(Handler, Type, Message) ->
	send(Handler, Type, Message, #{}).

send(Handler, Type, Message, Base) when is_map(Base) ->
	Handler ! {send, jiffy:encode(Base#{type => Type, content => Message })},
	ok.


%% ------------------------------------------------------------------
%% Internal Function Definitions
%% ------------------------------------------------------------------

initSession(Req, State) ->
	#{sessionid := SessionId} = cowboy_req:match_cookies([{sessionid, [], undefined}], Req),
	case SessionId of
		undefined       -> initializeNewSession(Req, State);
		ExistingSession -> bindExistingSession(Req, State, ExistingSession)
	end.

initializeNewSession(Req, State) ->
	{NewSessionId, Pid} = knot_session:create(extractMetaInfo(Req)),
	Req2 = cowboy_req:set_resp_cookie(<<"sessionid">>, NewSessionId, [{path, cowboy_req:path(Req)}], Req),
	{ok, Req2, State#{ sessionid => NewSessionId, pid => Pid }}.

bindExistingSession(Req, State, SessionId) ->
	case knot_storage_srv:findSession(SessionId) of
		undefined -> initializeNewSession(Req, State);
		{ok, {SessionId, Pid}} ->
			knot_session:bind(Pid, extractMetaInfo(Req)),
			{ok, Req, State#{ sessionid => SessionId, pid => Pid }}
	end.

extractMetaInfo(Req) ->
	IP        = cowboy_req:header(<<"x-real-ip">>,    Req, <<"unknown">>),
	UserAgent = cowboy_req:header(<<"user-agent">>, Req, <<"unknown">>),
	#{ <<"User-Agent">> => UserAgent, <<"IP">> => IP }.

handle_client_task(#{ <<"type">> := Type, <<"content">> := Content, <<"to">> := Recipient } , #{ pid := Pid } = State) ->
	ok = knot_session:notify(Pid, direct, {Recipient, {Type, Content}}),
	{ok, State};
handle_client_task(#{ <<"type">> := Type, <<"content">> := Content } , #{ pid := Pid } = State) ->
	ok = knot_session:notify(Pid, Type, Content),
	{ok, State};
handle_client_task(#{ <<"type">> := Type } , #{ pid := Pid } = State) ->
	ok = knot_session:notify(Pid, Type, #{}),
	{ok, State};
handle_client_task(_Message, State) -> {ok, State}.
