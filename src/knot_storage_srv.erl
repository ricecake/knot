-module(knot_storage_srv).
-behaviour(gen_server).
-define(SERVER, ?MODULE).

%% ------------------------------------------------------------------
%% API Function Exports
%% ------------------------------------------------------------------

-export([start_link/0]).
-export([
	findSession/1, deleteSession/1,
	joinChannel/2, leaveChannel/2,
	sendChannel/2, channelRoster/1
]).

%% ------------------------------------------------------------------
%% gen_server Function Exports
%% ------------------------------------------------------------------

-export([init/1, handle_call/3, handle_cast/2, handle_info/2,
         terminate/2, code_change/3]).

%% ------------------------------------------------------------------
%% API Function Definitions
%% ------------------------------------------------------------------

start_link() ->
    gen_server:start_link({local, ?SERVER}, ?MODULE, [], []).

findSession(SessionId) ->
	case ets:lookup(session, SessionId) of
		[]    -> undefined;
		[{NewSessionId, Pid, _StartTime, _Agent, _State, _Meta}] -> {ok, {NewSessionId, Pid}}
	end.

deleteSession(SessionId) -> ets:delete(session, SessionId).

joinChannel(Channel, #{ id := Id } = SessionData) ->
	true = ets:insert(channel, {Channel, Id, self()}),
	{ok, SessionData#{channel => Channel}}.

leaveChannel(Channel, #{ id := Id } = SessionData) ->
	true = ets:match_delete(channel, {Channel, Id, '_'}),
	{ok, maps:without([channel], SessionData)}.

sendChannel(Channel, Message) ->
	[ knot_session:notify(Pid, Message) ||
		Pid <- ets:select(channel, [{
			{Channel,'_','$1'},
			[{'=/=', '$1', self()}],
			['$1']
		}])
	],
	ok.

channelRoster(Channel) ->
	Self = self(),
	[ #{ sessionid => Id } || {_Channel, Id, Pid} <- ets:lookup(channel, Channel), Pid =/= Self ].


%% ------------------------------------------------------------------
%% gen_server Function Definitions
%% ------------------------------------------------------------------

init(_Args) ->
	State = #{
		session => ets:new(session, [set, named_table, public, {read_concurrency, true}]),
		channel => ets:new(channel, [bag, named_table, public, {read_concurrency, true}])
	},
	{ok, State}.

handle_call(_Request, _From, State) ->
    {reply, ok, State}.

handle_cast(_Msg, State) ->
    {noreply, State}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.

%% ------------------------------------------------------------------
%% Internal Function Definitions
%% ------------------------------------------------------------------
