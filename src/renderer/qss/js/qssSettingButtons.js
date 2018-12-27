/**
 * QSS setting buttons
 *
 * Contains components representing QSS buttons which can be used by the user to update
 * his settings.
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
     * In the QSS there are two types of buttons - setting buttons (which this grade
     * describes) are used for altering the value of their corresponding buttons and
     * "system" buttons which have various supplementary functions such as saving the
     * user's preferences, undoing changes made via the QSS, closing the QSS, etc.
     */
    fluid.defaults("gpii.qss.settingButtonPresenter", {
        gradeNames: ["fluid.viewComponent", "gpii.qss.changeIndicator"],

        model: {
            item: {
                value: null
            },
            value: "{that}.model.item.value"
        },

        modelListeners: {
            value: {
                funcName: "gpii.qss.settingButtonPresenter.updateChangeIndicator",
                args: ["{that}", "{that}.model.item", "{change}.value"],
                namespace: "changeIndicator"
            }
        }
    });

    /**
     * Shows or hides the toggle indicator when the setting's value is changed depending
     * on whether the changes to the setting can be undone and whether the new value of
     * the setting is the same as its default one.
     * @param {Component} that - The `gpii.qss.settingButtonPresenter` instance.
     * @param {Object} setting - The setting object corresponding to this QSS button.
     * @param {Any} value - The new value of the `setting`.
     */
    gpii.qss.settingButtonPresenter.updateChangeIndicator = function (that, setting, value) {
        // The dot should be shown if the setting has a default value and the new value of the
        // setting is different from that value.
        var defaultValue = setting.schema["default"],
            shouldShow = fluid.isValue(defaultValue) && !fluid.model.diff(value, defaultValue);
        that.toggleIndicator(shouldShow);
    };

    /**
     * Inherits from `gpii.qss.buttonPresenter` and handles interactions with QSS buttons which
     * can have their values changed via the QSS widget.
     */
    fluid.defaults("gpii.qss.widgetButtonPresenter", {
        gradeNames: ["gpii.qss.buttonPresenter", "gpii.qss.settingButtonPresenter"],
        listeners: {
            "onArrowUpPressed.activate": {
                func: "{that}.onActivationKeyPressed",
                args: [
                    {key: "ArrowUp"}
                ]
            }
        }
    });

    /**
     * Inherits from `gpii.qss.buttonPresenter` and handles interactions with QSS toggle
     * buttons.
     */
    fluid.defaults("gpii.qss.toggleButtonPresenter", {
        gradeNames: ["gpii.qss.widgetButtonPresenter"],
        model: {
            messages: {
                caption: null
            },
            caption: null
        },
        modelRelay: {
            "caption": {
                target: "caption",
                singleTransform: {
                    type: "fluid.transforms.free",
                    func: "gpii.qss.toggleButtonPresenter.getCaption",
                    args: ["{that}.model.value", "{that}.model.messages"]
                }
            }
        },
        modelListeners: {
            caption: {
                this: "{that}.dom.caption",
                method: "text",
                args: ["{change}.value"]
            }
        }
    });

    /**
     * Returns the caption of the toggle button that needs to be shown below the button's
     * title in case the state of the button is "on".
     * @param {Boolean} value - The state of the button.
     * @param {Object} messages - An object containing internationalizable messages for
     * this component.
     * @return {String} The caption message for the toggle button.
     */
    gpii.qss.toggleButtonPresenter.getCaption = function (value, messages) {
        return value ? messages.caption : "";
    };
})(fluid);
