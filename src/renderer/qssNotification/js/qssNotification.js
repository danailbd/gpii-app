/**
 * The renderer portion of the QSS Notification dialog
 *
 * Creates the Quick Set Strip widget once the document has been loaded.
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

    fluid.defaults("gpii.psp.translatedQssNotification", {
        gradeNames: ["gpii.psp.messageBundles", "fluid.viewComponent"],

        components: {
            qssNotification: {
                type: "gpii.psp.qssNotification",
                container: "{translatedQssNotification}.container"
            }
        }
    });

    fluid.defaults("gpii.psp.qssNotification", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        model: {
            messages: {
                title: "Most applications will need to be re-started in order for the language setting to work in that application.",
                dismissButtonLabel: "OK"
            }
        },

        selectors: {
            title: ".flc-qssNotification-title",
            dismissButton: ".flc-qssNotification-dismissButton"
        },

        events: {},

        components: {
            channelListener: {
                type: "gpii.psp.channelListener",
                options: {
                    events: {
                        onQssNotificationShown: null
                    }
                }
            },
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onQssNotificationClosed: null
                    }
                }
            },
            dismissButton: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.dismissButton",
                options: {
                    model: {
                        label: "{qssNotification}.model.messages.dismissButtonLabel"
                    }
                }
            }
        }
    });
})(fluid);
