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

    /*
     * Map of named rules.
     */
    registeredRulesMap: {},

    events: {
        onRuleSatisfied: null
    },

    invokers: {
        /*
         * Runs async rules checking.
         * In case of satisfied rules, the registered "success" listener
         * will fire the
         */
        checkRules: {
            funcName: "gpii.app.conditionsEngine.checkRules",
            // the new facts
            args: [
                "{that}.options.registeredRulesMap",
                "{arguments}.0"
            ]
        },
        addRule: {
            funcName: "gpii.app.conditionsEngine.addRule",
            args: [
                "{that}",
                "{that}.options.registeredRulesMap",
                "{arguments}.0",
                "{arguments}.1",
                "{arguments}.2"
            ]
        },
        removeRule: {
            funcName: "gpii.app.conditionsEngine.removeRule",
            args: [
                "{that}.options.registeredRulesMap",
                "{arguments}.0"
            ]
        },
        reset: {
            funcName: "gpii.app.conditionsEngine.reset",
            args: [
                "{that}",
                "{that}.events"
            ]
        },

        // Could be overwritten to supply different success handling
        registerSuccessListener: {
            funcName: "gpii.app.conditionsEngine.registerSuccessListener",
            args: [
                "{arguments}.0",
                "{arguments}.1",
                "{that}.events"
            ]
        }
    }
});


gpii.app.conditionsEngine.registerSuccessListener = function (engine, ruleId, events) {
    engine.on(ruleId, function (params) {
        console.log("Conditions Engine - Rule success: ", ruleId, params)
        events.onRuleSatisfied.fire(ruleId, params);
    });
};

gpii.app.conditionsEngine.reset = function (that) {
    that.options.registeredRulesMap = {};
};

gpii.app.conditionsEngine.removeRule = function (registeredRulesMap, ruleId) {
    console.log("ConditionsEngine - Remove Rule: ", ruleId, registeredRulesMap)
    // just let garbage collection do its work
    delete registeredRulesMap[ruleId];
};

gpii.app.conditionsEngine.addRule = function (that, registeredRulesMap, ruleId, conditions, payload) {
    /*
     * A bit strange approach for accomplishing the required behaviour as
     * the current dependent rule engine doesn't support removal of already added rules.
     */
    registeredRulesMap[ruleId] = new RulesEngine([{
        conditions: conditions,
        event: {
            type: ruleId,
            // TODO do we need that?
            params: payload
        }
    }]);

    that.registerSuccessListener(registeredRulesMap[ruleId], ruleId);
};

/**
 * TODO
 */
gpii.app.conditionsEngine.checkRules = function (registeredRulesMap, facts) {
    var ruleEngines = fluid.values(registeredRulesMap);

    console.log("DEBUG: Checking Registered rules: ")

    ruleEngines.forEach(function (engine) {
        console.log(engine.rules)
        engine.run(facts);
    });
};


/**
 * TODO
 */
fluid.defaults("gpii.app.surveyTriggerManager", {
    gradeNames: ["fluid.modelComponent"],

    events: {
        onTriggerOccurred: null
    },

    components: {
        factsManager: null,

        // TODO condition/rule engine
        conditionsEngine: {
            type: "gpii.app.conditionsEngine",
            options: {
                listeners: {
                    onRuleSatisfied: {
                        func: "{surveyTriggerManager}.handleRuleSuccess",
                        args: [
                            "{arguments}.0",
                            "{arguments}.1"
                        ]
                    },
                    "{factsManager}.events.onFactUpdated": "{that}.checkRules"
                }
            }
        }
    },

    invokers: {
        // reset: {
        //     funcName: "gpii.app.surveyTriggerManager.reset",
        //     args: "{that}"
        // },

        handleRuleSuccess: {
            funcName: "gpii.app.surveyTriggerManager.handleRuleSuccess",
            args: [
                "{that}",
                "{arguments}.0",
                "{arguments}.1"
            ]
        },

        registerTrigger: {
            funcName: "gpii.app.surveyTriggerManager.registerTrigger",
            args: [
                "{conditionsEngine}",
                "{arguments}.0"
            ]
        }
    }
});


gpii.app.surveyTriggerManager.handleRuleSuccess = function (that, ruleId, payload) {
    console.log("Rule handled: ", ruleId, payload)
    if (ruleId === "surveyTrigger") {
        that.events.onTriggerOccurred.fire(payload);
    }

    that.conditionsEngine.removeRule(ruleId);
};

/**
 * TODO
 * simple wrapper
 */
gpii.app.surveyTriggerManager.registerTrigger = function (conditionsEngine, triggerData) {
    console.log("Trigger manager: Register Trigger - ", triggerData);
    conditionsEngine.addRule(
        "surveyTrigger",
        triggerData.conditions,
        // TODO do we need in case only one survey at a time
        // we may have multiple?
        {
            triggerId: triggerData.id,
            urlTriggerHandler: triggerData.urlTriggerHandler

        });
};
