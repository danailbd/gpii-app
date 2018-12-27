/**
 * A wrapper for the survey related functionality
 *
 * An Infusion component which simply wraps the `surveyConnector` and the
 * `surveyTriggerManager` and coordinates their interactions.
 * Copyright 2018 Raising the Floor - US
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The R&D that led to this software was funded by the Rehabilitation Services Administration,
 * US Dept of Education under grant H421A150006 (APCP), by the National Institute on Disability,
 * Independent Living, and Rehabilitation Research (NIDILRR), US Administration for
 * Independent Living & US Dept of Education under Grants H133E080022 (RERC-IT) and H133E130028/90RE5003-01-00
 * (UIITA-RERC), by the European Union's Seventh Framework Programme (FP7/2007-2013) grant agreement n° 289016 (Cloud4all)
 * and 610510 (Prosperity4All), by the Flora Hewlett Foundation, the Ontario Ministry of Research and Innovation,
 * and the Canadian Foundation for Innovation, by Adobe Foundation and the Consumer Electronics Association Foundation.
 * The opinions and results herein are those of the authors and not necessarily those of the funding agencies.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

require("../common/utils.js");
require("./surveyTriggerManager.js");
require("./surveyConnector.js");

/**
 * This component serves as a mediator between the `surveyConnector`, the
 * `surveyTriggerManager` and the app itself.
 */
fluid.defaults("gpii.app.surveyManager", {
    gradeNames: ["fluid.modelComponent"],

    events: {
        onSurveyRequired: null
    },

    modelListeners: {
        "{app}.model.keyedInUserToken": {
            func: "{surveyTriggerManager}.reset",
            excludeSource: "init"
        },
        /**
         * Request the triggers only when the user's preferences are delivered to the app.
         * This is better that requesting both the user's preferences and the triggers at
         * the same time because in that case there is no guarantee which of them will
         * arrive first which in turn will make the handling logic more complex.
         */
        "{app}.model.preferences.gpiiKey": {
            funcName: "gpii.app.surveyManager.requestTriggers",
            args: [
                "{surveyConnector}",
                "{change}.value"
            ]
        }
    },

    components: {
        surveyConnector: {
            type: "gpii.app.surveyConnector",
            options: {
                model: {
                    machineId: "{app}.machineId",
                    keyedInUserToken: "{app}.model.keyedInUserToken",
                    qssSettings: "{app}.qssWrapper.model.settings"
                },
                events: {
                    onSurveyRequired: "{surveyManager}.events.onSurveyRequired"
                },
                listeners: {
                    onTriggerDataReceived: {
                        funcName: "gpii.app.surveyManager.registerTriggers",
                        args: [
                            "{surveyTriggerManager}",
                            "{arguments}.0" // triggers
                        ]
                    }
                }
            }
        },

        surveyTriggerManager: {
            type: "gpii.app.surveyTriggerManager",
            options: {
                listeners: {
                    onTriggerOccurred: {
                        func: "{surveyConnector}.notifyTriggerOccurred",
                        args: "{arguments}.0" // the trigger payload
                    }
                }
            }
        }
    }
});

/**
 * Retrieves the survey triggers for the current user.
 * Note that the "noUser" is treated as a normal user.
 * @param {Component} surveyConnector - The `gpii.app.surveyConnector` instance.
 * @param {String} keyedInUserToken - The token of the currently keyed in user (if any).
 */
gpii.app.surveyManager.requestTriggers = function (surveyConnector, keyedInUserToken) {
    if (fluid.isValue(keyedInUserToken)) {
        surveyConnector.requestTriggers();
    }
};

/**
 * Registers all survey triggers received via the `surveyConnector` with
 * the `surveyTriggerManager`.
 * @param {Component} surveyTriggerManager - The `gpii.app.surveyTriggerManager` instance.
 * @param {Array} triggers - An array representing the received triggers.
 */
gpii.app.surveyManager.registerTriggers = function (surveyTriggerManager, triggers) {
    fluid.each(triggers, function (trigger) {
        surveyTriggerManager.registerTrigger(trigger);
    });
};
