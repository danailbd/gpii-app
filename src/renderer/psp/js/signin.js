/**
 * The sign in page
 *
 * Represents the sign in page with a form for keying in, error handling mechanism and
 * useful links.
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
     * A component responsible for managing the sign in page. It provides
     * means for sending key in requests and error handling. It is also
     * internationalizable.
     */
    fluid.defaults("gpii.psp.signIn", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.heightObservable"],

        model: {
            messages: {
                signInHeader: null,

                titleIntro: null,
                subtitleIntro: null,

                title: null,
                subtitle: null,

                emailTextInputLabel: null,
                passwordInputLabel: null,
                signInButton: null,
                signUpButton: null,
                forgotPasswordButton: null
            },

            email: null,
            password: null,

            error: {
                title: null,
                details: null
            }
        },

        selectors: {
            signInHeader:         ".flc-signInHeader",

            titleIntro:           ".flc-contentTitleIntro",
            subtitleIntro:        ".flc-contentSubTitleIntro",

            title:                ".flc-contentTitle",
            subtitle:             ".flc-contentSubtitle",

            emailTextInputLabel:  ".flc-emailTextInput-label",
            passwordInputLabel:   ".flc-passwordInput-label",

            emailTextInput:       ".flc-emailTextInput",
            passwordInput:        ".flc-passwordInput",

            signUpButton:         ".flc-signUpBtn",
            forgotPasswordButton: ".flc-forgotPasswordBtn",

            signInBtn:            ".flc-signInBtn",

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

            // For testing purposes only.
            onSigninRequested: {
                func: "{that}.updateError",
                args: [{
                    title: "Wrong name or password",
                    details: "Try again or use a key"
                }]
            }
        },

        modelListeners: {
            // Any change means that the whole view should be re-rendered
            "messages": {
                funcName: "gpii.psp.signIn.renderText",
                args: [
                    "{that}",
                    "{that}.options.selectors",
                    "{that}.model.messages"
                ]
            },
            "error": {
                funcName: "gpii.psp.signIn.toggleError",
                args: [
                    "{that}",
                    "{change}.value"
                ]
            }
        },

        components: {
            signInBtn: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.signInBtn",
                options: {
                    attrs: {
                        "aria-label": "{signIn}.model.messages.signInButton"
                    },
                    model: {
                        label: "{signIn}.model.messages.signInButton"
                    },
                    invokers: {
                        "onClick": "{signIn}.events.onSigninClicked.fire"
                    }
                }
            }
        }
    });

    /**
     * Shows or hides the error container and sets the corresponding
     * messages depending on whether an error has occurred.
     *
     * @param {Component} that - The `gpii.psp.signIn` instance.
     * @param {Object} error - An object descibing the error that has
     * occurred if any.
     */
    gpii.psp.signIn.toggleError = function (that, error) {
        var errorContainer = that.dom.locate("error");
        if (error.title) {
            errorContainer.show();

            that.dom.locate("errorTitle").text(error.title);
            that.dom.locate("errorDetails").text(error.details);
        } else {
            errorContainer.hide();
        }
    };


    /**
     * Sets text to dom items in case there is a message for
     * its viewComponent's selector.
     *
     * @param {Component} that - The `gpii.psp.signIn` instance.
     * @param {Object} messages - The translated text
     */
    gpii.psp.signIn.renderText = function (that, selectors, messages) {
        fluid.each(selectors, function (value, key) {
            var element = that.dom.locate(key);
            if (element && messages[key]) {
                element.text(messages[key]);
            }
        });
    };
})(fluid);
