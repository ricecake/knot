-module(knot_session_srv).
-behaviour(gen_server).
-define(SERVER, ?MODULE).

%% ------------------------------------------------------------------
%% API Function Exports
%% ------------------------------------------------------------------

-export([start_link/1, bind/2, send/3, process/3, control/2]).

%% ------------------------------------------------------------------
%% gen_server Function Exports
%% ------------------------------------------------------------------

-export([init/1, handle_call/3, handle_cast/2, handle_info/2,
         terminate/2, code_change/3]).

%% ------------------------------------------------------------------
%% API Function Definitions
%% ------------------------------------------------------------------

start_link(Args) ->
    gen_server:start_link(?MODULE, Args, []).

bind(Session, Channel)->
    gen_server:call(Session, {bind, {self(), Channel}}).

send(Session, Channel, Message)->
    gen_server:call(Session, {send, {Channel, Message}}).

process(Session, Channel, Message)->
    gen_server:call(Session, {process, {Channel, Message}}).

control(Session, Event) ->
	gen_server:call(Session, {control, Event}).

%% ------------------------------------------------------------------
%% gen_server Function Definitions
%% ------------------------------------------------------------------

init(#{sockets := [Socket]} = Args) ->
	monitor(process, Socket),
	{ok, State} = storeRow(Args#{ channel => [] }),
	knot_msg_handler:send(Socket, <<"session.data">>, maps:with([id, meta], State)),
	{ok, State}.

handle_call({bind, {Socket, _Channel}}, _From, #{ sockets := Sockets } = State) ->
	monitor(process, Socket),
	{ok, NewState} = storeRow(State#{ sockets := lists:umerge([Socket], Sockets) }),
	knot_msg_handler:send(Socket, <<"session.data">>, maps:with([id, meta], NewState)),
	{reply, ok, NewState}.
handle_call(_Request, _From, State) ->
    {reply, ok, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info({'DOWN', _Ref, _Type, Socket, _Exit}, #{sockets := Sockets } = State) ->
    {noreply, State#{ sockets := lists:delete(Socket, Sockets) }}.

terminate(_Reason, #{ id := Id } = State) ->
	ok = case maps:find(channel, State) of
		{ok, Channel} ->
			knot_storage_srv:sendChannel(Channel, signal, {<<"channel.shutdown">>, #{ sessionid => Id }});
		error -> ok
	end,
	knot_storage_srv:leaveChannel('_', State),
	knot_storage_srv:deleteSession(Id).

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%% ------------------------------------------------------------------
%% Internal Function Definitions
%% ------------------------------------------------------------------

storeRow(#{ id := Id, meta := Meta } = State) ->
	knot_storage_srv:storeSession(Id, self(), Meta),
	{ok, State}.

mapMerge(A, B) when is_map(A), is_map(B) -> maps:from_list(lists:append(maps:to_list(A), maps:to_list(B))).
