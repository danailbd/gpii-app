/**
 * Spinner BrowserWindow Dialog
 *
 * Introduces a component that uses an Electron BrowserWindow to represent a "please wait" spinner.
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

require("./basic/dialog.js");

/**
 * Component that contains an Electron Dialog.
 */
fluid.defaults("gpii.app.waitDialog", {
    gradeNames: ["gpii.app.dialog"],

    config: {
        attrs: {
            width: 600,
            height: 450
        },
        destroyOnClose: false,
        fileSuffixPath: "waitDialog/index.html"
    },
    model: {
        dialogMinDisplayTime: 2000, // minimum time to display dialog to user in ms
        dialogStartTime: 0, // timestamp recording when the dialog was displayed to know when we can dismiss it again
        timeout: 0
    },
    modelListeners: {
        isShown: {
            funcName: "gpii.app.waitDialog.toggle",
            args: ["{that}", "{change}.value"],
            namespace: "impl"
        }
    },
    listeners: {
        "onDestroy.clearTimers": "gpii.app.waitDialog.clearTimers({that})"
    }
});


gpii.app.waitDialog.clearTimers = function (that) {
    clearTimeout(that.dismissWaitTimeout);
    clearInterval(that.displayWaitInterval);
};

/**
 * Either shows or hides the wait dialog, depending on the `isShown` flag state
 *
 * @param {Component} that - The `gpii.app.waitDialog` instance
 * @param {Boolean} isShown - The state of the dialog
 */
gpii.app.waitDialog.toggle = function (that, isShown) {
    if (isShown) {
        gpii.app.waitDialog.show(that);
    } else {
        gpii.app.waitDialog.hide(that);
    }
};

/**
 * Shows the dialog on users screen with the message passed as parameter.
 * Records the time it was shown in `dialogStartTime` which we need when
 * dismissing it (checking whether it's been displayed for the minimum amount of time)
 *
 * @param {Component} that - the gpii.app instance
 */
gpii.app.waitDialog.show = function (that) {
    that.setPosition(0, 0);
    that.dialog.show();
    // Hack to ensure it stays on top, even as the GPII autoconfiguration starts applications, etc., that might
    // otherwise want to be on top
    // see amongst other: https://blogs.msdn.microsoft.com/oldnewthing/20110310-00/?p=11253/
    // and https://github.com/electron/electron/issues/2097
    if (that.displayWaitInterval) {
        clearInterval(that.displayWaitInterval);
        that.displayWaitInterval = 0;
    }
    that.displayWaitInterval = setInterval(function () {
        if (!that.dialog.isVisible()) {
            clearInterval(that.displayWaitInterval);
        };
        that.dialog.setAlwaysOnTop(true);
    }, 100);

    that.model.waitDialogStartTime = Date.now();
};

/**
 * Dismisses the dialog. If less than `that.dialogMinDisplayTime` ms have passed since we first displayed
 * the window, the function waits until `dialogMinDisplayTime` has passed before dismissing it.
 *
 * @param {Component} that - the gpii.app instance
 */
gpii.app.waitDialog.hide = function (that) {
    if (that.dismissWaitTimeout) {
        clearTimeout(that.dismissWaitTimeout);
        that.dismissWaitTimeout = null;
    }

    // ensure we have displayed for a minimum amount of `dialogMinDisplayTime` secs to avoid confusing flickering
    var remainingDisplayTime = (that.model.waitDialogStartTime + that.model.dialogMinDisplayTime) - Date.now();

    if (remainingDisplayTime > 0) {
        that.dismissWaitTimeout = setTimeout(function () {
            that.dialog.hide();
        }, remainingDisplayTime);
    } else {
        that.dialog.hide();
    }
};
