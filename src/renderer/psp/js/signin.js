/**
 * The about dialog
 *
 * Represents an about dialog, that can be closed by the user.
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


    /**
     * Represents the controller for the about dialog,
     * that gives information for the application version,
     * user listeners (keys) and some useful links.
     */
    fluid.defaults("gpii.psp.signin", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.heightObservable"],

        model: {
            messages:            {
                titleIntro:      "GPII Auto-personalization",
                subtitleIntro:   "Automatically set up any computer the way you want it.",

                title:           "Use your GPII Key to key-in",
                subtitle:        "Or key-in with your account below"
            },

            email: null,
            password: null, // TODO set when

            error: {
                title: "Wrong name or password",
                details: "Try again or use a key"
            }
        },

        selectors: {
            titleIntro:    ".flc-contentTitleIntro",
            subtitleIntro: ".flc-contentSubTitleIntro",

            title:         ".flc-contentTitle",
            subtitle:      ".flc-contentSubtitle",

        },

        events: {
            onButtonClicked: null
        },

        modelListeners: {
            // Any change means that the whole view should be re-rendered
            "": {
                funcName: "gpii.psp.signin.renderText",
                args: [
                    "{that}.dom",
                    "{that}.options.selectors",
                    "{that}.model.messages"
                ]
            }
        }
    });


    /**
     * TODO
     *
     * @param dom
     * @param messages
     */
    gpii.psp.signin.renderText = function (dom, selectors, messages) {
        fluid.each(selectors, function (value, key) {
            var el = dom.locate(key);
            if (el) {
                el.text(messages[key]);
            }
        });
    };


    /**
     * Construct user listeners text.
     *
     * @param description {String} The description with a placeholder by the name "items"
     * @param userListeners {String[]} The list of key in listeners for the user
     * @returns {String} The constructed string
     */
    gpii.psp.signin.getUserListenersText = function (description, userListeners) {
        return fluid.stringTemplate(description, { listeners: userListeners.join(", ") });
    };
})(fluid);
