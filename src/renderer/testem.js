"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

fluid.require("%gpii-testem");

fluid.registerNamespace("gpii.tests.app.testem");

fluid.require("%gpii-testem/tests/harness");

fluid.defaults("gpii.tests.app.testem", {
    gradeNames: ["gpii.testem.instrumentation"],
    testPages:  ["./psp/tests/html/PspSettingsPanelTests.html"],
    // coverageDir: "coverage",
    // reportsDir: "reports",
    // instrumentedSourceDir: "%gpii-app/instrumented",
    cwd:         __dirname, // required because we are working outside of our package root.
    sourceDirs: {
        src: "%gpii-app/src/renderer"
    },
    contentDirs: {
        // browserify:   "%gpii-app/browserify",
        node_modules: "%gpii-app/node_modules"
    },
    instrumentationOptions: {
        "excludes": [],
        "sources": ["./**/*.js"],
        "nonSources": [
            "./*.json",
            "./**/*.json",
            "./*.html",
            "./**/*.html",
            "./**/*Tests.js",
            "./**/*TestEnv.js",
            "./**/*TestsUtils.js",
            "./scripts/*.js",
            "./testData/**/*.js",
            "./tests/**",
            "./!(node_modules)/**/*.!(js)",
            "./!(node_modules)/*.!(js)",
            "./!(node_modules)/tests/**/*.js",
            "./!(node_modules)/**/tests/**/*.js",
            "./!(node_modules)/test/**/*.js",
            "./!(node_modules)/**/test/**/*.js",
            "./!(node_modules)/**/webTests/**/*.js",
            "./!(node_modules)/**/public/lib/**/*"
        ]
    },
    listeners: {
        "onTestemStart.logTestemOptions": {
            priority: "before:cleanup",
            funcName: "gpii.tests.testem.harness.outputOptions",
            args:     ["{that}"]
        }
    },
    // invokers: {
    //     "getTestemOptions": {
    //         funcName: "gpii.tests.app.testem.getTestemOptions",
    //         args:     ["{that}"]
    //     }
    // },
    testemOptions: {
        // tap_quiet_logs: true,
        // disable_watching: true,
        skip: "PhantomJS,Opera,Safari,Firefox,IE"
    }
});

module.exports = gpii.tests.app.testem().getTestemOptions();
