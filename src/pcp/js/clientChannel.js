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
    fluid.registerNamespace("gpii.pcp.clientChannel");

    /**
     * A function which should be called when the PCP window needs to be
     * closed. It simply notifies the main electron process for this.
     */
    gpii.pcp.clientChannel.closePCP = function () {
        ipcRenderer.send("closePCP");
    };

    /**
     * Notifies the main electron process that the user must be keyed out.
     */
    gpii.pcp.clientChannel.keyOut = function () {
        ipcRenderer.send("keyOut");
    };

    /**
     * A function which should be called whenever a settings is updated
     * as a result of a user's input. Its purpose is to notify the main
     * electron process for the change.
     * @param path {String} The path of the updated setting.
     * @param value {Any} The new, updated value for the setting. Can be
     * of different type depending on the setting.
     */
    gpii.pcp.clientChannel.alterSetting = function (path, value) {
        ipcRenderer.send("updateSetting", {
            path: path,
            value: value
        });
    };

    /**
     * A function which should be called when the active preference set
     * has been changed as a result of a user's input. It will notify
     * the main electron process for the change.
     * @param value {String} The path of the new active preference set.
     */
    gpii.pcp.clientChannel.alterActivePreferenceSet = function (value) {
        ipcRenderer.send("updateActivePreferenceSet", {
            value: value
        });
    };

    /**
     * A function which should be called whenever the total height of the
     * PSP `BrowserWindow` changes.
     * @param height {Number} The new height of the PSP `BrowserWindow`.
     */
    gpii.pcp.clientChannel.changeContentHeight = function (height) {
        ipcRenderer.send("contentHeightChanged", height);
    };

    /**
     * Initializes the `clientChannel` component by registering listeners
     * for various messages sent by the main process.
     * @param clientChannel {Component} The `clientChannel` component.
     */
    gpii.pcp.clientChannel.initialize = function (clientChannel) {
        ipcRenderer.on("keyIn", function (event, preferences) {
            clientChannel.events.onPreferencesUpdated.fire(preferences);
        });

        ipcRenderer.on("keyOut", function (event, preferences) {
            clientChannel.events.onPreferencesUpdated.fire(preferences);
        });

        ipcRenderer.on("updateSetting", function (event, settingData) {
            clientChannel.events.onSettingUpdated.fire(settingData.path, settingData.value);
        });

        ipcRenderer.on("accentColorChanged", function (event, accentColor) {
            clientChannel.events.onAccentColorChanged.fire(accentColor);
        });
    };

    /**
     * Responsible for communication between the main and the renderer
     * processes.
     */
    fluid.defaults("gpii.pcp.clientChannel", {
        gradeNames: ["fluid.component"],
        events: {
            onPreferencesUpdated: null,
            onSettingUpdated: null,
            onAccentColorChanged: null
        },
        listeners: {
            "onCreate.initClientChannel": {
                funcName: "gpii.pcp.clientChannel.initialize",
                args: ["{that}"]
            }
        },
        invokers: {
            close: {
                funcName: "gpii.pcp.clientChannel.closePCP"
            },
            keyOut: {
                funcName: "gpii.pcp.clientChannel.keyOut"
            },
            alterSetting: {
                funcName: "gpii.pcp.clientChannel.alterSetting"
            },
            alterActivePreferenceSet: {
                funcName: "gpii.pcp.clientChannel.alterActivePreferenceSet"
            },
            changeContentHeight: {
                funcName: "gpii.pcp.clientChannel.changeContentHeight"
            }
        }
    });
})(fluid);
