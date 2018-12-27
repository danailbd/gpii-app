/**
 * A dialog which is hidden when it loses focus.
 *
 * A dialog which is hidden whenever it or a window which is "linked" to it
 * loses focus. The performed action can be customized by the implementor.
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
    BrowserWindow = require("electron").BrowserWindow,
    gpii = fluid.registerNamespace("gpii");

/**
 * A dialog which is hidden whenever it or a window which is "linked" to it
 * loses focus AND the newly focused window is not "linked" to the current
 * window. Each dialog defines the other dialogs to which it is linked
 * by specifying at least one of their gradeNames in the `linkedWindowsGrades`
 * array. The "linked to" relation is always reflexive but may not be symmetric.
 * Note that the action performed when the window (or a linked one) loses focus
 * can be customized by the implementor.
 */
fluid.defaults("gpii.app.blurrable", {
    gradeNames: ["fluid.component"],

    linkedWindowsGrades: [],

    events: {
        // All blurrable dialogs share one and the same `onBlur` event so that
        // they can hide themselves even if they have already lost focus but
        // were not hidden because a linked window has gained it
        onBlur: "{app}.events.onBlur"
    },

    listeners: {
        "onCreate.initBlurrable": {
            funcName: "gpii.app.blurrable.initBlurrable",
            args: ["{that}"]
        },
        onBlur: {
            funcName: "gpii.app.blurrable.onBlur",
            args: ["{that}"]
        }
    },

    invokers: {
        // The action which should be performed when the window loses focus
        handleBlur: {
            funcName: "gpii.app.blurrable.handleBlur",
            args: ["{that}"]
        }
    }
});

/**
 * Initializes the component by registering a blur listener for the member
 * dialog.
 * @param {Component} that - The `gpii.app.blurrable` instance.
 */
gpii.app.blurrable.initBlurrable = function (that) {
    /**
     * Add the gradeNames of the current component to the dialog `BrowserWindow`.
     * This makes it possible to perform checks based on the grade names of the
     * component even if only the dialog can be accessed. Of course, we can always
     * discover the actual component to which a given dialog belongs but this may
     * require traversing the tree of components which may slow down the application.
     * For example usage, please see `gpii.app.blurrable.onBlur`.
     */
    that.dialog.gradeNames = that.options.gradeNames;

    that.dialog.on("blur", that.events.onBlur.fire);
};

/**
 * Called whenever this or another blurrable window loses focus.
 * @param {Component} that - The `gpii.app.blurrable` instance.
 */
gpii.app.blurrable.onBlur = function (that) {
    var linkedWindowsGrades = that.options.linkedWindowsGrades,
        focusedWindow = BrowserWindow.getFocusedWindow(),
        allowBlur = !linkedWindowsGrades.some(function (linkedWindowGrade) {
            if (focusedWindow && focusedWindow.gradeNames) {
                return focusedWindow.gradeNames.indexOf(linkedWindowGrade) >= 0;
            }
        });

    if (allowBlur) {
        that.handleBlur();
    }
};

/**
 * Defines the action which should be performed when the window loses
 * focus and the newly focused window is not linked to this one.
 * @param {Component} that - The `gpii.app.blurrable` instance.
 */
gpii.app.blurrable.handleBlur = function (that) {
    if (that.hide) {
        that.hide();
    }
};
