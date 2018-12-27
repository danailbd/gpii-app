/**
 * PSP Survey Integration Test Definitions
 *
 * Test definitions for survey related functionalities. Check whether a trigger message
 * is interpreted correctly as well as whether a survey is shown when necessary.
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

var jqUnit = fluid.require("node-jqunit");

require("../src/main/app.js");
require("gpii-express");

fluid.registerNamespace("gpii.tests.surveys");

fluid.defaults("gpii.tests.app.simpleTriggersServer", {
    gradeNames: ["gpii.express"],
    port: 8083,
    components: {
        contentRouter: {
            type: "gpii.express.router.serveContentAndIndex",
            options: {
                path:    "/surveys",
                content: "%gpii-app/tests/fixtures/survey/"
            }
        }
    }
});

fluid.defaults("gpii.tests.app.simpleTriggersServerWrapper", {
    components: {
        surveyTriggersServer: {
            type: "gpii.tests.app.simpleTriggersServer"
        }
    }
});

gpii.tests.surveys.assertSurveyFixture = function (expected, actual) {
    jqUnit.assertTrue("The url of the received survey is correct", actual.url.startsWith(expected.url));
    jqUnit.assertLeftHand("The properties of the survey BrowserWindow are correct", expected.window, actual.window);
};


// uses the sessionTimer trigger for the tests
var noUserTriggersSequence = [
    { // Survey triggers are received with key in
        event: "{that}.app.surveyManager.surveyConnector.events.onTriggerDataReceived",
        listener: "jqUnit.assertDeepEq",
        args: [
            "The trigger fixture is correctly received",
            "@expand:fluid.require(%gpii-app/tests/fixtures/survey/triggers.json)",
            "{arguments}.0"
        ]
    },
    { // ... make it a lucky session
        func: "{that}.app.qssWrapper.qss.show"
    },
    { // ... simulate change happening from the QSS
        func: "{that}.app.qssWrapper.qss.events.onQssSettingAltered.fire",
        args: [
            {
                path: "http://registry\\.gpii\\.net/common/selfVoicing/enabled",
                value: true // change to a new value
            }
        ]
    },
    { // ... survey for "sessionTimer" should appear
        event: "{that}.app.surveyManager.surveyConnector.events.onSurveyRequired",
        // Note that the argument (passed by the event) will have some extra
        // fields as a side effect of a component creation
        listener: "gpii.tests.surveys.assertSurveyFixture",
        args: [
            "@expand:fluid.require(%gpii-app/tests/fixtures/survey/survey1.json)",
            "{arguments}.0"
        ]
    }
];

// uses the keyedInFor trigger for the tests
var keyedInTriggersSequence = [
    {
        func: "{that}.app.keyIn",
        args: ["snapset_1a"]
    }, { // Survey triggers are received with key in
        event: "{that}.app.surveyManager.surveyConnector.events.onTriggerDataReceived",
        listener: "jqUnit.assertDeepEq",
        args: [
            "The trigger fixture is correctly received",
            "@expand:fluid.require(%gpii-app/tests/fixtures/survey/triggers.json)",
            "{arguments}.0"
        ]
    }, { // we should get the survey after a second for the "keyedIn" trigger
        event: "{that}.app.surveyManager.surveyConnector.events.onSurveyRequired",
        // Note that the argument (passed by the event) will have some extra
        // fields as a side effect of a component creation
        listener: "gpii.tests.surveys.assertSurveyFixture",
        args: [
            "@expand:fluid.require(%gpii-app/tests/fixtures/survey/survey2.json)",
            "{arguments}.0"
        ]
    },
    {
        func: "{that}.app.keyOut"
    }, {
        event: "{that}.app.events.onKeyedOut",
        listener: "fluid.identity"
    }
];

var edgeCasesSequence = [
    {
        task: "gpii.app.dynamicSurveyConnector.requestData",
        args: [
            "{that}.app.surveyManager.surveyConnector",
            "http://localhost:8083/surveys/invalid_triggers.json"
        ],
        reject: "jqUnit.assertEquals",
        rejectArgs: [
            "The survey connector cannot load triggers from an invalid URL",
            "Survey connector: Cannot get data",
            "{arguments}.0"
        ]
    }, {
        task: "gpii.app.dynamicSurveyConnector.requestData",
        args: [
            "{that}.app.surveyManager.surveyConnector",
            "http://localhost:8083/surveys/malformed_triggers.json"
        ],
        reject: "jqUnit.assertEquals",
        rejectArgs: [
            "The survey connector cannot parse malformed triggers JSON file",
            "Survey connector: Error parsing data",
            "{arguments}.0"
        ]
    }
];

gpii.tests.surveys.dynamicSurveyConnectorTestDefs = {
    name: "Dynamic survey connector integration tests",
    expect: 8,
    config: {
        configName: "gpii.tests.dynamicSurveyConnector.config",
        configPath: "tests/configs"
    },
    gradeNames: ["gpii.test.common.testCaseHolder"],
    sequence: [
        {
            event: "{that gpii.app.qss}.events.onDialogReady",
            listener: "fluid.identity"
        },
        keyedInTriggersSequence,
        noUserTriggersSequence,
        edgeCasesSequence
    ]
};
