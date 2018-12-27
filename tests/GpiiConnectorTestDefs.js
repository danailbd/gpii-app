/*
 * GPII Connector Test Definitions
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
    gpii = fluid.registerNamespace("gpii");

require("../src/main/app.js");

fluid.registerNamespace("gpii.tests.gpiiConnector.testDefs");

var DPIScalePath = "http://registry\\.gpii\\.net/common/DPIScale";

gpii.tests.gpiiConnector.getSettingUpdateMessage = function (path, value) {
    return {
        "payload": {
            type: "ADD",
            path: ["settingControls", path, "value"],
            value: value
        }
    };
};

gpii.tests.gpiiConnector.testDefs = {
    name: "GPII connector integration tests",
    expect: 1,
    config: {
        configName: "gpii.tests.dev.config",
        configPath: "tests/configs"
    },
    gradeNames: ["gpii.test.common.testCaseHolder"],
    sequence: [{
        func: "{that}.app.keyIn",
        args: "snapset_1a"
    }, { // Wait for the key in process to complete
        event: "{that}.app.events.onKeyedIn",
        listener: "fluid.identity"
    }, {
        func: "{that}.app.gpiiConnector.events.onMessageReceived.fire",
        args: [
            gpii.tests.gpiiConnector.getSettingUpdateMessage(DPIScalePath, 2)
        ]
    }, {
        event: "{that}.app.psp.events.onSettingUpdated",
        listener: "jqUnit.assertDeepEq",
        args: [
            "The setting which was updated in the PSP is correct",
            {
                path: DPIScalePath,
                value: 2
            },
            "{arguments}.0"
        ]
    }, {
        func: "{that}.app.keyOut"
    }, {
        event: "{that}.app.events.onKeyedOut",
        listener: "fluid.identity"
    }]
};
