/**
 * PSP Survey Integration Test Definitions
 *
 * Test definitions for survey related functionalities. Check whether a trigger message
 * is interpreted correctly as well as whether a survey is shown when necessary.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

require("../src/main/app.js");

fluid.registerNamespace("gpii.tests.webview.testDefs");

var surveyDialogFixture = {
    url: "%gpii-app/testData/survey/webview.html",
    closeOnSubmit: true,
    window: {
        width: 800,
        height: 600,
        resizable: true,
        closable: true,
        minimizable: false,
        maximizable: true
    }
};

gpii.tests.webview.getSurveyFixture = function () {
    var fixture = fluid.extend(true, {}, surveyDialogFixture);
    fixture.url = fluid.module.resolvePath(fixture.url);
    return fixture;
};

gpii.tests.webview.testDefs = {
    name: "Webview integration tests",
    expect: 3,
    config: {
        configName: "gpii.tests.dev.config",
        configPath: "tests/configs"
    },
    gradeNames: ["gpii.test.common.testCaseHolder"],
    sequence: [{
        func: "{that}.app.keyIn",
        args: ["snapset_1a"]
    }, [
        {
            func: "{that}.app.dialogManager.show",
            args: ["survey", gpii.tests.webview.getSurveyFixture()]
        }, {
            event: "{that gpii.app.surveyDialog}.events.onSurveyCreated",
            listener: "fluid.identity"
        }, {
            func: "{that}.app.dialogManager.survey.surveyDialog.executeCommand",
            args: ["document.getElementsByClassName('flc-breakOut')[0].click()"]
        }, {
            event: "{that}.app.dialogManager.survey.surveyDialog.events.onSurveyClose",
            listener: "jqUnit.assert",
            args: ["Survey was closed by clicking on the break-out link"]
        }
    ], [
        {
            func: "{that}.app.dialogManager.show",
            args: ["survey", gpii.tests.webview.getSurveyFixture()]
        }, {
            event: "{that gpii.app.surveyDialog}.events.onSurveyCreated",
            listener: "fluid.identity"
        }, {
            func: "{that}.app.dialogManager.survey.surveyDialog.executeCommand",
            args: ["document.getElementsByClassName('flc-closeBtn')[0].click()"]
        }, {
            event: "{that}.app.dialogManager.survey.surveyDialog.events.onSurveyClose",
            listener: "jqUnit.assert",
            args: ["Survey was closed by clicking on the close button within the content"]
        }
    ], [
        {
            func: "{that}.app.dialogManager.show",
            args: ["survey", gpii.tests.webview.getSurveyFixture()]
        }, {
            event: "{that gpii.app.surveyDialog}.events.onSurveyCreated",
            listener: "fluid.identity"
        }, {
            func: "{that}.app.dialogManager.survey.surveyDialog.executeCommand",
            args: ["var elem = document.createElement('div'); elem.id = 'EndOfSurvey'; document.body.appendChild(elem);"]
        }, {
            event: "{that}.app.dialogManager.survey.surveyDialog.events.onSurveyClose",
            listener: "jqUnit.assert",
            args: ["Survey was closed automatically when its end has been reached"]
        }
    ], {
            func: "{that}.app.keyOut"
    }]
};
