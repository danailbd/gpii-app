/*
Copyright 2013-2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii"),
        shell = require("electron").shell;

    fluid.defaults("gpii.pcp.footer", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            keyOutBtn: ".flc-keyOutBtn",
            helpBtn: ".flc-helpBtn"
        },
        events: {
            onKeyOutClicked: null
        },
        components: {
            keyOutBtn: {
                type: "gpii.pcp.widgets.button",
                container: "{that}.dom.keyOutBtn",
                options: {
                    label: "{footer}.options.labels.keyOut",
                    invokers: {
                        "onClick": "{footer}.events.onKeyOutClicked.fire"
                    }
                }
            },
            helpBtn: {
                type: "gpii.pcp.widgets.button",
                container: "{that}.dom.helpBtn",
                options: {
                    label: "{footer}.options.labels.help",
                    invokers: {
                        "onClick": "gpii.pcp.openUrl({footer}.options.urls.help)"
                    }
                }
            }
        },
        urls: {
            help: "http://pmt.gpii.org/help"
        },
        labels: {
            keyOut: "Key Out",
            help: "Help"
        }
    });

    /**
     * Opens the passed url externally using the default browser for the
     * OS (or set by the user).
     * @param url {String} The url to open externally.
     */
    gpii.pcp.openUrl = function (url) {
        shell.openExternal(url);
    };
})(fluid);
