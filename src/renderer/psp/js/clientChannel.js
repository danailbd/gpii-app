/**
 * Client channel for IPC communication
 *
 * Defines a component responsible for the communication between the main and the
 * renderer processes.
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
    var gpii = fluid.registerNamespace("gpii"),
        ipcRenderer = require("electron").ipcRenderer;
    fluid.registerNamespace("gpii.psp.clientChannel");

    /**
     * A function which should be called whenever a settings is updated
     * as a result of a user's input. Its purpose is to notify the main
     * electron process for the change.
     * @param {Component} clientChannel - The `gpii.psp.clientChannel`
     * instance.
     * @param {Object} setting - The setting which has been updated.
     * @param {Any} oldValue - The old value of the setting.
     */
    gpii.psp.clientChannel.alterSetting = function (clientChannel, setting, oldValue) {
        setting = fluid.extend(true, {}, setting, {
            oldValue: oldValue
        });
        clientChannel.sendMessage("onSettingAltered", setting);
    };

    /**
     * Initializes the `clientChannel` component by registering listeners
     * for various messages sent by the main process.
     * @param {Component} clientChannel - The `clientChannel` component.
     */
    gpii.psp.clientChannel.initialize = function (clientChannel) {
        ipcRenderer.on("onIsKeyedInUpdated", function (event, isKeyedIn) {
            clientChannel.events.onIsKeyedInUpdated.fire(isKeyedIn);
        });

        ipcRenderer.on("onPreferencesUpdated", function (event, preferences) {
            clientChannel.events.onPreferencesUpdated.fire(preferences);
        });

        ipcRenderer.on("onSettingUpdated", function (event, settingData) {
            clientChannel.events.onSettingUpdated.fire(settingData.path, settingData.value);
        });

        ipcRenderer.on("onAccentColorChanged", function (event, accentColor) {
            clientChannel.events.onAccentColorChanged.fire(accentColor);
        });

        ipcRenderer.on("onThemeChanged", function (event, theme) {
            clientChannel.events.onThemeChanged.fire(theme);
        });

        ipcRenderer.on("onRestartRequired", function (event, pendingChanges) {
            clientChannel.events.onRestartRequired.fire(pendingChanges);
        });
    };

    /**
     * Responsible for communication between the main and the renderer
     * processes.
     */
    fluid.defaults("gpii.psp.clientChannel", {
        gradeNames: ["fluid.component"],
        events: {
            onIsKeyedInUpdated: null,
            onPreferencesUpdated: null,
            onSettingUpdated: null,
            onAccentColorChanged: null,
            onThemeChanged: null,
            onRestartRequired: null
        },
        listeners: {
            "onCreate.initClientChannel": {
                funcName: "gpii.psp.clientChannel.initialize",
                args: ["{that}"]
            }
        },
        invokers: {
            sendMessage: {
                funcName: "gpii.psp.channel.notifyChannel"
            },
            close: {
                func: "{that}.sendMessage",
                args: [
                    "onPSPClose",
                    "{arguments}.0" // params
                ]
            },
            keyOut: {
                func: "{that}.sendMessage",
                args: ["onKeyOut"]
            },
            alterSetting: {
                funcName: "gpii.psp.clientChannel.alterSetting",
                args: [
                    "{that}",
                    "{arguments}.0", // setting
                    "{arguments}.1"  // oldValue
                ]
            },
            alterActivePreferenceSet: {
                func: "{that}.sendMessage",
                args: [
                    "onActivePreferenceSetAltered",
                    "{arguments}.0" // message
                ]
            },
            changeContentHeight: {
                func: "{that}.sendMessage",
                args: [
                    "onContentHeightChanged",
                    "{arguments}.0" // message
                ]
            },
            restartNow: {
                func: "{that}.sendMessage",
                args: [
                    "onRestartNow",
                    "{arguments}.0" // pendingChanges
                ]
            },
            undoChanges: {
                func: "{that}.sendMessage",
                args: [
                    "onUndoChanges",
                    "{arguments}.0" // pendingChanges
                ]
            },
            requestSignIn: {
                func: "{that}.sendMessage",
                args: [
                    "onSignInRequested",
                    "{arguments}.0", // email
                    "{arguments}.1"  // password
                ]
            }
        }
    });
})(fluid);
