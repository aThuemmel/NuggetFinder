(function (xapiBasic) {
    xapiBasic.config = xapiBasic.config || {};

	xapiBasic.config = {
        sendStatements: false, // default: true
		_connection: {},
        language: "de",
		nuggetfinder: {
			active: true
		},
        console: {
            active: false,
            group: false
        },
        scorm: {
            active: false,
            initializeAndFinishSCORM: false,
            pathToAPI: "opener.API"         // path to API from window (eg opener.API if path is window.opener.API)
        },
        statements: {},
        ignoreStatements: {
            launched: [""],
            exited: [""]
        },
        actors: {
            "default": {
                mbox: 'mailto:anonymous@knowhow.de' // default: 'mailto:anonymous@knowhow.de'
            }
        },
        account: {
            homePage: "http://www.knowhow.de/xapi/nuggetfinder/"
        },
        verbs: {
			"searched": {
				id: "http://www.knowhow.de/xapi/verbs/searched",
				display: {
					"en-GB": "searched",
					"de-DE": "suchte"
				}
			},
			"called": {
				id: "http://www.knowhow.de/xapi/verbs/called",
				display: {
					"en-GB": "called",
					"de-DE": "rief auf"
				}
			}
		},
        objects: {
			"finder": {
				"id": "http://www.knowhow.de/xapi/objects/interactions/nuggetfinder/",
				"definition": {
					"name": {
						"de": "Nugget Finder",
						"en": "Nugget Finder",
					},
					"type": "http://adlnet.gov/expapi/activities/interaction"
				}
			}
		},
        contexts: {},
        statementParams: {
            lockAfterSend: true, // default: true
            setId: true, // default: true
            setContextRegistration: true, // default: true
            preserveRegistration: false,   // default: false
            preserveRegistrationTime: 5,   // seconds
            search: true, // default: true
            actor: {
                searchMetaTags: true, // default: true
                searchURLParameters: true   // default: true
            },
            verb: {
                searchMetaTags: true, // default: true
                searchURLParameters: true   // default: true
            },
            object: {
                searchMetaTags: true, // default: true
                searchURLParameters: true   // default: true
            },
            context: {
                addToAllStatements: true, // default: true
                addToAllStatementsOrder: 'scorm url metatag default',
                searchMetaTags: true, // default: true
                searchURLParameters: true   // default: true
            }
        },
        defaultProperties: {
            actor: 'scorm default',
            verb: '',
            object: {
				"id": "http://www.knowhow.de/xapi/objects/interactions/nuggetfinder/",
				"definition": {
					"name": {
						"en": "Nugget Finder Applikation",
						"de": "Nugget Finder Application",
					},
					"type": "http://adlnet.gov/expapi/activities/interaction"
				}
			},
			context: {
				language: "de-DE",
				platform: "Nugget Finder 2017 Release 3"
			}
        },
        exitStatements: {}, // this is just a placeholder
        sendOnWindowEvent: {
            load: {
                activate: false,
                restriction: function (event) {
                    return true; // always
                },
                statement: {
                    verb: "launched",
                    object: "finder"
                },
                params: {
                    sendAsynchronous: true
                }
            },
            beforeunload: {
                activate: true,
                statement: {
                    verb: "exited",
                    object: "finder"
                },
                restriction: function (event) {
					this.restriction = false;
                    return true; // always (once)
                },
                params: {
                    sendAsynchronous: false
                }
            }
        }
    };

	// override configuration with NuggetFinder globalSettings
	xapiBasic.config.sendStatements                         = globalSettings.sendStatements;
	xapiBasic.config.statementParams.preserveRegistration   = globalSettings.preserveRegistration;
	xapiBasic.config._connection.endpoint                   = globalSettings.lrsEndpoint;
	xapiBasic.config._connection.user                       = globalSettings.lrsUser;
	xapiBasic.config._connection.password                   = globalSettings.lrsPassword;

	
})(this.xapiBasic = this.xapiBasic || {});