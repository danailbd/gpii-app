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

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

require("../utils.js");
require("./surveyTriggerManager.js");
require("./surveyConnector.js");

fluid.defaults("gpii.app.surveyManager", {
    gradeNames: ["fluid.component"],
    events: {
        onSurveyRequired: null,
        onSurveyTimeout: null
    },

    components: {
        surveyConnector: {
            type: "gpii.app.surveyConnector",
            options: {
                model: {
                    machineId: "{app}.model.machineId",
                    userId: "{app}.model.keyedInUserToken"
                },
                events: {
                    onSurveyRequired: "{surveyManager}.events.onSurveyRequired"
                },
                listeners: {
                    "{app}.events.onKeyedIn": {
                        func: "{that}.requestTriggers"
                    },

                    onSurveyRequired: {
                        funcName: "gpii.app.surveyManager.registerSurveyTimeout",
                        args: ["{surveyTriggerManager}", "{arguments}.0"]
                    },

                    onTriggerDataReceived: {
                        func: "{surveyTriggerManager}.registerTrigger",
                        args: ["{arguments}.0"]
                    }
                }
            }
        },

        surveyTriggerManager: {
            type: "gpii.app.surveyTriggerManager",
            options: {
                events: {
                    onSurveyTimeout: "{surveyManager}.events.onSurveyTimeout"
                },
                listeners: {
                    onTriggerOccurred: {
                        func: "{surveyConnector}.notifyTriggerOccurred",
                        args: "{arguments}.0" // the trigger payload
                    }
                },
                components: {
                    rulesEngine: "{rulesEngine}"
                }
            }
        }
    }
});

gpii.app.surveyManager.registerSurveyTimeout = function (surveyTriggerManager, payload) {
    if (fluid.isValue(payload.timeout)) {
        surveyTriggerManager.registerTimeout(payload.timeout);
    }
};
