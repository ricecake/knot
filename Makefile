REBAR=		./rebar
JSX=            jsx
DIALYZER=	dialyzer


.PHONY: all deps compile get-deps clean

all: compile release

deps: clean get-deps

package: clean get-deps compile release bundle

get-deps:
	@$(REBAR) get-deps

compile: compile-erl compile-js

compile-erl:
	@$(REBAR) compile

compile-js:
	@$(JSX) priv/js/src priv/js/build
clean:
	@$(REBAR) clean

repl:
	erl -pz deps/*/ebin -pa ebin

release:
	@$(REBAR) generate

bundle:
	mkdir -p packages;
	tar czf packages/redash.tar.gz -C rel redash
