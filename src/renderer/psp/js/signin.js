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
            messages: {
                signinHeader:         "Not keyed in",

                titleIntro:           "GPII Auto-personalization",
                subtitleIntro:        "Automatically set up any computer the way you want it.",

                title:                "Use your GPII Key to key-in",
                subtitle:             "Or key-in with your account below",

                emailTextInputLabel:  "Email",
                passwordInputLabel:   "Password",
                signinButton:         "Sign in",
                signupButton:         "Create an Account",
                forgotPasswordButton: "Forgot Password?"
            },

            email: null,
            password: null,

            error: {
                title: null,
                details: null
            }
        },

        selectors: {
            signinHeader:         ".flc-signinHeader",

            titleIntro:           ".flc-contentTitleIntro",
            subtitleIntro:        ".flc-contentSubTitleIntro",

            title:                ".flc-contentTitle",
            subtitle:             ".flc-contentSubtitle",

            emailTextInputLabel:  ".flc-emailTextInput-label",
            passwordInputLabel:   ".flc-passwordInput-label",

            emailTextInput:       ".flc-emailTextInput",
            passwordInput:        ".flc-passwordInput",

            signupButton:         ".flc-signupBtn",
            forgotPasswordButton: ".flc-forgotPasswordBtn",

            // shorten name to avoid text setting
            signinBtn:            ".flc-signinBtn",

            error:                ".flc-error",
            errorTitle:           ".flc-errorTitle",
            errorDetails:         ".flc-errorDetails"
        },

        events: {
            onSigninClicked: null,
            onSigninRequested: null
        },

        invokers: {
            updateError: {
                changePath: "error",
                value: "{arguments}.0"
            }
        },

        listeners: {
            onSigninClicked: {
                funcName: "{that}.events.onSigninRequested",
                args: [
                    {
                        expander: {
                            this: "{that}.dom.emailTextInput",
                            method: "val"
                        }
                    }, {
                        expander: {
                            this: "{that}.dom.passwordInput",
                            method: "val"
                        }
                    }
                ]
            },

            // XXX test
            onSigninRequested: [{
                this: "console",
                method: "log",
                args: ["Sign in requested: ", "{arguments}.0", "{arguments}.1"]
            }, {
                func: "{that}.updateError",
                args: [{
                    title: "Wrong name or password",
                    details: "Try again or use a key"
                }]
            }]
        },

        modelListeners: {
            // Any change means that the whole view should be re-rendered
            "messages": {
                funcName: "gpii.psp.signin.renderText",
                args: [
                    "{that}",
                    "{that}.options.selectors",
                    "{that}.model.messages"
                ]
            },
            "error": {
                funcName: "gpii.psp.signin.toggleError",
                args: [
                    "{that}",
                    "{change}.value"
                ]
            }
        },

        components: {
            singinBtn: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.signinBtn",
                options: {
                    attrs: {
                        "aria-label": "{signin}.model.messages.signinButton"
                    },
                    model: {
                        label: "{signin}.model.messages.signinButton"
                    },
                    invokers: {
                        "onClick": "{signin}.events.onSigninClicked.fire"
                    }
                }
            }
        }
    });

    gpii.psp.signin.toggleError = function (that, error) {
        var errorContainer = that.dom.locate("error").show();
        if (!error.title) {
            errorContainer.hide();
        } else {
            errorContainer.show();

            that.dom.locate("errorTitle").text(error.title);
            that.dom.locate("errorDetails").text(error.details);
        }
    };


    /**
     * Set text to dom items in case there is a message for
     * its viewComponent's selector.
     *
     * @param {Component} that - The `gpii.psp.signin` instance.
     * @param {Object} messages - The translated text
     */
    gpii.psp.signin.renderText = function (that, selectors, messages) {
        fluid.each(selectors, function (value, key) {
            var el = that.dom.locate(key);
            if (el && messages[key]) {
                el.text(messages[key]);
            }
        });
    };
})(fluid);
