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

require("../utils.js");

/// fluid.defaults("gpii.app.surveyTriggersManager", {
///     gradeNames: ["fluid.modelComponent"],
/// 
///     model: {
///         keyedInUserToken: null,
///         activeTimer: null
///     },
/// 
///     modelListeners: {
///         keyedInUserToken: {
///             funcName: "gpii.app.surveyTriggersManager.clearTriggersIfNeeded",
///             args: ["{that}", "{change}.value"],
///             excludeSource: "init"
///         }
///     },
/// 
///     events: {
///         onTriggerOccurred: null
///     },
/// 
/// 
///     invokers: {
///         registerTrigger: {
///             funcName: "gpii.app.surveyTriggersManager.registerTrigger",
///             args: ["{that}", "{arguments}.0"]
///         },
///         clearTriggers: {
///             funcName: "gpii.app.surveyTriggersManager.clearTriggers",
///             args: ["{that}"]
///         }
///     }
/// });
/// 
/// 
/// gpii.app.surveyTriggersManager.registerTrigger = function (that, triggerData) {
///     that.clearTriggers();
/// 
///     if (!triggerData || !triggerData.conditions) {
///         return;
///     }
/// 
///     var conditions = triggerData.conditions;
///     if (conditions.length !== 1) {
///         console.log("SurveyTriggerManager: Unsoported number of conditions: ", conditions.length);
///         return;
///     }
/// 
///     // XXX mock
///     var timer;
///     if (conditions[0].minutesSinceKeyIn) {
///         timer = setTimeout(
///             function () {
///                 console.log("SurveyTriggerManager: KeyedIn Timer triggered!");
/// 
///                 delete triggerData.conditions;
///                 that.events.onTriggerOccurred.fire(triggerData);
///             },
///             conditions[0].minutesSinceKeyIn * 1000
///         );
///         that.applier.change("activeTimer", timer);
///     }
/// };
/// 
/// 
/// gpii.app.surveyTriggersManager.clearTriggers = function (that) {
///     if (that.model.activeTimer) {
///         clearTimeout(that.model.activeTimer);
///         that.applier.change("activeTimer", null, "DELETE");
///     }
/// };
/// 
/// gpii.app.surveyTriggersManager.clearTriggersIfNeeded = function (that, keyedInUserToken) {
///     if (!fluid.isValue(keyedInUserToken)) {
///         that.clearTriggers();
///     }
/// };


/*
    {
        type: "keyedInBefore",
        value: {
            unit: "m",
            value: 5
        }
    },
    {
        type: "keyedInLessThan",
        value: {
            unit: "h",
            value: 2
        }
    }


Manager is always created
    * has multiple handler for each type of condition
Manager splits trigger registration into multiple handlers


Handlers are singletons
Have names
They are created in the start (inital initialization)
Provides facts asyncly
Have simple interface
    Fire event on fact state?
    Can be cleared (reset), stopping timers etc.

Timer - self sufficant setTimeout/interval wrapper
Notifies for timeout/interval appear (event vs callback)
May re



keyedInBeforeHandler
    - listens for keyIn
        - sets local timestamp propery
    - registers timer
    - clears timer

*/

fluid.defaults("gpii.app.triggerEngine", {
    gradeNames: ["fluid.component"],

    // TODO
    members: {
        engine: ""
    },

    events: {
        onConditionsSatisfied: null
    },

    invokers: {
        supplyFact: {
            this: "console",
            method: "log",
            args: ["SOME FACTS: ", "{arguments}"]
        },
        init: {
            funcName: "gpii.app.triggerEngine",
            args: ["{that}", "{arguments}.0"]
        },
        // reset: {
        // }
    }
});

gpii.app.triggerEngine = function (that, triggerData) {
    // recreate engine
    // add rule/conditions
};



/**
 * TODO
 */
fluid.defaults("gpii.app.surveyTriggersManagerV2", {
    gradeNames: ["fluid.modelComponent"],

    events: {
        onTriggerOccurred: null
    },

    components: {
        // factsManager: null,

        // IDEA condition/rule engine
        triggerEngine: {
            type: "gpii.app.triggerEngine",
            options: {
                listeners: {
                    onConditionsSatisfied: "{surveyTriggersManagerV2}.events.onTriggerOccurred",
                    "{factsManager}.events.onFactUpdated": "{that}.supplyFact"
                }
            }
        }
    },

    invokers: {
        // reset: {
        //     funcName: "gpii.app.surveyTriggersManagerV2.reset",
        //     args: "{that}"
        // },

        registerTrigger: {
            funcName: "gpii.app.surveyTriggersManagerV2.registerTrigger",
            args: [
                "{triggerEngine}",
                "{arguments}.0"
            ]
        }
    }
});


gpii.app.surveyTriggersManagerV2.registerTrigger = function (triggerEngine, triggerData) {
    /// TODO support:
    /// * ANY, ALL

    // triggerEngine.init(triggerData);
};


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
            type: "gpii.app.surveyTriggersManagerV2.keyedInBeforeProvider",
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
fluid.defaults("gpii.app.surveyTriggersManagerV2.factProvider", {
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
fluid.defaults("gpii.app.surveyTriggersManagerV2.keyedInBeforeProvider", {
    gradeNames: ["gpii.app.surveyTriggersManagerV2.factProvider"],
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
            funcName: "gpii.app.surveyTriggersManagerV2.keyedInBeforeProvider.getFact",
            args: [
                "{that}.model.userKeyedInTimestamp"
            ]
        },
        reset: {
            funcName: "gpii.app.surveyTriggersManagerV2.keyedInBeforeProvider.reset",
            args: "{that}"
        },

        _updateKeyedInTimestamp: {
            changePath: "userKeyedInTimestamp",
            value: "@expand:Date.now()"
        }
    }
});

gpii.app.surveyTriggersManagerV2.keyedInBeforeProvider.reset = function (that) {
    that.inteval.clear();

    // clear the timestamp, as no one keyedIn
    that.applier.change("keyedInTimestamp", null);
};


/**
 * @param keyedInTimestamp {Number} Time of key in
 * @return {Number} milliseconds since key in
 */
gpii.app.surveyTriggersManagerV2.keyedInBeforeProvider.getFact = function (keyedInTimestamp) {
    return Date.now() - keyedInTimestamp;
};


///// =====

/*
gpii.app.surveyTriggersManager.keyedInBeforeHandler.handle =
    function (keyedInTimestamp, timer, condition) {
        var unit = condition.value.unit,
            value = condition.value.value;

        var timeout = 0;
        switch (unit) {
        // TODO enum? (compute prefix only once)
        case "s":
            timeout = 1000 * value;
            break;
        case "m":
            timeout = 1000 * 60 * value;
            break;
        case "h":
            timeout = 1000 * 60 * 60 * value;
            break;
        default:
            console.log("ERROR(KeyedInBeforeHandler): No such unit - ", unit);
        }

        // As the keyed in may have occurred some time before the
        // triggers are registered, ensure proper timer since
        // "keyed in" is passed
        timer.start(timeout - (Date.now() - keyedInTimestamp));
    };
*/

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
                "@expand:setInterval({that}.events.onTimerFinished.fire, {arguments}.0)"
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
