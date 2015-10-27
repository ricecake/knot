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
	gen_server:cast(Session, {send, {Channel, Message}}).

process(Session, Channel, Message)->
	gen_server:cast(Session, {process, {Channel, Message}}).

control(Session, Event) ->
	gen_server:cast(Session, {control, Event}).

%% ------------------------------------------------------------------
%% gen_server Function Definitions
%% ------------------------------------------------------------------

init({Socket, Channel, Data}) ->
	[ monitor(process, Socket) || Socket <- maps:keys(SocketMap) ],
	ChannelSockets = lists:flatten([ [ {Channel, Socket} || Channel <- Channels ] || {Socket, Channels} <- maps:to_list(SocketMap)]),
	ChannelMap = lists:foldl(
		fun({Channel, Socket}, Map) ->
			case maps:find(Channel, Map) of
				{ok, Rest} -> Map#{Channel := [Socket | Rest]};
				error      -> Map#{Channel => [Socket]}
			end
		end, #{}, ChannelSockets
	),
	{ok, State} = storeRow(Args#{ channels => ChannelMap }),
	[ knot_msg_handler:send(Socket, <<"session.data">>, maps:with([id, meta], State)) || Socket <- maps:keys(SocketMap) ],
	{ok, State}.

handle_call(_Request, _From, State) ->
	{reply, ok, State}.

handle_cast({send, {Channel, Message}}, State) ->
	{noreply, State};
handle_cast({process, {Channel, Message}}, State) ->
	{noreply, State};
handle_cast({bind, {Socket, _Channel}}, #{ sockets := Sockets } = State) ->
	monitor(process, Socket),
	{ok, NewState} = storeRow(State#{ sockets := lists:umerge([Socket], Sockets) }),
	knot_msg_handler:send(Socket, <<"session.data">>, maps:with([id, meta], NewState)),
	{noreply, NewState};
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

bindSocket(Socket, Channel, #{ sockets := SocketMap, channels := ChannelMap } = State) ->
	{NewSockets, SocketData} = case maps:find(Socket, SocketMap) of
		{ok, SData} -> {[], SData};
		error      -> {[Socket], []}
	end,
	{NewChannels, ChannelData} = case maps:find(Channel, ChannelMap) of
		{ok, CData} -> {[], CData};
		error      -> {[Channel], []}
	end,
	NewSocketData  = lists:umerge([Channel], SocketData),
	NewChannelData = lists:umerge([Socket], ChannelData),
	{NewSockets, NewChannels, State#{ sockets := SocketMap#{ Socket => NewSocketData }, channels := ChannelMap#{ Channel => NewChannelData } }}.
