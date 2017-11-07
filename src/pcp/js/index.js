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
        ipcRenderer = require("electron").ipcRenderer;
    fluid.registerNamespace("gpii.pcp");

    /**
     * Notifies the main electron process that the user must be keyed out.
     */
    gpii.pcp.keyOut = function () {
        ipcRenderer.send("keyOut");
    };

    gpii.pcp.initClientChannel = function (clientChannel) {
        ipcRenderer.on("keyIn", function (event, preferences) {
            clientChannel.events.onPreferencesUpdated.fire(preferences);
        });

        ipcRenderer.on("keyOut", function (event, preferences) {
            clientChannel.events.onPreferencesUpdated.fire(preferences);
        });
    };

    fluid.defaults("gpii.pcp.clientChannel", {
        gradeNames: ["fluid.component"],
        events: {
            onPreferencesUpdated: null
        },
        listeners: {
            onCreate: {
                funcName: "gpii.pcp.initClientChannel",
                args: ["{that}"]
            }
        },
        invokers: {
            keyOut: "gpii.pcp.keyOut()"
        }
    });

    fluid.defaults("gpii.pcp", {
        gradeNames: ["fluid.component"],
        components: {
            clientChannel: {
                type: "gpii.pcp.clientChannel",
                options: {
                    listeners: {
                        onPreferencesUpdated: {
                            funcName: "{mainWindow}.updatePreferences"
                        }
                    }
                }
            },

            mainWindow: {
                type: "gpii.pcp.mainWindow",
                container: "#flc-body",
                options: {
                    listeners: {
                        onKeyOutClicked: "{clientChannel}.keyOut"
                    }
                }
            }
        }
    });

    $(function () {
        gpii.pcp();
    });
})(fluid);
