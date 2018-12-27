/**
 * About page BrowserWindow Dialog
 *
 * Introduces a component that uses an Electron BrowserWindow to represent an "About" dialog.
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

require("./basic/dialog.js");

var gpii = fluid.registerNamespace("gpii");

/**
 * Component that represents the About dialog
 */
fluid.defaults("gpii.app.aboutDialog", {
    gradeNames: ["gpii.app.dialog"],

    siteConfig: {
        urls: {
            morphicHome: "https://morphic.world",
            submitSuggestions: "mailto:suggestions@morphic.world"
        }
    },

    config: {
        attrs: {
            width: 400,
            height: 250
        },
        params: {
            userListeners: ["USB", "NFC", "Fingerprint", "Webcam & Voice"],
            version: "@expand:gpii.app.getVersion()",
            urls: "{that}.options.siteConfig.urls"
        },
        fileSuffixPath: "aboutDialog/index.html"
    },

    components: {
        channelListener: {
            type: "gpii.app.channelListener",
            options: {
                events: {
                    onAboutDialogClosed: null
                },
                listeners: {
                    onAboutDialogClosed: {
                        func: "{aboutDialog}.hide"
                    }
                }
            }
        },
        // notify for i18n events
        channelNotifier: {
            type: "gpii.app.channelNotifier"
        }
    }
});


/**
 * Simple method for retrieving the gpii-app version. Currently it
 * uses the Electron's api that makes use of the version in the `package.json`.
 * @return {String} The version of the gpii-app
 */
gpii.app.getVersion = function () {
    return require("electron").app.getVersion();
};
