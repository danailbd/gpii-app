/**
 * About page BrowserWindow Dialog
 *
 * Introduces a component that uses an Electron BrowserWindow to represent an "About" dialog.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion");
var gpii              = fluid.registerNamespace("gpii");

var app = require("electron").app;

require("./dialog.js");

/**
 * Simple connector for the About BrowserWindow
 */
fluid.defaults("gpii.app.aboutDialog.channel", {
    gradeNames: ["gpii.app.dialog.simpleEventChannel", "gpii.app.i18n.channel"],

    events: {
        onAboutDialogClosed: null
    }
});

/**
 * Component that represents the About dialog
 */
fluid.defaults("gpii.app.aboutDialog", {
    gradeNames: ["gpii.app.dialog"],

    config: {
        attrs: {
            width: 1080,
            height: 680
        },
        params: {
            userListeners: ["USB", "NFC", "Fingerprint", "Webcam & Voice"],
            version: { expander: { func: app.getVersion } }
        },
        fileSuffixPath: "aboutDialog/index.html"
    },

    components: {
        channel: {
            type: "gpii.app.aboutDialog.channel",
            options: {
                listeners: {
                    onAboutDialogClosed: {
                        func: "{aboutDialog}.hide"
                    }
                }
            }
        }
    },

    listeners: {
        // onCreate: {
        //     this: "{that}.dialog",
        //     method: "openDevTools"
        // }
        onCreate: {
            funcName: "gpii.app.aboutDialog.initListeners",
            args: ["{that}"]
        }
    }
});

gpii.app.aboutDialog.initListeners = function (that) {
    that.dialog.on("blur", function () {
        console.log("blur detected...");
    }); 
};
