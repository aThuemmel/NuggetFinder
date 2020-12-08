(function (xapiBasic) {

    xapiBasic.config = xapiBasic.config || {};

    xapiBasic.extendXapiBasic = function (object) {
        xapiBasic = xapiBasic || {};
        object = this.clone(object) || {};
        for (var key in object) {
            switch (typeof object[key]) {
                case 'string':
                case 'number':
                case 'boolean':
                case 'symbol':
                    xapiBasic[key] = object[key];
                    break;
                case 'object':
                    xapiBasic[key] = this.extend(xapiBasic[key], object[key]);
                    break;
                case 'function':
                    xapiBasic[key] = object[key].bind(xapiBasic);
                    break;
            }
        }
    };
    xapiBasic.extend = function (object1, object2) {
        object1 = this.clone(object1) || {};
        object2 = this.clone(object2) || {};
        for (var key in object2) {
            if (typeof object2[key] === 'string'
                    || (typeof object2[key] === 'number')
                    || (typeof object2[key] === 'boolean')
                    || (typeof object2[key] === 'symbol')
                    || Array.isArray(object2[key])) {
                object1[key] = object2[key];
            } else if (typeof object2[key] === 'object') {
                object1[key] = object1[key] || {};
                object1[key] = this.extend(object1[key], object2[key]);
            } else if (typeof object2[key] === 'function') {
                object1[key] = object2[key];
            }
        }
        return object1;
    };
    xapiBasic.clone = function (obj) {
        if (Array.isArray(obj) || (obj === null) || (typeof obj !== 'object')) {
            return obj;
        }
        var temp = new obj.constructor();
        for (var key in obj)
            temp[key] = this.clone(obj[key]);
        return temp;
    };

    // console
    xapiBasic.extendXapiBasic({
        knowhow_log: function (text, object, trackError) {
            if (xapiBasic.config.console.active) {
                if (!trackError) {
                    if (object) {
                        console.log('xapiBasic:', text, object);
                    } else {
                        console.log('xapiBasic:', text);
                    }
                } else {
                    if (object) {
                        console.groupCollapsed('xapiBasic:', text);
                        console.log('xapiBasic: object', object);
                    } else {
                        console.groupCollapsed('xapiBasic:', text);
                    }
                    try {
                        throw {
                            track: new Error('Track'),
                            message: trackError.message || ''
                        };
                    } catch (err) {
                        console.log('xapiBasic:', trackError.title || 'called functions');
                        err.message && console.log('xapiBasic:', err.message);
                        err.track && console.log('xapiBasic:', err.track);
                        console.groupEnd();
                    }
                }
            }
        },
        functionTrigger: {}
    });

    xapiBasic.extendXapiBasic({
        wait: 0
    });

    // local variables
    this.xapiWrapper = null;

    /**
     * start functions
     */
    xapiBasic.extendXapiBasic({
        startXapiBasic: function () {
            // initialize xapiWrapper
            this.xapiWrapper = Window.XAPIWrapper ? Window.xapiWrapper : ADL.XAPIWrapper;
            this.xapiWrapper.changeConfig(this.config._connection);
        },
        checkScripts: function () {
            ADL && (ADL.xhrRequestOnError = this.ADLxhrRequestOnError);
            var checkXapiConfig = typeof this.config ? true : false;
            var checkXapiWrapper = Window.XAPIWrapper
                    ? true
                    : typeof ADL !== 'undefined'
                    ? ADL.XAPIWrapper
                    ? true
                    : false
                    : false;

            if (!checkXapiWrapper) {
                this.knowhow_log('xapiWrapper not found');
                this.knowhow_log('You need to integrate the ADL.XAPIWrapper to use xapiBasic.');
                this.knowhow_log('This is mandatory');
                this.knowhow_log('For further information go to https://github.com/adlnet/xAPIWrapper or ask your support');
            } else if (!checkXapiConfig) {
                this.knowhow_log('xapiConfig not found');
                this.knowhow_log('You need to integrate the ADL.XAPIWrapper to use xapiBasic.');
                this.knowhow_log('This is mandatory');
            } else {
                if (this.functionTrigger['configLoaded']) {
                    var functionsToCall = this.functionTrigger['configLoaded'];
                    for (var i = 0; i < functionsToCall.length; i++) {
                        functionsToCall[i]();
                    }
                }
				
                var interval = window.setInterval(function () {
                    if (this.wait <= 0) {
                        window.clearInterval(interval);
                        this.knowhow_log('xapiWrapper & xapiConfig found');
                        this.startXapiBasic();
                        this.setupUrlObject();
                        this.setupMetaObject();
                        this.setupWindowListener();
                        window.addEventListener('beforeunload', this.sendExitStatements);
                        window.addEventListener('beforeunload', this.callExitFunctions);
                    }
                }.bind(this), 200);
            }
        }
    }, false);

    /**
     * statement functions
     */
    xapiBasic.extendXapiBasic({
        setupStatement: function (statement, params) {

            // ignore
            var ignoreLists = this.config.ignoreStatements;
            for (var key in ignoreLists) {
                if (statement.verb === key) {
                    if (statement
                            && statement.object
                            && ignoreLists[key].indexOf(statement.object) !== -1) {
                        return null;
                    }
                }
            }


            statement = statement || {};
            params = this.extend(this.config.statementParams, params || {});

            var newStatement = {};

            // set statement Id
            params.setId && (newStatement.id = this.getRandomUuid());

            // get newStatement.actor
            newStatement.actor = this.getCheckedAgent(statement ? statement.actor : null, this.clone(params));
            // check newStatement.actor
            if (!newStatement.actor ||
                    !(newStatement.actor.mbox || newStatement.actor.mbox_sha1sum
                            || newStatement.actor.openid || newStatement.actor.account)
                    && !(newStatement.actor.objectType === 'Group' && newStatement.actor.member)) {
                this.knowhow_log('Could not find any inverse functional identifier or ');
                this.knowhow_log('non of the given inverse functional identifier passed the test.');
                this.knowhow_log('Set default actor');
                newStatement.actor = this.getCheckedAgent(this.config.defaultProperties.actor);
            }
            // get statement.verb
            newStatement.verb = this.getCheckedVerb(statement ? statement.verb : null, this.clone(params));
            // check statement.verb
            if (!newStatement.verb || !newStatement.verb.id) {
                this.knowhow_log("Could not find verb id or non of the given verb.id's passed the test");
                this.knowhow_log('Reset verb to default verb (did)');
                newStatement.verb = this.config.defaultProperties.verb;
            }

            // get newStatement.object
            newStatement.object = this.getCheckedObject(statement ? statement.object : null, this.clone(params));
            // check newStatement.object
            if (!newStatement.object || !newStatement.object.id) {
                this.knowhow_log("Could not find object.id or non of the given object.id's passed the test");
                this.knowhow_log('Reset object to default object (a learning experience)');
                newStatement.object = this.config.defaultProperties.object;
            }

            if (statement.result) {
                newStatement.result = statement.result;
            }

            if (statement.context
                    || params.setContextRegistration
                    || params.context.addToAllStatements
                    || this.config.defaultProperties.context) {
                this.config.defaultProperties.context
                        && (statement.context = this.extend(this.config.defaultProperties.context, statement.context));

                var context = this.getCheckedContext(statement.context, this.clone(params));
                if (context) {
                    newStatement.context = context;
                } else {
                    newStatement.context = {};
                }
                newStatement.context.extensions = newStatement.context.extensions || {};
                newStatement.context.extensions['https://knowhow.de/xapi/technicalData'] = {
                    browser: this.getBrowserName(),
                    isOnline: navigator.onLine,
                    isMobile: this.isMobile(),
                    protocol: window.location.protocol,
                    screenDimensions: this.getScreenDimensions()
                };
            }

            if (statement.timestamp) {
                newStatement.timestamp = statement.timestamp;
            } else {
                newStatement.timestamp = this.getFormattedDate(Date.now());
            }

            if (statement.authority) {
                newStatement.authority = statement.authority;
            }

            // version is not recommended
            if (statement.version) {
                newStatement.version = statement.version;
            }

            if (statement.attachments) {
                newStatement.attachments = statement.attachments;
            }

            return newStatement;
        },
        getCheckedAgent: function (agent, params) {
            if (typeof agent === 'string') {
                var agentArray = agent.split(' ');
                for (var i = 0; i < agentArray.length; i++) {
                    agent = this.config.actors[agentArray[i]] || null;
                    if (agent) {
                        break;
                    }
                }
            }

            agent = agent || {};
            params = params || {};

            var newAgent = {};
            if (agent.mbox
                    || agent.mbox_sha1sum
                    || agent.openid
                    || agent.account) {
                if (agent.mbox) {
                    // check if agent.mbox starts with 'mailto:' and has an '@' in it
                    if (!(agent.mbox.substring(0, 7) === 'mailto:'
                            && agent.mbox.indexOf('@') !== -1)) {
                        this.knowhow_log('The given mbox did not passed the test.');
                        this.knowhow_log('Required format: "mailto:*@*.*"');
                    } else {
                        newAgent.mbox = agent.mbox;
                    }
                } else if (agent.mbox_sha1sum) {
                    // test mbox_sha1sum
                    if (!this.checkSha1sum(agent.mbox_sha1sum)) {
                        this.knowhow_log('The given mbox_sha1sum did not passed the test.');
                    } else {
                        newAgent.mbox_sha1sum = agent.mbox_sha1sum;
                    }
                } else if (agent.openid) {
                    // test openid
                    if (!this.checkURI(agent.openid)) {
                        this.knowhow_log('The given openid did not passed the test.');
                    } else {
                        newAgent.openid = agent.openid;
                    }
                } else if (agent.account) {
                    // test account
                    if (!agent.account.homePage
                            || !this.checkURI(agent.account.homePage)
                            || !agent.account.name
                            || (agent.account.name === '')) {
                        this.knowhow_log('The given account did not passed the test.');
                    } else {
                        newAgent.account = agent.account;
                    }
                }
            }

            if (agent.objectType) {
                newAgent.objectType = agent.objectType;
            }

            if (agent.name) {
                newAgent.name = agent.name;
            }

            if (agent.member && !params.isMember) {
                if (agent.objectType === 'Group') {
                    for (var i = 0; i < agent.member.length; i++) {
                        params.isMember = true;
                        var memberAgent = this.getCheckedAgent(agent.member[i], params);
                        if (memberAgent
                                && !(memberAgent.mbox || memberAgent.mbox_sha1sum
                                        || memberAgent.openid || memberAgent.account)
                                || (memberAgent.objectType === 'Group')) {
                            this.knowhow_log('Could not find any inverse functional identifier or ');
                            this.knowhow_log('non of the given inverse functional identifier passed the test.');
                            this.knowhow_log('This actor.member agent could not be added.');
                        } else {
                            newAgent.member = newAgent.member || [];
                            newAgent.member.push(memberAgent);
                        }
                    }
                    if (!newAgent.member) {
                        this.knowhow_log('The agent is a group but does not have any members');
                    }
                }
            }

            (typeof this.anonymizeAgent === 'function')
                    && (newAgent = this.anonymizeAgent(newAgent, params) || newAgent);
            return newAgent;
        },
        getCheckedVerb: function (verb, params) {
            if (typeof verb === 'string') {
                var verbArray = verb.split(' ');
                for (var i = 0; i < verbArray.length; i++) {
                    verb = this.config.verbs[verbArray[i]]
                            || (ADL ? ADL.verbs[verbArray[i]] : null);
                    if (verb) {
                        break;
                    }
                }
            }
            verb = verb || {};
            params = params || {};

            var newVerb = null;
            if (verb.id && this.checkURI(verb.id)) {
                newVerb = {};
                newVerb.id = verb.id;
                if (verb.display) {
                    newVerb.display = verb.display;
                }
                if (typeof ADL.verbs[newVerb.id.split('/').pop()] !== 'undefined') {
                    newVerb = ADL.verbs[newVerb.id.split('/').pop()];
                }
            }
            return newVerb;
        },
        getCheckedObject: function (object, params) {
            if (typeof object === 'string') {
                var objectArray = object.split(' ');
                for (var i = 0; i < objectArray.length; i++) {
                    object = this.config.objects[objectArray[i]] || null;
                    if (object) {
                        break;
                    }
                }
            }

            object = object || {};
            params = params || {};
            var newObject = null;
            if (object.id && this.checkURI(object.id)) {
                newObject = object;
            }
            return newObject;
        },
        getCheckedContext: function (context, params) {
            if (typeof context === 'string') {
                var contextArray = context.split(' ');
                for (var i = 0; i < contextArray.length; i++) {
                    context = this.config.contexts[contextArray[i]] || null;
                    if (context) {
                        break;
                    }
                }
            }

            context = context || {};
            params = params || {};

            if (params.context && params.context.addToAllStatements) {
                var contextArray = params.context.addToAllStatementsOrder.split(' ');
                var contexts = {};
                for (var i = 0; i < contextArray.length; i++) {
                    contexts = this.extend(contexts, this.config.contexts[contextArray[i]] || {});
                }
                context = this.extend(contexts, context);
            }

            var newContext = {};
            // context registration
            if (params.setContextRegistration) {
                this.config.contextRegistration = this.config.contextRegistration || this.getRandomUuid();
				if (this.setLocalStorage) {
					this.setLocalStorage('registration', this.config.contextRegistration);
				}
                newContext.registration = this.config.contextRegistration;
            }
            
			if (context.registration && checkUuid(context.registration)) {
                newContext.registration = context.registration;
            }

            if (context.instructor) {
                var instructor = this.getCheckedAgent(context.instructor);
                if (instructor && (
                        instructor.mbox
                        || instructor.mbox_sha1sum
                        || instructor.openid
                        || instructor.account)) {
                    newContext.instructor = instructor;
                } else {
                    this.knowhow_log('Could not find any inverse functional identifier or ');
                    this.knowhow_log('non of the given inverse functional identifier passed the test.');
                    this.knowhow_log('The context.instructor agent could not be added.');
                }
            }
            if (context.team) {
                var team = this.getCheckedAgent(context.team);
                if (team && team.objectType === 'Group') {
                    newContext.team = team;
                } else {
                    this.knowhow_log('Could not find any inverse functional identifier,');
                    this.knowhow_log('non of the given inverse functional identifier passed the test or');
                    this.knowhow_log('the given context.team is not a group');
                    this.knowhow_log('The context.team agent could not be added.');
                }
            }
            if (context.contextActivities) {
                for (var key in context.contextActivities) {
                    switch (key) {
                        case 'parent':
                        case 'grouping':
                        case 'category':
                        case 'other':
                            newContext.contextActivities = newContext.contextActivities || {};
                            newContext.contextActivities[key] = context.contextActivities[key];
                            break;
                        default:
                            this.knowhow_log('Every key in context.contextActivities Object MUST be one of parent, grouping, category, or other.');
                            this.knowhow_log('The given key "' + key + '" does not match.');
                            this.knowhow_log('this context.contextActivities could not be added.');
                    }
                }
            }
            if (context.revision) {
                newContext.revision = context.revision;
            }
            if (context.platform) {
                newContext.platform = context.platform;
            }
            if (context.language) {
                // String as defined in RFC 5646
                newContext.language = context.language;
            }
            if (context.statement) {
                // check if statementRef
                var statementRef = this.getCheckedStatementRef(context.statement);
                if (statementRef) {
                    newContext.statement = statementRef;
                } else {
                    this.knowhow_log('the given context.statement is not a statementRef');
                    this.knowhow_log('The context.statement agent could not be added.');
                }
            }
            if (context.extensions) {
                newContext.extensions = context.extensions;
            }
            return newContext;
        },
        getCheckedStatementRef: function (statementRef, params) {
            if (statementRef
                    && statementRef.objectType && statementRef.objectType === 'StatementRef'
                    && statementRef.id && this.checkUuid(statementRef.id)) {
                return statementRef;
            } else {
                return null;
            }
        }
    }, false);

    /*
     * Helpers
     */
    xapiBasic.extendXapiBasic({
        setupUrlObject: function () {
            var urlStatement = {};
            var urlObject = this.getUrlObject();
            var parameters = {search: false};
            if (urlObject.actor) {
                urlStatement.actor = this.getCheckedAgent(urlObject.actor, parameters);
                urlStatement.actor && (this.config.actors['url'] = urlStatement.actor);
            }
            if (urlObject.verb) {
                urlStatement.verb = this.getCheckedVerb(urlObject.verb, parameters);
                urlStatement.verb && (this.config.verbs['url'] = urlStatement.verb);
            }
            if (urlObject.object) {
                urlStatement.object = this.getCheckedObject(urlObject.object, parameters);
                urlStatement.object && (this.config.objects['url'] = urlStatement.object);
            }

            if (urlObject.context) {
                urlStatement.context = this.getCheckedContext(urlObject.context, parameters);
                urlStatement.context && (this.config.contexts['url'] = urlStatement.context);
            }
            if (urlStatement.actor && urlStatement.verb && urlStatement.object) {
                urlStatement = this.setupStatement(urlStatement, parameters);
                this.config.statements['url'] = urlStatement;
            }
        },
        setupMetaObject: function () {
            var metaTagsStatement = {};
            var metaTagsObject = this.getXapiMetaTags();
            var parameters = {search: false};
            if (metaTagsObject.actor) {
                metaTagsStatement.actor = this.getCheckedAgent(metaTagsObject.actor, parameters);
                metaTagsStatement.actor && (this.config.actors['metaTag'] = metaTagsStatement.actor);
            }
            if (metaTagsObject.verb) {
                metaTagsStatement.verb = this.getCheckedVerb(metaTagsObject.verb, parameters);
                metaTagsStatement.verb && (this.config.verbs['metaTag'] = metaTagsStatement.verb);
            }
            if (metaTagsObject.object) {
                metaTagsStatement.object = this.getCheckedObject(metaTagsObject.object, parameters);
                metaTagsStatement.object && (this.config.objects['metaTag'] = metaTagsStatement.object);
            }
            if (metaTagsObject.context) {
                metaTagsStatement.context = this.getCheckedContext(metaTagsObject.context, parameters);
                metaTagsStatement.context && (this.config.contexts['metaTag'] = metaTagsStatement.context);
            }
            if (metaTagsStatement.actor && metaTagsStatement.verb && metaTagsStatement.object) {
                metaTagsStatement = this.setupStatement(metaTagsStatement, parameters);
                this.config.statements['metatag'] = metaTagsStatement;
            }
        },
        getUrlObject: function () {
            if (this.urlObject) {
                return this.urlObject;
            }
            var urlObject = {};
            if (window.location) {
                if (window.location.search.indexOf('?') !== -1) {
                    var url = window.location.search.substring(1);
                    url = url.split('&');
                    for (var i = 0; i < url.length; i++) {
                        var keyValue = url[i].split('=');
                        if (keyValue.length > 1) {
                            var key = keyValue.shift();
                            if (key.substring(0, 5).toLowerCase() === 'xapi.') {
                                key = key.substring(5).toLowerCase();
                                var value = decodeURIComponent(keyValue).trim();
                                var newObject = {};
                                try {
                                    newObject = this.createObject({}, key.split('.'), JSON.parse(value), null || false);
                                    urlObject = this.extend(urlObject, newObject);
                                } catch (e) {
                                    this.knowhow_log('Could not convert url parameter');
                                }
                            }
                        }
                    }
                } else {
                    urlObject = {};
                }
                if (window.location.hostname) {
                    urlObject.object = {};
                    urlObject.object.id = window.location.protocol
                            ? window.location.protocol + '//' + window.location.hostname + window.location.pathname
                            : window.location.hostname + window.location.pathname;
                } else if (window.location.href) {
                    urlObject.object = {};
                    urlObject.object.id = window.location.href;
                }
            }
            this.urlObject = urlObject;
            return this.urlObject || null;
        },
        getXapiMetaTags: function () {
            if (this.xapiMetaTags) {
                return this.xapiMetaTags;
            } else {
                var xapiMetaTags = {};
                if (document.title && document.title !== '') {
                    var titleLanguage = document.getElementsByTagName('title')
                            ? document.getElementsByTagName('title')[0]
                            ? document.getElementsByTagName('title')[0].lang
                            ? document.getElementsByTagName('title')[0].lang
                            : null
                            : null
                            : null;
                    var language = titleLanguage || this.getLanguage();
                    xapiMetaTags.object = xapiMetaTags.object || {};
                    xapiMetaTags.object.definition = xapiMetaTags.object.definition || {};
                    xapiMetaTags.object.definition.name = xapiMetaTags.object.definition.name || {};
                    xapiMetaTags.object.definition.name[language] = document.title;
                }
                var metaTags = document.getElementsByTagName('meta');
                for (var i = 0; i < metaTags.length; i++) {
                    if (metaTags[i].name.substring(0, 5).toLowerCase() === 'xapi.') {
                        try {
                            var key = metaTags[i].name.substring(5);
                            var value = JSON.parse(metaTags[i].content);
                            var newObject = {};
                            newObject = this.createObject({}, key.split('.'), value, metaTags[i].lang || false);
                            xapiMetaTags = this.extend(xapiMetaTags, newObject);
                        } catch (e) {
                            this.knowhow_log('try catch error in xapiBasic.getXapiMetaTags');
                        }
                    } else if (metaTags[i].name.toLowerCase() === 'description') {
                        var value = metaTags[i].content;
                        var language = metaTags[i].lang || this.getLanguage();
                        xapiMetaTags.object = xapiMetaTags.object || {};
                        xapiMetaTags.object.definition =
                                xapiMetaTags.object.definition
                                || {};
                        xapiMetaTags.object.definition.description =
                                xapiMetaTags.object.definition.description
                                || {};
                        xapiMetaTags.object.definition.description[language] = value;
                    }
                }
                this.xapiMetaTags = xapiMetaTags;
                return this.xapiMetaTags;
            }
        },
        getBrowserName: function () {
            if (!this.config.browserName) {
                this.config.browserName = null;
                var userAgent = navigator.userAgent;
                var tem;
                var match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];


                if (/trident/i.test(match[1])) {
                    tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
                    this.config.browserName = 'IE ' + (tem[1] || '');
                }
                if (!this.config.browserName && match[1] === 'Chrome') {
                    tem = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
                    if (tem !== null) {
                        this.config.browserName = tem.slice(1).join(' ').replace('OPR', 'Opera');
                    }
                }
                if (!this.config.browserName) {
                    match = match[2] ? [match[1], match[2]] : [navigator.appName, navigator.appVersion, '-?'];
                    if ((tem = userAgent.match(/version\/(\d+)/i)) !== null) {
                        match.splice(1, 1, tem[1]);
                    }
                    this.config.browserName = match.join(' ');
                }
            }
            return this.config.browserName;
        },
        isMobile: function () {
            if (!this.config.isMobil) {
                var mobileRegEx = /(android|blackberry|iphone|ipad|ipod|opera mini|iemobile)/i
                this.config.isMobil = navigator.userAgent.toLowerCase().match(mobileRegEx)
                        ? true
                        : false;
            }
            return this.config.isMobil;
        },
        getScreenDimensions: function () {
            return {
                width: window.innerWidth
                        || document.getElementsByTagName('body').clientWidth
                        || document.documentElement.clientWidth,
                height: window.innerHeight
                        || document.getElementsByTagName('body').clientHeight
                        || document.documentElement.clientHeight,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                scrollTop: window.pageYOffset
                        || document.getElementsByTagName('body').scrollTop
                        || document.documentElement.scrollTop
            };
        },
        getFormattedDate: function (date) {
            if (!date || !(typeof date.getMonth === 'function')) {
                date = new Date();
            }

            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var min = date.getMinutes();
            var sec = date.getSeconds();
            var millisec = date.getMilliseconds();
            var timezone = date.getTimezoneOffset();

            month = (month < 10 ? "0" : "") + month;
            day = (day < 10 ? "0" : "") + day;
            hour = (hour < 10 ? "0" : "") + hour;
            min = (min < 10 ? "0" : "") + min;
            sec = (sec < 10 ? "0" : "") + sec;
            millisec = (millisec < 10 ? "00" : millisec < 100 ? "0" : "") + millisec;
            var timezoneSign = (timezone < 0 ? '-' : '');
            timezone = timezone < 0 ? timezone * (-1) : timezone;
            var timezoneHour = (parseInt(timezone / 60) < 10 ? '0' : '') + parseInt(timezone / 60);
            var timezoneMin = ((timezone % 60) < 10 ? '0' : '') + (timezone % 60);

            var str = date.getFullYear() + "-" + month + "-" + day
                    + "T" + hour + ":" + min + ":" + sec + '.' + millisec
                    + timezoneSign + timezoneHour + ':' + timezoneMin;
            return str;
        },
        createObject: function (object, path, value, lang) {
            if (path.length <= 1) {
                var obj = {};
                if (lang) {
                    obj[lang] = value;
                } else {
                    obj = value;
                }
                object[path] = obj;
            } else {
                var key = path.shift();
                if (object[key]) {
                    object[key] = this.extend(object[key], this.createObject(object[key], path, value, lang));
                } else {
                    object[key] = {};
                    object[key] = this.createObject(object[key], path, value, lang);
                }
            }
            return object;
        },
        getLanguage: function () {
            if (!this.config.currentLanguage) {
                this.config.currentLanguage = document.documentElement.lang
                        ? document.documentElement.lang
                        : (navigator.appName === 'Netscape')
                        ? navigator.language
                        ? navigator.language
                        : 'de'
                        : navigator.browserLanguage
                        ? navigator.browserLanguage
                        : 'de';
            }
            return this.config.currentLanguage;
        },
        getRandomUuid: function () {
            /**
             * Fast UUID generator, RFC4122 version 4 compliant.
             * @author Jeff Ward (jcward.com).
             * @license MIT license
             * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
             **/
            var self = {};
            var lut = [];
            for (var i = 0; i < 256; i++) {
                lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
            }
            self.generate = function () {
                var d0 = Math.random() * 0xffffffff | 0;
                var d1 = Math.random() * 0xffffffff | 0;
                var d2 = Math.random() * 0xffffffff | 0;
                var d3 = Math.random() * 0xffffffff | 0;
                return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
                        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
            };
            return self.generate();
        },
        evaluateStatusCode: function (resp) {
            if (!resp) {
                return false;
            } else {
                switch (resp.status) {
                    case 200:
                    case 201:
                    case 202:
                    case 203:
                    case 204:
                    case 205:
                    case 206:
                    case 207:
                    case 208:
                    case 226:
                        this.knowhow_log('Statement sucessfully sent to LRS');
                        return true;
                    case 400:
                        this.knowhow_log('Statement not sucessfully sent to LRS.');
                        this.knowhow_log('Statement is corrupt. Please check statement attributes');
                        break;
                    case 401:
                        this.knowhow_log('Statement not sucessfully sent to LRS.');
                        this.knowhow_log('Could not establish an authorized connection to the LRS.');
                        this.knowhow_log('Please check username, password and endpoint in config._connection');
                        break;
                    case 403:
                        this.knowhow_log('Statement not sucessfully sent to LRS.');
                        this.knowhow_log('Could not establish an authorized connection to the LRS.');
                        this.knowhow_log('the given user may not have the authorization to send statements to LRS.');
                        this.knowhow_log('Please check username, password and endpoint in config._connection');
                        this.knowhow_log('or user settings within the LRS.');
                        break;
                }
                return false;
            }
        },
        checkURI: function (uri) {
            return ((uri !== null) && (uri !== '') && (/[^http[s]|file]?:/i.test(uri)));
        },
        checkUuid: function (uuid) {
            return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
        },
        checkSha1sum: function (hash) {
            return ((hash !== null) && (hash !== '') && (/^[0-9a-f]{40}$/i.test(hash)));
        }
    }, false);

    /**
     * Statement setter and locker
     */
    xapiBasic.extendXapiBasic({
        setStatement: function (name, statement) {
            if (name && typeof name === 'string'
                    && statement) {
                this.config.statements[name] = statement;
            } else {
                // code string and statement
            }
        },
        getStatement: function (name) {
            return this.config.statements[name] || null;
        },
        lockStatement: function (name) {
            this.config.statements[name] && (this.config.statements[name].lock = true);
        },
        unlockStatement: function (name) {
            this.config.statements[name] && (this.config.statements[name].lock = false);
        }
    }, false);

    /*
     *  window listener
     */
    xapiBasic.extendXapiBasic({
        setupWindowListener: function () {
            this.knowhow_log('setupWindowListener');
            if (this.config.sendOnWindowEvent !== null) {
                var events = this.config.sendOnWindowEvent;
                for (var key in events) {
                    if (['storage'].indexOf(key) !== -1) {
                        // filter storage event, can cause infinite loop
                        continue;
                    }
                    var eventObj = events[key];
                    if (['load'].indexOf(key) !== -1) {
                        if (document.readyState === "complete") {
                            if (this.xapiWrapper) {
                                var sendIt = false;
                                switch (typeof eventObj.restriction) {
                                    case 'function':
                                        eventObj.restriction.bind(xapiBasic);
                                        sendIt = eventObj.restriction({});
                                        break;
                                    case 'boolean':
                                        sendIt = eventObj.restriction;
                                        break;
                                    case 'undefined':
                                    default:
                                        sendIt = true;
                                        break;
                                }
                                if (sendIt) {
                                    var statement = this.setupStatement(eventObj.statement);
                                    var params = this.extend(this.config.paramseventObj, eventObj.params);
                                    if (statement && this.config.sendStatements) {
                                        this.sendStatement(statement, params, key);
                                        this.knowhow_log('(sent) statement', statement);
                                    } else {
                                        this.knowhow_log('(not sent) statement', statement);
                                    }
                                }
                            }
                        }
                        continue;
                    }
                    if (eventObj.activate) {
                        window.addEventListener(key, function (eventObj, event) {
                            var sendIt = false;
                            switch (typeof eventObj.restriction) {
                                case 'function':
                                    eventObj.restriction.bind(xapiBasic);
                                    sendIt = eventObj.restriction(event);
                                    break;
                                case 'boolean':
                                    sendIt = eventObj.restriction;
                                    break;
                                case 'undefined':
                                default:
                                    sendIt = true;
                                    break;
                            }
                            if (sendIt) {
                                var statement = this.setupStatement(eventObj.statement);
                                var params = this.extend(this.config.paramseventObj, eventObj.params);
                                if (statement && this.config.sendStatements) {
                                    this.sendStatement(statement, params, key);
                                    this.knowhow_log('(sent) statement', statement);
                                } else {
                                    this.knowhow_log('(not sent) statement', statement);
                                }
                            }
                        }.bind(this, eventObj));
                    }
                }
            }
        }
    }, false);
    /* 
     * send statement
     */
    xapiBasic.extendXapiBasic({
        sendStatement: function (statement, params, name) {
            params = params || {};
            name = name || '';
            var callback = this.sendStatementCallback.bind(this, params, name);
            if (navigator.onLine) {
                // setLocalStorage
                if (this.setLocalStorage) {
                    this.setLocalStorage('pendingStatements', statement.id, statement);
                }
                if (this.getBrowserName().indexOf('IE') !== -1
                        && window.location.protocol.indexOf('file') !== -1
                        && parseInt(this.getBrowserName().split(' ')[1]) <= 10) {
                    this.sendStatementIE9(statement, callback, params);
                } else {
                    if (typeof params.sendAsynchronous === 'undefined'
                            || params.sendAsynchronous) {
                        this.xapiWrapper.sendStatement(statement, callback);
                    } else {
                        var response = this.xapiWrapper.sendStatement(statement);
                        callback(response.xhr, response);
                    }
                }
            } else {
                if (this.setLocalStorage) {
                    this.setLocalStorage('queuedStatements', statement.id, statement);
                }
            }
        },
        sendStatementIE9: function (statement, callback, params) {
            if (typeof params.sendAsynchronous === 'undefined') {
                params.sendAsynchronous = true;
            }
            try {
                var auth = '';
                var user_password = this.config._connection.user + ':' + this.config._connection.password;
                if (CryptoJS && CryptoJS.enc.Base64) {
                    auth = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(user_password));
                } else {
                    auth = Base64.encode(user_password);
                }
				var xmlhttp = null;
				if(window.XMLHttpRequest) {
					xmlhttp = window.XMLHttpRequest;
				} else {
					console.log("use active x");
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				}
				if(xmlhttp) {
					xmlhttp.open("POST", this.config._connection.endpoint + "statements", params.sendAsynchronous);
					xmlhttp.setRequestHeader("Authorization", "Basic " + auth);
					xmlhttp.setRequestHeader("Content-Type", "application/json");
					xmlhttp.setRequestHeader("X-Experience-API-Version", ADL.XAPIWrapper.xapiVersion);
					xmlhttp.onreadystatechange = function () {
						if (xmlhttp.readyState === 4) {
							var data = {id: JSON.parse(xmlhttp.responseText)[0]};
							var resp = {status: xmlhttp.status};
							callback(resp, data);
						}
					};
					xmlhttp.send(JSON.stringify(statement));
				}
            } catch (e) {
            }
        },
        ADLxhrRequestOnError: function (resp, method, url, callback, data) {
            (callback && typeof callback === "function") && callback(resp, data);
        },
        sendStatementCallback: function (params, name, resp, data) {
            if (!resp && !data) {
                knowhow_log('Could not evaluate server response');
            }
            if (this.evaluateStatusCode(resp)) { // if ok
                if (this.passOnLocalStorage) {
                    this.passOnLocalStorage('pendingStatements', 'sentStatements', data.id);
                    this.passOnLocalStorage && this.passOnLocalStorage('queuedStatements', 'sentStatements', data.id);
                }
                if (params.lockAfterSend) {
                    this.lockStatement(name);
                }
            } else { // if not okay, why?
                if (this.passOnLocalStorage) {
                    if (!navigator.onLine) { // because offline
                        this.passOnLocalStorage('pendingStatements', 'queuedStatements', data.id);
                    } else { // because of error
                        this.passOnLocalStorage('pendingStatements', 'erroredStatements', data.id);
                        this.passOnLocalStorage('queuedStatements', 'erroredStatements', data.id);
                    }
                }
            }
        },
        sendExitStatements: function () {
            for (var key in this.config.exitStatements) {
                var statement = this.config.exitStatements[key];
                if (statement !== null && statement !== "undefined") {
					statement.timestamp && delete statement.timestamp;
                    var params = {
                        sendAsynchronous: false
                    };
                    this.trigger(key, statement, params);
                }
            }
			this.sendExitStatements = function() {};
        },
        trigger: function (code, statement, params, callback) {
            if (this.wait !== 0) {
                xapiBasic.waitInterval = xapiBasic.waitInterval || [];
                var current = xapiBasic.waitInterval.length;
                xapiBasic.waitInterval[xapiBasic.waitInterval.length] = window.setInterval(function () {
                    if (this.wait === 0) {
                        window.clearInterval(xapiBasic.waitInterval[current]);
                        params = this.extend(this.config.statementParams, params || {});
                        var name = code ? code.split(':').shift() : "";
                        var actionString = code ? code.split(':').pop() : "";
                        var locStatement = this.getStatement(name) || {};
                        if (locStatement) {
                            if (!locStatement.lock) {
                                switch (actionString) {
                                    case 'send':
                                        if (statement) {
                                            // extend
                                            statement = this.extend(locStatement, statement);
                                            statement = this.setupStatement(statement, params);
                                        } else {
                                            statement = this.setupStatement(locStatement, params);
                                        }
                                        if (statement && this.config.sendStatements) {
                                            this.sendStatement(statement, params, name);
                                            this.knowhow_log('(sent) statement', statement);
                                        } else {
                                            this.knowhow_log('(not sent) statement', statement);
                                        }
                                        if (params.lockAfterSend) {
                                            if (!this.config.statements[name]) {
                                                this.config.statements[name] = statement;
                                            }
                                            this.lockStatement(name);
                                        }
                                        break;
                                    case 'extend':
                                        this.setStatement[name] = statement;
                                }
                                typeof callback === 'function' && callback(statement, name);
                            }
                        }
                    }
                }.bind(this, current), 200);
            } else {
                params = this.extend(this.config.statementParams, params || {});
                var name = code ? code.split(':').shift().trim() : "";
                var actionString = code ? code.split(':').pop().trim() : "";
                var locStatement = this.getStatement(name) || {};
                if (locStatement) {
                    if (!locStatement.lock) {
						if (statement) {
							// extend
							statement = this.extend(locStatement, statement);
							statement = this.setupStatement(statement, params);
						} else {
							statement = this.setupStatement(locStatement, params);
						}
						if (statement && this.config.sendStatements) {
							this.sendStatement(statement, params, name);
							this.knowhow_log('(sent) statement', statement);
						} else {
							this.knowhow_log('(not sent) statement', statement);
						}
						if (params.lockAfterSend) {
							if (!this.config.statements[name]) {
								this.config.statements[name] = statement;
							}
							this.lockStatement(name);
						}
                        typeof callback === 'function' && callback(statement, name);
                    }
                }
            }
        }
    }, true);


    var interval = window.setInterval(function () {
        if (xapiBasic.config) {
            window.clearInterval(interval);
            xapiBasic.checkScripts();
        }
    }.bind(this), 200);

    // scorm
    var findAPITries = 0;
    if (xapiBasic.config.scorm && xapiBasic.config.scorm.active) {
        xapiBasic.extendXapiBasic({
            getScormAPI: function () {
                if (this.config.scorm.pathToAPI) {
                    var path = this.config.scorm.pathToAPI.split('.');
                    var current = window[path[0]];
                    path.shift();
                    while (path.length > 0 && current) {
                        current = current[path[0]];
                        path.shift();
                    }
                    if (current) {
                        xapiBasic.getScormAPI = function () {
                            return current;
                        }.bind(this);
                        return current;
                    }
                }

                // start by looking for the API in the current window
                var theAPI = this.findScormAPI(window);

                // if the API is null (could not be found in the current window)
                // and the current window has an opener window
                if (!theAPI && (window.opener !== null) && (typeof (window.opener) !== "undefined")) {
                    // try to find the API in the current window’s opener
                    theAPI = findScormAPI(window.opener);
                }
                // if the API has not been found
                if (theAPI === null || typeof theAPI === 'undefined') {
                    // Alert the user that the API Adapter could not be found
                    this.knowhow_log('Could not find SCORM API');
                    // alert("Unable to find an API adapter");
                }
                return theAPI;
            },
            findScormAPI: function (win) {
                // Check to see if the window (win) contains the API
                // if the window (win) does not contain the API and
                // the window (win) has a parent window and the parent window
                // is not the same as the window (win)
                while ((win.API === null) && (win.parent !== null) && (win.parent !== win))
                {
                    // increment the number of findAPITries
                    findAPITries++;

                    // Note: 7 is an arbitrary number, but should be more than sufficient
                    if (findAPITries > 4)
                    {
                        return null;
                    }

                    // set the variable that represents the window being
                    // being searched to be the parent of the current window
                    // then search for the API again
                    win = win.parent;
                }
                return win.API;
            },
            setupScorm: function () {
                if (this.config.scorm
                        && this.config.scorm.active
                        && this.getScormAPI()) {
                    if (this.config.scorm['initializeAndFinishSCORM']) {
                        this.getScormAPI().LMSInitialize();
                        window.addEventListener("beforeunload", function (event) {
                            this.getScormAPI().LMSFinish();
                        }.bind(this));
                    }
                    this.functionTrigger['configLoaded'] = this.functionTrigger['configLoaded'] || [];
                    this.functionTrigger['configLoaded'].push(this.scormOnConfigLoaded);
                }
            },
            scormOnConfigLoaded: function () {
                this.setupScormActor();
            },
            setupScormActor: function () {
                var studentName = this.getScormAPI().LMSGetValue('cmi.core.student_name');
                var studentId = this.getScormAPI().LMSGetValue('cmi.core.student_id');
                var LMShref = this.config.account.homePage
                        ? this.config.account.homePage
                        : window.opener.location.href;
                this.config.actors['scorm'] = {
                    name: studentName,
                    account: {
                        homePage: LMShref,
                        name: studentId
                    }
                };
            }
        }, false);

        xapiBasic.setupScorm();
    }

    // check if localStorage is Available
    var isLocalStorageAvailable = true;
    try {
        localStorage.setItem('localStorageTest', 'localStorageTest');
        localStorage.removeItem('localStorageTest');
        isLocalStorageAvailable = true;
    } catch (e) {
        isLocalStorageAvailable = false;
    }

    if (isLocalStorageAvailable) {
        // local Storage functions
        xapiBasic.extendXapiBasic({
            setupLocalStorage: function () {
                window.addEventListener('online', this.checkLocalStorage);
				this.preserveRegistration();
            },
            setLocalStorage: function (target, id, value) {
                if (!value || !isLocalStorageAvailable) {
                    return;
                }
                var targetStorage = localStorage.getItem(target)
                        ? JSON.parse(localStorage.getItem(target))
                        : {};
                if (id) {
                    targetStorage[id] = value;
                } else if (value.id) {
                    targetStorage[value.id] = value;
                } else {
                    return;
                }
                localStorage.setItem(target, JSON.stringify(targetStorage));
            },
            getLocalStorage: function (source, id) {
                if (!isLocalStorageAvailable) {
                    return null;
                }
                var sourceStorage = localStorage.getItem(source)
                        ? JSON.parse(localStorage.getItem(source))
                        : {};
                if (id) {
                    return sourceStorage[id] || null;
                } else {
                    return sourceStorage || {};
                }
            },
            removeLocalStorage: function (target, id) {
                if (!isLocalStorageAvailable) {
                    return;
                }
                var targetStorage = localStorage.getItem(target)
                        ? JSON.parse(localStorage.getItem(target))
                        : {};
                if (targetStorage[id]) {
                    delete targetStorage[id];
                    localStorage.setItem(target, JSON.stringify(targetStorage));
                }
            },
            passOnLocalStorage: function (source, target, id) {
                if (!isLocalStorageAvailable) {
                    return;
                }
                var value = this.getLocalStorage(source, id);
                if (value) {
                    this.removeLocalStorage(source, id);
                    this.setLocalStorage(target, id, value);
                }
            },
            checkLocalStorage: function () {
                var callback = function (resp, data) {
                    if (xapiBasic.evaluateStatusCode(resp)) {
                        xapiBasic.passOnLocalStorage('queuedStatements', 'sentStatements', data.id);
                    } else {
                        xapiBasic.passOnLocalStorage('queuedStatements', 'erroredStatements', data.id);
                    }
                };
                var queuedStatements = xapiBasic.getLocalStorage('queuedStatements');
                for (var key in queuedStatements) {
                    xapiBasic.xapiWrapper.sendStatement(queuedStatements[key], callback);
                }
            },
			preserveRegistration: function () {
				if(this.config.statementParams.preserveRegistration) {
					window.addEventListener('beforeunload', function (event) {
						localStorage.setItem('unloadTime', new Date().getTime());
					});

					var unloadTime = Number(localStorage.getItem('unloadTime'));
					if (isNaN(unloadTime)) t0=0;
					var loadTime = new Date().getTime();
					var duration = (loadTime - unloadTime) / 1000;
					if (duration < xapiBasic.config.statementParams.preserveRegistration) {
						var registration = localStorage.getItem('registration');
						xapiBasic = xapiBasic || {};
						xapiBasic.config = xapiBasic.config || {};
						xapiBasic.config.contextRegistration = registration;
					} else {
						localStorage.removeItem('registration');
						localStorage.removeItem('unloadTime');
					}
				}
			}
        });

        xapiBasic.setupLocalStorage();
    }

    return xapiBasic;
})(this.xapiBasic = this.xapiBasic || {});