/*
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

module.exports = function (grunt) {
    grunt.initConfig({
        lintAll: {
            sources: {
                md: [ "./*.md","./documentation/*.md", "./examples/**/*.md"],
                js: ["src/**/*.js", "tests/**/*.js", "examples/**/*.js", "*.js"],
                json: ["src/**/*.json", "tests/**/*.json", "testData/**/*.json", "configs/**/*.json", "*.json", "!tests/fixtures/survey/malformed_triggers.json"],
                json5: ["src/**/*.json5", "tests/**/*.json5", "testData/**/*.json5", "*.json5"],
                other: ["./.*"]
            }
        },
        shell: {
            options: {
                stdout: true,
                srderr: true,
                failOnError: true
            }
        },
        compileMessages: {
            defaults: {
                messagesDirs: [
                    "./messageBundles",
                    "%gpii-user-errors/bundles"
                ],
                messageCompilerPath: "./messageBundlesCompiler.js",
                resultFilePath: "./build/gpii-app-messageBundles.json"
            }
        }
    });

    grunt.loadNpmTasks("gpii-grunt-lint-all");
    grunt.loadNpmTasks("grunt-shell");

    grunt.registerTask("default", ["lint"]);
    grunt.registerTask("lint", "Perform all standard lint checks.", ["lint-all"]);


    /*
     * Generate "Mega" messages bundle out of all supplied message bundles. Bundles
     * are loaded from given directories.
     */
    grunt.registerMultiTask("compileMessages", "Generate i18n messages 'Mega' bundle", function () {
        // Get all possible paths
        require("gpii-universal");

        var compileMessageBundles = require(this.data.messageCompilerPath).compileMessageBundles;
        var compiledMessageBundles = compileMessageBundles(this.data.messagesDirs, "en", {"json": JSON, "json5": require("json5")});

        grunt.file.write(this.data.resultFilePath, JSON.stringify(compiledMessageBundles, null, 4));
    });
};
