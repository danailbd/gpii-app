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

require("./utils.js");

/**
 * TODO
 * Once fact updated notification, it collects all facts from providers
 * and sends them through the `onFactsUpdated` event.
 */
fluid.defaults("gpii.app.factsManager", {
    gradeNames: ["fluid.component"],

    events: {
        // Listened to from Manager users
        onFactsUpdated: null
    },

    components: {
        /*
         * Fact Providers
         */
        keyedInBeforeProvider: {
            type: "gpii.app.surveyTriggerManager.keyedInBeforeProvider",
            options: {
                listeners: {
                    onFactsUpdated: "{factsManager}.emitFacts"
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
        emitFacts: {
            funcName: "gpii.app.factsManager.emitFacts",
            args: ["{that}"]
        },

        resetFacts: {
            // Simple iteration over all facts providers
            funcName: "gpii.app.factsManager.resetFacts",
            args: ["{that}"]
        }
    }
});

/**
 * Simply sends all freshly collected facts over the responsible event.
 * @param that {Component} The `gpii.app.factsManager` component
 */
gpii.app.factsManager.emitFacts = function (that) {
    console.log("DEBUG: Notify facts")
    that.events.onFactsUpdated.fire(that.getFacts());
};

/**
 * Collect facts from all fact providers
 * @param that {Component} The gpii.app.factsManager component
 * @return {Object} A map of all facts - { factName: factValue, }
 */
gpii.app.factsManager.getFacts = function (that) {
    var factProviders = gpii.app.getSubcomponents(that);

    return factProviders
        .reduce(function (facts, provider) {
            facts[provider.options.factName] = provider.getFact();
            return facts;
        }, {});
};

/**
 * Reset all fact providers' state.
 * @param that {Component} The gpii.app.factsManager component
 */
gpii.app.factsManager.resetFacts = function (that) {
    var factProviders = gpii.app.getSubcomponents(that);

    factProviders
        .forEach(function (provider) {
            provider.reset();
        });
};


/**
 * The base class for fact providers. Each fact provider must
 * support this interface.
 * A user of such a component may:
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
        onFactsUpdated: null
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
        // notify every second by default
        notificationTimeout: 1000
    },

    listeners: {
        "{app}.events.onKeyedIn": [{
            func: "{that}.updateKeyedInTimestamp"
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
                    onIntervalTick: "{factProvider}.events.onFactsUpdated"
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

        updateKeyedInTimestamp: {
            changePath: "userKeyedInTimestamp",
            value: "@expand:Date.now()"
        }
    }
});

/**
 * Clears the registered interval.
 * @param that {Component} The `gpii.app.surveyTriggerManager` component
 */
gpii.app.surveyTriggerManager.keyedInBeforeProvider.reset = function (that) {
    that.interval.clear();
    that.applier.change("keyedInTimestamp", null);
};


/**
 * Computes the time since keying in
 * @param keyedInTimestamp {Number} Time of keying in
 * @return {Number} milliseconds since keyed in
 */
gpii.app.surveyTriggerManager.keyedInBeforeProvider.getFact = function (keyedInTimestamp) {
    return Date.now() - keyedInTimestamp;
};