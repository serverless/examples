NAME ?= aws-python-auth0-custom-authorizers-api

ERROR_COLOR = \033[1;31m
INFO_COLOR = \033[1;32m
WARN_COLOR = \033[1;33m
NO_COLOR = \033[0m


#################
#
# Deploy Targets
#
#################

.PHONY: deploy
deploy:                        ## wrap sls deploy
	@make action=deploy sls

sls: guard-action
	@if [ -n "$${AWS_ACCESS_KEY_ID}" -a -n "$${AWS_SECRET_ACCESS_KEY}" ] ; then \
        printf "$(WARN_COLOR)WARN:$(NO_COLOR) Found AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY vars, using those for sls "$${action}".\n" ; \
        sls "$${action}" ; \
    elif [ -n "$${AWS_DEFAULT_PROFILE}" ] ; then \
        printf "$(WARN_COLOR)WARN:$(NO_COLOR) Found AWS_DEFAULT_PROFILE var, using it for sls "$${action}".\n" ; \
        sls "$${action}" --aws-profile=$${AWS_DEFAULT_PROFILE} ; \
    elif [ -n "$${profile}" ] ; then \
        printf "$(INFO_COLOR)INFO:$(NO_COLOR) Found 'profile=$${profile}' argument, using it for sls "$${action}".\n" ; \
        sls "$${action}" --aws-profile=$${profile} --verbose --aws-s3-accelerate ; \
    elif [ -z "$${profile}" ] ; then \
        printf "$(WARN_COLOR)WARN:$(NO_COLOR) No AWS profile specified, using default.\n" ; \
        sls "$${action}" ; \
    else  \
        printf "$(ERROR_COLOR)ERROR:$(NO_COLOR) No AWS credentials found or passed.\n" ; \
        cd .. && make sls_help ; \
        exit 1 ; \
fi

#################
#
# Cleanup
#
#################

clean: clean-tox clean-pyc

clean-pyc:
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +

clean-tox:
	rm -rf .tox
	rm -rf .hypothesis
	rm -rf .py36*
	rm -rf test-results
	rm -rf coverage-reports


#################
#
# Helper Targets
#
#################
# Add an implicit guard for parameter input validation; use as target dependency guard-VARIABLE_NAME, e.g. guard-AWS_ACCESS_KEY_ID
guard-%:
	@if [ "${${*}}" = "" ]; then \
		printf \
			"$(ERROR_COLOR)ERROR:$(NO_COLOR) Variable [$(ERROR_COLOR)$*$(NO_COLOR)] not set.\n"; \
		exit 1; \
	fi


help:                                    ## Prints the names and descriptions of available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
