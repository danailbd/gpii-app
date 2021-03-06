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
        }
    });

    grunt.loadNpmTasks("gpii-grunt-lint-all");
    grunt.loadNpmTasks("grunt-shell");

    grunt.registerTask("default", ["lint"]);
    grunt.registerTask("lint", "Perform all standard lint checks.", ["lint-all"]);
};
