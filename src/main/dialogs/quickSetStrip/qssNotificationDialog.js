/**
 * The Quick Set Strip notification dialog
 *
 * Introduces a component that uses an Electron BrowserWindow to represent the QSS
 * notification dialog.
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

var gpii = fluid.registerNamespace("gpii");

require("../basic/blurrable.js");
require("../basic/centeredDialog.js");

/**
 * A centered blurrable dialog which represents the QSS notification.
 * Used to signal setting changes that require a restart (e.g. Language
 * changes) or the status of the "Save" operation.
 */
fluid.defaults("gpii.app.qssNotification", {
    gradeNames: ["gpii.app.centeredDialog", "gpii.app.blurrable"],

    config: {
        attrs: {
            width: 225,
            height: 140,
            alwaysOnTop: true,
            transparent: false
        },
        fileSuffixPath: "qssNotification/index.html"
    },

    linkedWindowsGrades: ["gpii.app.qssNotification"],

    events: {
        onQssNotificationShown: null
    },

    components: {
        channelNotifier: {
            type: "gpii.app.channelNotifier",
            options: {
                events: {
                    onQssNotificationShown: "{qssNotification}.events.onQssNotificationShown"
                }
            }
        },
        channelListener: {
            type: "gpii.app.channelListener",
            options: {
                events: {
                    onQssNotificationClosed: null,
                    onQssNotificationHeightChanged: "{qssNotification}.events.onContentHeightChanged"
                },
                listeners: {
                    onQssNotificationClosed: {
                        funcName: "gpii.app.qssNotification.close",
                        args: ["{qssNotification}"]
                    }
                }
            }
        }
    },

    invokers: {
        show: {
            funcName: "gpii.app.qssNotification.show",
            args: [
                "{that}",
                "{arguments}.0" // notificationParams
            ]
        },
        handleBlur: {
            funcName: "gpii.app.qssNotification.handleBlur",
            args: ["{that}"]
        }
    }
});

/**
 * Hides the notification window and if specified, focuses a different
 * dialog.
 * @param {Component} qssNotification - The `gpii.app.qssNotification`
 * instance.
 */
gpii.app.qssNotification.close = function (qssNotification) {
    qssNotification.hide();

    var windowToFocus = qssNotification.focusOnClose;
    if (windowToFocus) {
        windowToFocus.focus();
    }
};

/**
 * Shows the QSS notification window and sends an IPC message with
 * details about what should be displayed in the notification.
 * @param {Component} that - The `gpii.app.qssNotification` instance.
 * @param {Object} notificationParams - The parameters for the notification
 * which is to be shown.
 */
gpii.app.qssNotification.show = function (that, notificationParams) {
    that.channelNotifier.events.onQssNotificationShown.fire(notificationParams);

    that.focusOnClose = notificationParams.focusOnClose;
    that.applier.change("closeOnBlur", notificationParams.closeOnBlur);

    that.applier.change("isShown", true);
};

/**
 * Handles the blur event for the QSS notification. The latter will be closed depending
 * on the value of the `closeOnBlur` model property.
 * @param {Component} that - The `gpii.app.qssNotification` instance.
 */
gpii.app.qssNotification.handleBlur = function (that) {
    if (that.model.closeOnBlur) {
        that.hide();
    }
};
