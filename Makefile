REBAR := `pwd`/rebar3

all: test release

compile:
	@$(REBAR) compile

test:
	@$(REBAR) do xref, eunit, ct, cover

test-all:
	@$(REBAR) do xref, dialyzer, eunit, ct, cover

release:
	@$(REBAR) release

clean:
	@$(REBAR) clean

shell:
	@$(REBAR) shell

.PHONY: release test all compile clean
