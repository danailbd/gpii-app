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
var RulesEngine = require("json-rules-engine").Engine;

var gpii = fluid.registerNamespace("gpii");

require("../utils.js");


/*

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

/**
 * TODO
 * N.B.! Resets with first rule success
 */
fluid.defaults("gpii.app.conditionsEngine", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        engine: null
    },

    events: {
        onRuleSatisfied: null
    },

    listeners: {
        "onCreate.initEngine": {
            func: "{that}.reset"
        }
    },

    invokers: {
        /*
         * Runs async rule checking.
         * Note that, in case the any rule is satisfied, the engine will
         * be reset, removing the succeeded rule.
         */
        checkRule: {
            this: "{that}.model.engine",
            method: "run",
            // the new facts
            args: ["{arguments}.0"]
        },
        addRule: {
            funcName: "gpii.app.conditionsEngine.addRule",
            args: [
                "{that}.model.engine",
                "{arguments}.0",
                "{arguments}.1"
            ]
        },
        reset: {
            funcName: "gpii.app.conditionsEngine.reset",
            args: [
                "{that}",
                "{that}.events"
            ]
        },

        // Could be overritten to supply different success handling
        registerSuccessListener: {
            funcName: "gpii.app.conditionsEngine.registerSuccessListener",
            args: [
                "{that}",
                "{that}.model.engine",
                "{that}.events"
            ]
        }
    }
});


gpii.app.conditionsEngine.registerSuccessListener = function (that, engine, events) {
    console.log("Trigger engine - Registered listeners")
    engine.once("success", function (event) {
        console.log("conditionsEngine success (event): ", event)
        events.onRuleSatisfied.fire(event);
        // Reset the engine in order to clear the rule
        that.reset();
    });
};

gpii.app.conditionsEngine.reset = function (that) {
    var engine = new RulesEngine();
    that.applier.change("engine", engine);

    that.registerSuccessListener();
};

gpii.app.conditionsEngine.addRule = function (engine, conditions, event) {
    engine.addRule({
        conditions: conditions,
        event: {
            type: event.type,
            params: event.payload
        }
    });
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
        factsManager: null,

        // IDEA condition/rule engine
        conditionsEngine: {
            type: "gpii.app.conditionsEngine",
            options: {
                listeners: {
                    onRuleSatisfied: "{surveyTriggersManagerV2}.events.onTriggerOccurred",
                    "{factsManager}.events.onFactUpdated": "{that}.checkRule"
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
                "{conditionsEngine}",
                "{arguments}.0"
            ]
        }
    }
});

/**
 * TODO
 * simple wrapper
 */
gpii.app.surveyTriggersManagerV2.registerTrigger = function (conditionsEngine, triggerData) {
    console.log("Trigger manager: Register Trigger - ", triggerData);
    // TODO
    conditionsEngine.addRule(triggerData.conditions, {
        type: "surveyTrigger",
        payload: {
            id: triggerData.id,
            urlTriggerHandler: triggerData.urlTriggerHandler
        }
    });
};
