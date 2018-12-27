/**
 * Site configuration handler tests
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

fluid.registerNamespace("gpii.tests.siteConfigurationHandler");

gpii.tests.siteConfigurationHandler.testDefs = {
    name: "Site configuration handler options distributions integration tests",
    expect: 2,
    config: {
        configName: "gpii.tests.dev.config",
        configPath: "tests/configs"
    },
    distributeOptions: {
        useSiteConfigFixture: {
            record: "%gpii-app/tests/fixtures/siteconfigHandler.json5",
            target: "{that siteConfigurationHandler}.options.siteConfigPath"
        }
    },
    gradeNames: ["gpii.test.common.testCaseHolder"],
    // Check correct options distributions
    sequence: [{ // once everything is created, check for options distribution
        funcName: "jqUnit.assertDeepEq",
        args: [
            "QSS disable save button setting should be distributed",
            ["save"],
            "{that}.app.qssWrapper.options.settingOptions.hiddenSettings"
        ]
    }, { // once everything is created, check for options distribution
        funcName: "jqUnit.assertDeepEq",
        args: [
            "QSS site config has been distributed",
            {
                scaleFactor: 0.5,
                urls: {
                    account: "http://morphic.world/account"
                }
            },
            "{that}.app.qssWrapper.options.siteConfig"
        ]
    }]
};
