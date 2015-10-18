-module(knot_session_srv).
-behaviour(gen_server).
-define(SERVER, ?MODULE).

%% ------------------------------------------------------------------
%% API Function Exports
%% ------------------------------------------------------------------

-export([start_link/1, bind/2, send/3, process/3]).

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

%% ------------------------------------------------------------------
%% gen_server Function Definitions
%% ------------------------------------------------------------------

init(Args) ->
	{ok, Args}.

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

storeRow(#{ id := Id, meta := Meta } = State) ->
	knot_storage_srv:storeSession(Id, self(), Meta),
	{ok, State}.

mapMerge(A, B) when is_map(A), is_map(B) -> maps:from_list(lists:append(maps:to_list(A), maps:to_list(B))).
