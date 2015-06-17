#!/bin/bash

erl -pa `pwd`/deps/*/ebin -pa `pwd`/ebin -s knot -eval 'timer:apply_interval(5000, erlang, spawn, [fun()->[ code:load_file(Mod) || {Mod, _Path} <- code:all_loaded(), code:is_sticky(Mod) =/= true, code:soft_purge(Mod)] end]).'
