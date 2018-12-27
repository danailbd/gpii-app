/**
 * The renderer portion of the QSS Notification dialog
 *
 * Creates the Quick Set Strip widget once the document has been loaded.
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
     * Enables internationalization of the QSS notification.
     */
    fluid.defaults("gpii.psp.translatedQssNotification", {
        gradeNames: ["gpii.psp.messageBundles", "fluid.viewComponent"],

        components: {
            qssNotification: {
                type: "gpii.psp.qssNotification",
                container: "{translatedQssNotification}.container"
            }
        }
    });

    /**
     * A component representing the QSS notification. Takes care of initializing
     * the necessary DOM elements and handling user interaction.
     */
    fluid.defaults("gpii.psp.qssNotification", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer", "gpii.psp.heightObservable", "gpii.psp.linksInterceptor"],

        model: {
            messages: {
                title: null,
                dismissButtonLabel: null
            }
        },

        enableRichText: true,

        selectors: {
            titlebar: ".flc-titlebar",
            description: ".flc-qssNotification-description",
            dismissButton: ".flc-qssNotification-dismissButton",

            dialogContent: ".flc-dialog-content",
            heightListenerContainer: ".flc-dialog-contentText"
        },

        events: {
            onQssNotificationShown: null,
            onQssNotificationClosed: null
        },

        components: {
            channelListener: {
                type: "gpii.psp.channelListener",
                options: {
                    events: {
                        onQssNotificationShown: "{qssNotification}.events.onQssNotificationShown"
                    }
                }
            },
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onQssNotificationHeightChanged: "{qssNotification}.events.onHeightChanged",
                        onQssNotificationClosed: "{qssNotification}.events.onQssNotificationClosed"
                    }
                }
            },
            titlebar: {
                type: "gpii.psp.titlebar",
                container: "{that}.dom.titlebar",
                options: {
                    model: {
                        messages: {
                            title: "{qssNotification}.model.messages.title"
                        }
                    },
                    listeners: {
                        "onClose": "{qssNotification}.events.onQssNotificationClosed"
                    }
                }
            },
            dismissButton: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.dismissButton",
                options: {
                    model: {
                        label: "{qssNotification}.model.messages.dismissButtonLabel"
                    },
                    invokers: {
                        onClick: "{qssNotification}.events.onQssNotificationClosed.fire"
                    }
                }
            }
        },

        listeners: {
            onQssNotificationShown: {
                funcName: "gpii.app.applier.replace",
                args: [
                    "{that}.applier",
                    "messages",
                    "{arguments}.0"
                ]
            }
        },

        invokers: {
            calculateHeight: {
                funcName: "gpii.psp.qssNotification.calculateHeight",
                args: [
                    "{that}.container",
                    "{that}.dom.dialogContent",
                    "{that}.dom.heightListenerContainer"
                ]
            }
        }
    });

    /**
     * Calculates the total height of the QSS notification assuming that its whole content is fully
     * displayed and there is no need to scroll (i.e. if there were enough vertical space for the
     * whole document).
     * @param {jQuery} container - A jQuery object representing the notification's container.
     * @param {jQuery} dialogContent - A jQuery object representing the content of the dialog.
     * @param {jQuery} heightListenerContainer - A jQuery object representing the container which
     * houses the height listener element.
     * @return {Number} - The height of the QSS notification assuming it is fully displayed.
     */
    gpii.psp.qssNotification.calculateHeight = function (container, dialogContent, heightListenerContainer) {
        return container.outerHeight(true) - dialogContent.height() + heightListenerContainer.height();
    };
})(fluid);
