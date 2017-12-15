/*!
GPII Application
Copyright 2016 Steven Githens
Copyright 2016-2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.
The research leading to these results has received funding from the European Union's
Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
*/
"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");


/**
 * TODO
 */
fluid.defaults("gpii.app.factsManager", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        // TODO
        // in order to avoid iteration over collected/unchanged facts
        /// cachedFacts: {}
    },

    events: {
        // Listened to from Manager users
        onFactUpdated: null,

        // TODO use event decorator
        // Thrown by factProviders
        onInnerFactUpdated: null
    },

    listeners: {
        onInnerFactUpdated: "{that}.notifyFacts"
    },

    components: {
        /*
         * Fact Providers
         */

        keyedInBeforeProvider: {
            type: "gpii.app.surveyTriggerManager.keyedInBeforeProvider",
            options: {
                events: {
                    onFactUpdated: "{factsManager}.events.onInnerFactUpdated"
                }
            }
        }
    },

    invokers: {
        getFacts: {
            // Simple iteration over all facts providers
            funcName: "gpii.app.factsManager.getFacts",
            args: [
                "{that}"
            ]
        },
        notifyFacts: {
            funcName: "gpii.app.factsManager.notifyFacts",
            args: ["{that}"]
        }

        // TODO
        // reset facts collection
        /// resetFacts: {
        ///     // Simple iteration over all facts providers
        ///     funcName: "gpii.app.factsManager.resetFacts",
        ///     args: ["{that}"]
        /// }
    }
});

gpii.app.factsManager.notifyFacts = function (that) {
    that.events.onFactUpdated.fire(that.getFacts());
};

gpii.app.factsManager.getFacts = function (that) {
    // TODO find proper place to cache cache
    var factProviders = gpii.app.getSubcomponents(that);

    return factProviders
        .reduce(function (facts, provider) {
            facts[provider.options.factName] = provider.getFact();
            return facts;
        }, {});
};



/**
 * The base class for fact providers. Each fact provider must
 * support this interface.
 * A user such a component may:
 * - use the push notifications that are registered once change
 *   in the corresponding fact has take place
 * - may get the current state (value) of a fact at any given moment
 */
fluid.defaults("gpii.app.surveyTriggerManager.factProvider", {
    gradeNames: ["fluid.modelComponent"],

    events: {
        /*
         * Frequently fired to notify for change in the fact state.
         */
        onFactUpdated: null
    },

    invokers: {
        /*
         * Get fact's current state.
         */
        getFact: {
            funcName: "fluid.notImplemented",
            args: ["{arguments}.0"]
        },
        /*
         * Reset fact's data restarting the collection info.
         */
        reset: {
            funcName: "fluid.notImplemented"
        }
    }
});

/**
 * Provides information for time since the user keyed.
 * Uses interval timer to notify for fact changes.
 */
fluid.defaults("gpii.app.surveyTriggerManager.keyedInBeforeProvider", {
    gradeNames: ["gpii.app.surveyTriggerManager.factProvider"],
    factName: "keyedInBefore",

    model: {
        userKeyedInTimestamp: null
    },

    config: {
        // XXX dev time; set to 30 secs default
        notificationTimeout: 3000 // notify every 5 secs
    },

    listeners: {
        "{app}.events.onKeyedIn": [{
            func: "{that}._updateKeyedInTimestamp"
        }, { // Register interval notifications
            func: "{interval}.start",
            args: "{that}.options.config.notificationTimeout"
        }],

        "{app}.events.onKeyedOut": {
            func: "{that}.reset"
        }
    },

    components: {
        interval: {
            type: "gpii.app.interval",
            options: {
                events: {
                    // Just make an alias
                    onIntervalTick: "{factProvider}.events.onFactUpdated"
                }
            }
        }
    },

    invokers: {
        getFact: {
            funcName: "gpii.app.surveyTriggerManager.keyedInBeforeProvider.getFact",
            args: [
                "{that}.model.userKeyedInTimestamp"
            ]
        },
        reset: {
            funcName: "gpii.app.surveyTriggerManager.keyedInBeforeProvider.reset",
            args: "{that}"
        },

        _updateKeyedInTimestamp: {
            changePath: "userKeyedInTimestamp",
            value: "@expand:Date.now()"
        }
    }
});

gpii.app.surveyTriggerManager.keyedInBeforeProvider.reset = function (that) {
    that.inteval.clear();

    // clear the timestamp, as no one keyedIn
    that.applier.change("keyedInTimestamp", null);
};


/**
 * @param keyedInTimestamp {Number} Time of key in
 * @return {Number} milliseconds since key in
 */
gpii.app.surveyTriggerManager.keyedInBeforeProvider.getFact = function (keyedInTimestamp) {
    return Date.now() - keyedInTimestamp;
};



// TODO TEST

/*
 *  TODO
 */
fluid.defaults("gpii.app.timer", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        timer: null
    },

    listeners: {
        "onDestroy.clearTimer": "{that}.clear"
    },

    events: {
        onTimerFinished: null
    },

    invokers: {
        start: {
            funcName: "timer",
            args: [
                "@expand:setTimeout({that}.events.onTimerFinished.fire, {arguments}.0)"
            ]
        },
        clear: {
            funcName: "clearTimeout",
            args: "{that}.model.timer"
        }
    }
});


/*
 * TODO
 */
fluid.defaults("gpii.app.interval", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        interval: null
    },

    listeners: {
        // XXX
        "onCreate.log": {
            this: "console",
            method: "log",
            args: ["Interval Created"]
        },

        "onDestroy.clearInterval": "{that}.clear"
    },

    events: {
        // better name... ..Clicked, ..Reached
        onIntervalTick: null
    },

    invokers: {
        start: {
            changePath: "interval",
            args: [
                "@expand:setInterval({that}.events.onIntervalTick.fire, {arguments}.0)"
            ]
        },
        clear: {
            funcName: "clearInterval",
            args: "{that}.model.interval"
        }
    }
});
