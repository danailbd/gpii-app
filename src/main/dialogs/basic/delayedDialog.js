/**
 * Show `a gpii.app.dialog` with delay
 *
 * An enhancement that adds a functionality for postponed displaying of a `BrowserWindow`
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

var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./resizable.js");

fluid.registerNamespace("gpii.app.dialog");

/**
 * A component which adds the ability for a dialog to be shown with a delay.
 */
fluid.defaults("gpii.app.delayedDialog", {
    gradeNames: ["gpii.app.timer"],

    // the desired delay in milliseconds
    showDelay: null,

    listeners: {
        onTimerFinished: {
            func: "{that}.show"
            // arguments are passed with the event
        }
    },

    invokers: {
        showWithDelay: {
            funcName: "gpii.app.delayedDialog.showWithDelay",
            args: [
                "{that}",
                "{that}.options.showDelay",
                "{arguments}" // showArgs
            ]
        },
        hide: {
            funcName: "gpii.app.delayedDialog.hide",
            args: ["{that}"]
        }
    }
});

/**
 * Schedules the dialog to be shown in `delay` milliseconds.
 * @param {Component} that - The `gpii.app.delayedDialog` instance.
 * @param {Number} [delay] - The delay in milliseconds.
 * @param {Any[]} [showArgs] - An array of arguments which will be
 * provided to the `show` invoker when the `delay` is up.
 */
gpii.app.delayedDialog.showWithDelay = function (that, delay, showArgs) {
    // process raw arguments
    showArgs = fluid.values(showArgs);
    that.start(delay, showArgs);
};

/**
 * If the dialog is scheduled to be shown but has not been shown yet,
 * this function will discard the showing. Otherwise, if the dialog is
 * already visible on screen, it will be hidden.
 * @param {Component} that - The `gpii.app.delayedDialog` instance.
 */
gpii.app.delayedDialog.hide = function (that) {
    that.clear();

    that.applier.change("isShown", false);
};
