/**
 * A QSS widget button
 *
 * A button representing a possible setting value in the QSS menu or the increment
 * and decrement button in the QSS stepper widget.
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

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    /**
     * An `activatable` instance of `gpii.psp.widgets.button` used in the
     * QSS widget.
     */
    fluid.defaults("gpii.qssWidget.button", {
        gradeNames: ["gpii.psp.widgets.button", "gpii.app.activatable"],
        listeners: {
            "onCreate.addClickHandler": {
                funcName: "gpii.qssWidget.button.addClickHandler",
                args: ["{that}", "{focusManager}", "{that}.container"]
            }
        }
    });

    /**
     * Adds a click handler which activates the button when it is pressed and
     * adjusts the focus appropriately.
     * @param {Component} that - The `gpii.qssWidget.button` instance.
     * @param {Component} focusManager - The `gpii.qss.focusManager` instance
     * for the QSS widget.
     * @param {jQuery} container - The jQuery object representing the container
     * for the QSS widget button.
     */
    gpii.qssWidget.button.addClickHandler = function (that, focusManager, container) {
        container.on("click", function () {
            focusManager.focusElement(container, false);
            that.activate();
        });
    };
})(fluid);
