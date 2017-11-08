/*!
Copyright 2017 Raising the Floor - International

Licensed under the New BSD license. You may not use this file except in
compliance with this License.
The research leading to these results has received funding from the European Union's
Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
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
        ipcRenderer.send("onPCPClose");
    };

    /**
     * Notifies the main electron process that the user must be keyed out.
     */
    gpii.pcp.clientChannel.keyOut = function () {
        ipcRenderer.send("onKeyOut");
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
        ipcRenderer.send("onSettingAltered", {
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
        ipcRenderer.send("onActivePreferenceSetAltered", {
            value: value
        });
    };

    /**
     * A function which should be called whenever the total height of the
     * PSP `BrowserWindow` changes.
     * @param height {Number} The new height of the PSP `BrowserWindow`.
     */
    gpii.pcp.clientChannel.changeContentHeight = function (height) {
        ipcRenderer.send("onContentHeightChanged", height);
    };

    /**
     * Initializes the `clientChannel` component by registering listeners
     * for various messages sent by the main process.
     * @param clientChannel {Component} The `clientChannel` component.
     */
    gpii.pcp.clientChannel.initialize = function (clientChannel) {
        ipcRenderer.on("onPreferencesUpdated", function (event, preferences) {
            clientChannel.events.onPreferencesUpdated.fire(preferences);
        });

        ipcRenderer.on("onSettingUpdated", function (event, settingData) {
            clientChannel.events.onSettingUpdated.fire(settingData.path, settingData.value);
        });

        ipcRenderer.on("onAccentColorChanged", function (event, accentColor) {
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
