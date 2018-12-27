/**
 * PSP Integration Test Utilities
 *
 * Utilities for starting and running the PSP integration tests. Provide means for
 * prepending and appending necessary sequence elements to the test definitions and
 * for bootstraping the test application instance.
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

require("gpii-windows/index.js"); // loads gpii-universal as well

var fluid = require("infusion"),
    kettle = fluid.registerNamespace("kettle"),
    gpii = fluid.registerNamespace("gpii");

fluid.require("%gpii-universal/gpii/node_modules/testing");

gpii.loadTestingSupport();

require("./DialogManagerTestDefs.js");
require("./IntegrationTestDefs.js");
require("./QssTestDefs.js");
require("./SequentialDialogsTestDefs.js");
require("./SettingsBrokerTestDefs.js");
require("./StorageTestDefs.js");
require("./SurveysConnectorTestDefs.js");
require("./SurveyTriggerManagerTestsDefs.js");
require("./ShortcutsManagerTestDefs.js");
require("./UserErrorsHandlerTestDefs.js");
require("./SiteConfigurationHandlerTestDefs.js");
require("./WebviewTestDefs.js");
require("./GpiiConnectorTestDefs.js");
require("./PspTestDefs.js");
require("./TimerTestDefs.js");

// TODO: Review this following CI run.
//fluid.setLogging(fluid.logLevel.FATAL);

fluid.registerNamespace("gpii.tests.app");

/*
 * Preceding items for every test sequence.
 */
gpii.tests.app.startSequence = [
    { // This sequence point is required because of a QUnit bug - it defers the start of sequence by 13ms "to avoid any current callbacks" in its words
        func: "{testEnvironment}.events.constructServer.fire"
    },
    { // Before the actual tests commence, the PSP application must be fully functional. The `onPSPReady` event guarantees that.
        event: "{that gpii.app}.events.onPSPReady",
        listener: "fluid.identity"
    },
    {
        event: "{testEnvironment}.events.noUserLoggedIn",
        listener: "fluid.identity"
    }
];

/*
 * Items added after every test sequence.
 */
gpii.tests.app.endSequence = [];

/*
 * We might need to conditionally make some options distributions that should affect all test sequences.
 * Every test sequence specifies a configuration file to be used for creating the gpii-app.
 * As we can't easily change all test sequences configuration files to some containing desired distribution
 * we can use this property to do so.
 *
 * This is extremely useful in the case of coverage collecting for the renderer processes
 * as we need to distribute options only if we are running instrumented code (coverage data
 * is to be collected).
 */
gpii.tests.app.testsDistributions = {};


/**
 * Used to disable the system language listener and set a fixed language.
 */
fluid.defaults("gpii.tests.app.mockedSystemLanguageListener", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        installedLanguages: {},
        configuredLanguage: "en-US"
    }
});

/**
 * Attach instances that are needed in test cases.
 * @param {Component} testCaseHolder - The overall test cases holder
 * @param {Component} flowManager - The `gpii.flowManager`
 */
gpii.tests.app.receiveApp = function (testCaseHolder, flowManager) {
    testCaseHolder.flowManager = flowManager;
    testCaseHolder.app = flowManager.app;
};

// This is a fork of kettle.test.testDefToCaseHolder which is written in a non-reusable style
// See: https://issues.fluidproject.org/browse/KETTLE-60
gpii.tests.app.testDefToCaseHolder = function (configurationName, testDefIn) {
    var testDef = fluid.copy(testDefIn);
    var sequence = testDef.sequence;
    delete testDef.sequence;
    delete testDef.config;
    // We eliminate this since we need to wait longer for the app to be started
    // as well as the server
    // sequence.unshift.apply(sequence, kettle.test.startServerSequence);
    sequence.unshift.apply(sequence, gpii.tests.app.startSequence);
    sequence.push.apply(sequence, gpii.tests.app.endSequence);
    testDef.modules = [{
        name: configurationName + " tests",
        tests: [{
            name: testDef.name,
            expect: testDef.expect,
            sequence: sequence
        }]
    }];
    return testDef;
};

// Also a fork from kettle
// See: https://issues.fluidproject.org/browse/KETTLE-60
gpii.tests.app.testDefToServerEnvironment = function (testDef) {
    var configurationName = testDef.configType || kettle.config.createDefaults(testDef.config);
    return {
        type: "kettle.test.serverEnvironment",
        options: {
            configurationName: configurationName,
            components: {
                tests: {
                    options: gpii.tests.app.testDefToCaseHolder(configurationName, testDef)
                }
            },
            distributeOptions: gpii.tests.app.testsDistributions,
            events: {
                noUserLoggedIn: null
            }
        }
    };
};

// Also a fork from kettle
// See: https://issues.fluidproject.org/browse/KETTLE-60
gpii.tests.app.bootstrapServer = function (testDefs, transformer) {
    return kettle.test.bootstrap(testDefs, fluid.makeArray(transformer).concat([gpii.tests.app.testDefToServerEnvironment]));
};

/*
 * In case we're running tests with coverage data collecting,
 * we'd need to collect coverage data for the renderer as well.
 * This allows running the tests without coverage collecting.
 */
if (gpii.tests.app.isInstrumented) {
    /*
     * Run coverage collecting for the BrowserWindow-s.
     *
     * NOTE: This should be required last as it overrides existing items, such as `gpii.tests.app.endSequence`
     */
    fluid.require("%gpii-app/tests/lib/enableRendererCoverage.js");
}


gpii.tests.app.bootstrapServer([
    fluid.copy(gpii.tests.app.testDefs),
    fluid.copy(gpii.tests.dev.testDefs),
    fluid.copy(gpii.tests.psp.testDefs),
    fluid.copy(gpii.tests.timer.testDefs),
    fluid.copy(gpii.tests.dialogManager.testDefs),
    fluid.copy(gpii.tests.qss.testDefs),
    fluid.copy(gpii.tests.sequentialDialogs.testDefs),
    fluid.copy(gpii.tests.shortcutsManager.testDefs),
    fluid.copy(gpii.tests.settingsBroker.testDefs),
    fluid.copy(gpii.tests.surveys.dynamicSurveyConnectorTestDefs),
    fluid.copy(gpii.tests.surveyTriggerManager.testDefs),
    fluid.copy(gpii.tests.siteConfigurationHandler.testDefs),
    fluid.copy(gpii.tests.storage.testDefs),
    fluid.copy(gpii.tests.userErrorsHandler.testDefs),
    fluid.copy(gpii.tests.gpiiConnector.testDefs),
    fluid.copy(gpii.tests.webview.testDefs)
]);
