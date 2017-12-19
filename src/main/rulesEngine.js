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


/**
 * TODO
 *
 * A user of this rules engine would probably follow these steps of usage:
 * - register for `onRuleSatisfied` event with specific `ruleId`
 * - `addRule` that is to be tested
 * - once the rule succees, `removeRule`
 *
 * The rules' conditions follow this shema https://github.com/CacheControl/json-rules-engine/blob/72d0d2abe46ae95c730ac5ccbe7cb0f6cf28d784/docs/rules.md#conditions, where the `fact` name is
 * a defined and registered in the `gpii.app.factsManager`, `gpii.app.factProvider`.
 *
 * Note: A strange implementation detail is that currently each rule is run in dedicated `json-rule-engine` engine
 * in order to support removal of rules. Using this module adds flexibility and currently seems sufficient.
 */
fluid.defaults("gpii.app.rulesEngine", {
    gradeNames: ["fluid.modelComponent"],

    /*
     * Map of named rules. It follows the pattern:
     * { ruleId: <Single rule, ruleEngine>, }
     */
    members: {
        registeredRulesMap: {}
    },

    events: {
        onRuleSatisfied: null
    },

    invokers: {
        checkRules: {
            funcName: "gpii.app.rulesEngine.checkRules",
            // the new facts
            args: [
                "{that}.registeredRulesMap",
                "{arguments}.0"
            ]
        },
        addRule: {
            funcName: "gpii.app.rulesEngine.addRule",
            args: [
                "{that}",
                "{that}.registeredRulesMap",
                "{arguments}.0",
                "{arguments}.1",
                "{arguments}.2"
            ]
        },
        removeRule: {
            funcName: "gpii.app.rulesEngine.removeRule",
            args: [
                "{that}.registeredRulesMap",
                "{arguments}.0"
            ]
        },
        reset: {
            funcName: "gpii.app.rulesEngine.reset",
            args: [
                "{that}",
                "{that}.events"
            ]
        },

        // Could be overwritten to supply different success handling
        registerSuccessListener: {
            funcName: "gpii.app.rulesEngine.registerSuccessListener",
            args: [
                "{arguments}.0",
                "{arguments}.1",
                "{that}.events"
            ]
        }
    }
});

/**
 * Registers success listener for the given rule. Once the rule is satisfied an
 * event is fired with `ruleId` and  `payload` as parameters.
 * @param registeredRulesMap {Object} The map of all registered rules
 * @param ruleId {String} The id for the that is to be removed
 * @param events {Object} A map of events that could be used (events that are part
 * of `gpii.app.rulesEngine` signature`)
 */
gpii.app.rulesEngine.registerSuccessListener = function (registeredRulesMap, ruleId, events) {
    // Register for the specific rule to
    registeredRulesMap[ruleId].on("success", function (event) {
        console.log("Conditions Engine - Rule success: ", ruleId, event.params)
        events.onRuleSatisfied.fire(ruleId, event.params);
    });
};

/**
 * Remove all registered rules for the engine.
 * @param that {Component} The rulesEngine component
 */
gpii.app.rulesEngine.reset = function (that) {
    that.registeredRulesMap = {};
};

/**
 * Removes a rule from the rule engine. For example this could wanted for
 * once the rule is satisfied, but this logic is
 * @param registeredRulesMap {Object} The map of all registered rules
 * @param ruleId {String} The id for the that is to be removed
 */
gpii.app.rulesEngine.removeRule = function (registeredRulesMap, ruleId) {
    console.log("rulesEngine - Remove Rule: ", ruleId, registeredRulesMap)
    // just let garbage collection do its work
    registeredRulesMap[ruleId] = null;
};

/**
 * Registers a rule to the engine which is to be tested with the next `checkRules` call.
 * @param that {Component} The rulesEngine component
 * @param registeredRulesMap {Object} The map of all registered rules
 * @param ruleId {String} The id for rule being added
 * @param conditions {Object} A list of */
gpii.app.rulesEngine.addRule = function (that, registeredRulesMap, ruleId, conditions, payload) {
    /*
     * This approach is needed the current dependent rule engine module (`json-rules-engine`) doesn't
     * support removal of already added rules. But we want to use its extensive rule checking functionality
     */
    registeredRulesMap[ruleId] = new RulesEngine([{
        conditions: conditions,
        event: {
            type: ruleId,
            params: payload
        }
    }]);

    that.registerSuccessListener(registeredRulesMap, ruleId);
};

/**
 * Runs async check whether any of the registered rules is satisfied
 * against the supplied facts. In case of satisfied rules, the
 * registered "success" listener will be fired.
 *
 * @param registeredRulesMap {Object} The map of registered rules
 * @param facts {Object} A map of all facts to be used for the checking.
 * It follows the type { factName: factValue, }
 */
gpii.app.rulesEngine.checkRules = function (registeredRulesMap, facts) {
    var ruleEngines = fluid
        .values(registeredRulesMap)
        .filter(fluid.isValue);

    console.log("DEBUG: Checking Registered rules: ")

    ruleEngines.forEach(function (engine) {
        console.log(engine.rules)
        engine.run(facts);
    });
};
