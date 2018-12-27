/**
 * A centered on the screen dialog
 *
 * Dialog that is showed always in the center of the screen
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

fluid.registerNamespace("gpii.app.dialog");

/**
 * A component representing a dialog which should be positioned in the center
 * of the screen.
 */
fluid.defaults("gpii.app.centeredDialog", {
    gradeNames: ["gpii.app.dialog"],

    invokers: {
        setPosition: {
            funcName: "gpii.app.centeredDialog.setBounds",
            args: [
                "{that}",
                "{that}.model.width",
                "{that}.model.height"
            ]
        },
        setBounds: {
            funcName: "gpii.app.centeredDialog.setBounds",
            args: [
                "{that}",
                "{arguments}.0", // width
                "{arguments}.1"  // height
            ]
        }
    }
});

/**
 * Sets the desired bounds (i.e. the coordinates and dimensions) of an
 * Electron `BrowserWindow` given its (possibly new) width and height
 * so that it is positioned centrally on the screen.
 * @param {Component} that - The `gpii.app.centeredDialog` instance.
 * @param {Number} width - The width of the `BrowserWindow`.
 * @param {Number} height - The height of the `BrowserWindow`.
 */
gpii.app.centeredDialog.setBounds = function (that, width, height) {
    width  = width || that.model.width;
    height = height || that.model.height;

    var position = gpii.browserWindow.computeCentralWindowPosition(width, height),
        bounds = gpii.browserWindow.computeWindowBounds(width, height, position.x, position.y);

    that.applier.change("width", bounds.width);
    that.applier.change("height", bounds.height);

    that.dialog.setBounds(bounds);
};
