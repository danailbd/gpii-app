/*
Copyright 2013-2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

"use strict";
(function (fluid) {
    fluid.registerNamespace("gpii.pcp");

    fluid.defaults("gpii.pcp.splash", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            splash: ".flc-splash"
        },
        invokers: {
            show: {
                this: "{that}.dom.splash",
                method: "show"
            },
            hide: {
                this: "{that}.dom.splash",
                method: "hide"
            }
        }
    });
})(fluid);
