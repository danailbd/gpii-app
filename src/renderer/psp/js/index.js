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



    $(function () {
        // gpii.psp();
        
        var e = gpii.psp.repeater(".flc-splash", {
            model: {
                elements: [1, 2, 3]
            },
            handlerType: "gpii.some",
            markup: "<span class=\"flc-some\">%body</span>",
            sub: "Hello",

            invokers: {
                getMarkup: {
                    funcName: "gpii.getMarkup",
                    args: ["{that}.options.markup", "{that}.options.sub", "{arguments}.0"]
                }
            }
        });
        console.log("Result:", e);
    });
})(fluid);
