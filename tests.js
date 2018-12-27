/*
 * GPII tests runner
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
/* eslint-env node */
"use strict";

var fluid = require("infusion");

var fs = require("graceful-fs");
var jqUnit = require("node-jqunit");

var gpii = fluid.registerNamespace("gpii");

/*
 * Load all the code that is to be tested. Using relative path
 * as this can either be the instrumented "app" or not.
 */
require("./src/main/app");


fluid.registerNamespace("gpii.tests.app");
// In case the "instrumented" source is loaded the `__coverage` variable will be present.
gpii.tests.app.isInstrumented = fluid.isValue(global.__coverage__);


// Code coverage harness, hooks into the jqUnit lifecycle and saves tests whenever the `onAllTestsDone` event is fired.
// Must be hooked in before requiring any actual tests.
jqUnit.onAllTestsDone.addListener(function () {
    if (gpii.tests.app.isInstrumented) {
        var filename = fluid.stringTemplate("coverage-tests-%timestamp.json", { timestamp: (new Date()).toISOString().replace(/:/g, "-") });
        var coverageFilePath = fluid.module.resolvePath("%gpii-app/coverage/" + filename);
        try {
            var coverageData = JSON.stringify(global.__coverage__, null, 2);
            fs.writeFileSync(coverageFilePath, coverageData);
            fluid.log("Saved ", coverageData.length, " bytes of coverage data to '", coverageFilePath, "'.");
        }
        catch (error) {
            fluid.log("Error saving coverage data:", error);
        }
    }
    else {
        fluid.log("No code coverage data to save.");
    }
});

// Run the electron app tests with code coverage if possible.
require("./tests/AppTests.js");
require("./tests/MessageBundlesTests.js");
require("./tests/MessageBundlesCompilerTests.js");
require("./tests/PreferencesGroupingTests.js");
require("./tests/PreferencesParsingTests.js");
require("./tests/IntegrationTests.js");
