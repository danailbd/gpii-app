/*
 * GPII User Errors handler integration tests
 *
 * Copyright 2018 Raising the Floor - US
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
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
    jqUnit = fluid.require("node-jqunit", require, "jqUnit"),
    gpii = fluid.registerNamespace("gpii");


require("../src/main/app.js");
require("./testUtils.js");

fluid.registerNamespace("gpii.tests.userErrorsHandler.testDefs");

var invalidUser = "asdasd_";
var expectedDialogOptionsProperties = ["title", "subhead", "details", "errCode"];

gpii.tests.userErrorsHandler.assertErrorDialogOptions = function (dialogOptions) {
    fluid.each(expectedDialogOptionsProperties,
        function (property) {
            jqUnit.assertValue(
                "Error dialog should be shown with proper values - property is not a string: " + property,
                dialogOptions[property]
            );
        });
};

function clickCloseBtn() {
    jQuery(".flc-closeBtn").click();
}

gpii.tests.userErrorsHandler.testDefs = {
    name: "User errors handler integration tests",
    expect: 5,
    config: {
        configName: "gpii.tests.dev.config",
        configPath: "tests/configs"
    },
    gradeNames: ["gpii.test.common.testCaseHolder"],
    sequence: [{ // When an error is fired...
        func: "{that}.app.keyIn",
        args: invalidUser
    }, { // ... an error dialog should be shown with the proper values.
        event: "{that}.app.dialogManager.error.events.onDialogCreate",
        listener: "gpii.tests.userErrorsHandler.assertErrorDialogOptions",
        args: [
            "{arguments}.0"
        ]
    }, { // Wait for the error dialog to be shown.
        event: "{that gpii.app.errorDialog}.events.onDialogReady",
        listener: "gpii.test.executeJavaScript",
        args: [
            "{that}.app.dialogManager.error.dialog.dialog",
            gpii.test.toIIFEString(clickCloseBtn)
        ]
    }, { // ... results in the error dialog being hidden.
        event: "{that}.app.dialogManager.error.dialog.events.onDialogHidden",
        listener: "jqUnit.assertFalse",
        args: [
            "The error dialog is closed when its close button is clicked",
            "{that}.app.dialogManager.error.dialog.model.isShown"
        ]
    }]
};
