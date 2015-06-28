-module(knot_session).
-behaviour(gen_fsm).
-define(SERVER, ?MODULE).

%% ------------------------------------------------------------------
%% API Function Exports
%% ------------------------------------------------------------------

-export([
	start_link/1, create/1, bind/2, notify/3, inform/3
]).

%% ------------------------------------------------------------------
%% gen_fsm Function Exports
%% ------------------------------------------------------------------

-export([
	init/1, handle_event/3, handle_sync_event/4,
	handle_info/3, terminate/3, code_change/4
]).

-export([
	orphaned/2, orphaned/3,
	connected/2, connected/3,
	ready/2, ready/3
]).

%% ------------------------------------------------------------------
%% API Function Definitions
%% ------------------------------------------------------------------

start_link(Args) ->
	gen_fsm:start_link(?MODULE, Args, []).


create(Meta) ->
	NewSessionId = knot:getNewId(),
	{ok, Pid}    = knot_session_sup:create(NewSessionId, Meta),
	{NewSessionId, Pid}.

bind(Pid, Meta) -> gen_fsm:sync_send_event(Pid, {bind, {self(), Meta}}).

notify(Session, Type, Message) when is_pid(Session) ->
	gen_fsm:send_event(Session, {Type, Message});
notify(Session, Type, Message) when is_binary(Session) ->
	{ok, {Session, Pid}} = knot_storage_srv:findSession(Session),
	notify(Pid, Type, Message).

inform(Session, Type, Message) when is_pid(Session) ->
	gen_fsm:sync_send_event(Session, {Type, Message}).

%% ------------------------------------------------------------------
%% gen_fsm Function Definitions
%% ------------------------------------------------------------------

init(#{socket := Socket, id := Id } = Args) ->
	monitor(process, Socket),
	{ok, State} = storeRow(Args),
	knot_msg_handler:send(Socket, <<"session-data">>, #{ sessionid => Id }),
	{ok, ready, State}.

orphaned(timeout, State) ->
	{stop, normal, State};
orphaned(_Event, State) ->
	{next_state, orphaned, State, 15000}.

orphaned({bind, {Socket, Data}}, _From, #{ id := Id, meta := Meta } = State) ->
	monitor(process, Socket),
	{ok, NewState} = storeRow(State#{ socket := Socket, meta := mapMerge(Meta, Data) }),
	knot_msg_handler:send(Socket, <<"session-data">>, #{ sessionid => Id }),
	{reply, ok, ready, NewState}.

connected({signal, {Type, Data}}, #{ socket := Socket } = State) ->
	knot_msg_handler:send(Socket, Type, Data),
	{next_state, connected, State};
connected({signal, From, {Type, Data}}, #{ socket := Socket } = State) ->
	knot_msg_handler:send(Socket, Type, Data, #{ from => From }),
	{next_state, connected, State};
connected({control, hangup}, #{ channel := Channel, socket := Socket, id := Id } = State) ->
	knot_msg_handler:send(Socket, hangup, #{}),
	knot_storage_srv:sendChannel(Channel, signal, {<<"disconnected">>, #{ sessionid => Id }}),
	{ok, UpdatedState} = knot_storage_srv:leaveChannel(Channel, State),
	{next_state, ready, UpdatedState};
connected({control, orphaned}, #{ channel := Channel, id := Id } = State) ->
	knot_storage_srv:sendChannel(Channel, signal, {<<"interrupted">>, #{ sessionid => Id }}),
	{next_state, orphaned, State, 15000};
connected({<<"disconnect">>, _Data}, State) ->
	notify(self(), control, hangup),
	{next_state, connected, State};
connected({direct, Recipient, Event}, #{ id := Id } = State) ->
	notify(Recipient, signal, {Id, Event}),
	{next_state, connected, State};
connected(Event, #{ channel := Channel, id := Id } = State) ->
	knot_storage_srv:sendChannel(Channel, signal, {Id, Event}),
	{next_state, connected, State}.

connected(_Event, _From, State) ->
	{reply, ok, connected, State}.

ready({control, orphaned}, State) ->
	{next_state, orphaned, State, 15000};
ready({<<"join-channel">>, #{ <<"channel">> := ChannelId }}, #{ id := Id, socket := Socket } = State) ->
	{ok, NewState}     = knot_storage_srv:joinChannel(ChannelId, State),
	knot_storage_srv:sendChannel(ChannelId, signal, {<<"connected">>, #{ sessionid => Id }}),
	knot_msg_handler:send(Socket, roster, knot_storage_srv:channelRoster(ChannelId)),
	{next_state, connected, NewState};
ready(_Event, State) ->
	{next_state, ready, State}.

ready(_Event, _From, State) ->
	{reply, ok, ready, State}.

%% ------------------------------------------------------------------
%% All state callbacks
%% ------------------------------------------------------------------

handle_event({Type, Data}, StateName, #{socket := Socket } = State) ->
	knot_msg_handler:send(Socket, Type, Data),
	{next_state, StateName, State};
handle_event(_Event, StateName, State) ->
	{next_state, StateName, State}.

handle_sync_event(_Event, _From, StateName, State) ->
    {reply, ok, StateName, State}.

handle_info({'DOWN', _Ref, _Type, Socket, _Exit}, StateName, #{socket := Socket} = State) ->
	notify(self(), control, orphaned),
	{next_state, StateName, State};
handle_info(_Info, StateName, State) ->
	{next_state, StateName, State}.

terminate(_Reason, _StateName, #{ id := Id } = State) ->
	knot_storage_srv:leaveChannel('_', State),
	knot_storage_srv:deleteSession(Id).

code_change(_OldVsn, StateName, State, _Extra) ->
    {ok, StateName, State}.

%% ------------------------------------------------------------------
%% Internal Function Definitions
%% ------------------------------------------------------------------

storeRow(#{ id := Id, meta := Meta } = State) ->
	knot_storage_srv:storeSession(Id, self(), Meta),
	{ok, State}.

mapMerge(A, B) when is_map(A), is_map(B) -> maps:from_list(lists:append(maps:to_list(A), maps:to_list(B))).
