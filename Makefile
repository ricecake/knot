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
	@$(JSX) priv/js/component priv/js/built/component
	@$(JSX) priv/js/page priv/js/built/page
clean:
	@$(REBAR) clean

repl:
	erl -pz deps/*/ebin -pa ebin

release: compile
	@$(REBAR) generate

bundle: release
	mkdir -p packages;
	tar czf packages/knot.tar.gz -C rel knot
