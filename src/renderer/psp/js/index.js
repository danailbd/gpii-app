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

        icon: "../../../../icons/gear-cloud-black.png",
        liveness: "manualRestart",
        memory: false,

        schema: {
            type: "string",
            "enum": ["a", "b", "c", "d"],
            title: "Setting one title",
            description: "Setting one description"
        }
    };



    $(function () {
        // gpii.psp();
        
        console.log("Here");
        var e = gpii.psp.settingsPanel("#flc-settingsList", {
            model: {
                settings: [
                    dropdownSettingFixture
                ]
            }
        });
        console.log("Result:", e);
    });
})(fluid);
