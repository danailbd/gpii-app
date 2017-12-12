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


fluid.defaults("gpii.app.surveyTriggersManager", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        keyedInUserToken: null,
        activeTimer: null
    },

    modelListeners: {
        keyedInUserToken: {
            funcName: "gpii.app.surveyTriggersManager.clearTriggersIfNeeded",
            args: ["{that}", "{change}.value"],
            excludeSource: "init"
        }
    },

    events: {
        onTriggerOccurred: null
    },


    invokers: {
        registerTrigger: {
            funcName: "gpii.app.surveyTriggersManager.registerTrigger",
            args: ["{that}", "{arguments}.0"]
        },
        clearTriggers: {
            funcName: "gpii.app.surveyTriggersManager.clearTriggers",
            args: ["{that}"]
        }
    }
});


gpii.app.surveyTriggersManager.registerTrigger = function (that, triggerData) {
    that.clearTriggers();

    if (!triggerData || !triggerData.conditions) {
        return;
    }

    var conditions = triggerData.conditions;
    if (conditions.length !== 1) {
        console.log("SurveyTriggerManager: Unsoported number of conditions: ", conditions.length);
        return;
    }

    // XXX mock
    var timer;
    if (conditions[0].minutesSinceKeyIn) {
        timer = setTimeout(
            function () {
                console.log("SurveyTriggerManager: KeyedIn Timer triggered!");

                delete triggerData.conditions;
                that.events.onTriggerOccurred.fire(triggerData);
            },
            conditions[0].minutesSinceKeyIn * 1000
        );
        that.applier.change("activeTimer", timer);
    }
};


gpii.app.surveyTriggersManager.clearTriggers = function (that) {
    if (that.model.activeTimer) {
        clearTimeout(that.model.activeTimer);
        that.applier.change("activeTimer", null, "DELETE");
    }
};

gpii.app.surveyTriggersManager.clearTriggersIfNeeded = function (that, keyedInUserToken) {
    if (!fluid.isValue(keyedInUserToken)) {
        that.clearTriggers();
    }
};


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

fluid.defaults("gpii.app.surveyTriggersManagerV2", {
    gradeNames: ["fluid.modelComponent"],

    model: {
    },

    events: {
        onTriggerOccurred: null
    },

    members: {
        // single instance handlers
        handlersMap: {
            keyedInBefore: "{that}.keyedInBeforeHandler",
            // more fun
        }
    },

    listeners: {
        "{app}.events.onKeyOut": "{that}.reset"
    },

    components: {
        // IDEA: separate component - triggersEngine
        // condition handlers
        userKeyedInBeforeHandler: {
            // registers
            type: "gpii.app.surveyTriggersManagerV2.userKeyedInBeforeHandler"
        }
    },

    invokers: {
        reset: {
            funcName: "gpii.app.surveyTriggersManagerV2.reset",
            args: "{that}"
        },
        registerTrigger: {
            funcName: "gpii.app.surveyTriggersManagerV2.registerTrigger",
            args: [
                "{that}.handlersMap",
                "{arguments}.0"
            ]
        }
    }
});


gpii.app.surveyTriggersManagerV2.registerTrigger = function (handlers, triggerData) {
    /// TODO support:
    /// * ANY, ALL

    // * iter conditions
    // * apply handler for conditions
};


////////////////////////////////////////////////////////////////////////
//                              HANDLERS                              //
////////////////////////////////////////////////////////////////////////
fluid.defaults("gpii.app.surveyTriggersManagerV2.baseHandler", {
    gradeNames: ["fluid.modelComponent", "gpii.app.surveyTriggersManagerV2.baseHandler"],

    name: "", // Added by implementor

    events: {
        // TODO better name? / of component
        onSimpleTrigger: null
    },

    invokers: {
        handle: {
            funcName: "fluid.notImplemented",
            args: ["{arguments}.0"]
        },
        reset: {
            funcName: "fluid.notImplemented"
        }
    }
});

fluid.defaults("gpii.app.surveyTriggersManagerV2.keyedInBeforeHandler", {
    gradeNames: ["gpii.app.surveyTriggersManagerV2.baseHandler"],
    name: "keyedInBeforeHandler",

    model: {
        // TODO could be extracted to upper component
        keyedInTimestamp: null,
    },

    listener: {
        "{app}.events.keyedIn": {
            func: "{that}.updateKeyedInTimestamp"
        }
    },

    components: {
        timer: {
            type: "gpii.app.timer",
            events: {
                // Just make an alias
                onTimerFinished: "{that}.events.onSimpleTrigger"
            }
        }
    },

    invokers: {
        handle: {
            funcName: "gpii.app.surveyTriggersManager.keyedInBeforeHandler.handle",
            args: [
                "{that}.model.keyedInTimestamp",
                "{that timer}",
                "{arguments}.0"
            ]
        },
        reset: {
            funcName: "{that timer}.clear"
        },

        updateKeyedInTimestamp: {
            changePath: "keyedInUserTimestamp",
            value: "@expand:Date.now()"
        }
    }
});

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


/*
    TODO
    Two posible approaches:
    * fire event onTimerFinished
 */
fluid.defaults("gpii.app.timer", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        timer: null,

        /// could be useful
        // value: null,
        // unit: null
    },

    listeners: {
        "onDestroy.clearTimer": "{that}.clear"
    },

    events: {
        onTimerFinished: null
    },

    invokers: {
        start: {
            funcName: "gpii.app.timer.start",
            args: [
                "{that}",
                "{arguments}.0"
            ]
        },
        clear: {
            funcName: "clearTimeout",
            args: "{that}.model.timer"
        }
    }
});

gpii.app.timer.start = function (timer, timeout) {
    timer.change.applier("timer",
        setTimeout(timer.events.onTimerFinished.fire, timeout));
};
