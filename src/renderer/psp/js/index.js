/**
 * Initializes the renderer view
 *
 * Creates the PSP component once the document has been loaded.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.some", {
        gradeNames: "fluid.viewComponent",

        selectors: {
            a: ".flc-some"
        },

        listeners: {
            onCreate: {
                this: "{that}.dom.a",
                method: "text",
                args: ["{that}.model.item"]
            }
        }
    });

    var dropdownSettingFixture = {
        path: "settingOnePath",
        value: "b",
        solutionName: "solutions1",

        icon: "../../icons/gear-cloud-black.png",
        liveness: "manualRestart",
        memory: false,

        schema: {
            type: "string",
            "enum": ["a", "b", "c", "d"],
            title: "Setting one title",
            description: "Setting one description"
        }
    };

    var textfieldSettingFixture = {
        path: "textfieldPath",
        value: "Someee",

        icon: "../../icons/gear-cloud-white.png",
        liveness: "live",

        schema: {
            type: "text",
            title: "Text input",
            description: "Text input description"
        }
    };

    var switchSettingFixture = {
        path: "invertColorsPath",
        value: true,

        icon: "../../icons/gear-cloud-black.png",
        liveness: "liveRestart",
        memory: true,

        schema: {
            type: "boolean",
            title: "Invert colors",
            description: "Invert colors description"
        }
    };

    var stepperSettingFixture = {
        path: "zoomPath",
        value: 1,

        icon: "../../icons/gear-cloud-black.png",
        liveness: "OSRestart",

        schema: {
            type: "number",
            title: "Zoom",
            description: "Zoom description",
            min: 0.5,
            max: 4,
            divisibleBy: 0.1
        }
    };

    var multipickerSettingFixture = {
        path: "ttsTrackingPath",
        value: ["mouse", "focus"],

        icon: "../../icons/gear-cloud-white.png",
        liveness: "manualRestart",

        schema: {
            type: "array",
            title: "TTS tracking mode",
            description: "TTS tracking mode description",
            "enum":  ["mouse", "caret", "focus"]
        }
    };

    var allSettingTypesFixture = [dropdownSettingFixture, {
        path: "settingTwoPath",
        value: "c",
        solutionName: "solutions2",

        icon: "../../icons/gear-cloud-black.png",

        schema: {
            type: "string",
            "enum": ["b", "c", "d", "e"],
            title: "Setting two title",
            description: "Setting two description"
        }
    }, textfieldSettingFixture, switchSettingFixture, stepperSettingFixture, multipickerSettingFixture];




    $(function () {
        // gpii.psp();

        console.log("Here");
        var e = gpii.psp.settingsPanel("#flc-settingsList", {
            model: {
                settingGroups: [{
                    label: "g1",
                    settings: [
                        multipickerSettingFixture, stepperSettingFixture
                    ]
                }]
            }
        });

        console.log("Result:", e);
    });
})(fluid);
