/**
 * Manager for gpii-app shortcuts
 *
 * A component that handles keyboard shortcut registration either for specific windows or globally.
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
var gpii  = fluid.registerNamespace("gpii");
var globalShortcut = require("electron").globalShortcut;
var localshortcut = require("electron-localshortcut");

/**
 * A component responsible for registering global and local (i.e. related to a
 * particular `BrowserWindow`) shortcuts. Takes care of deregistering the
 * global shortcuts when the component is destroyed. Whenever a keyboard shortcut
 * is activated, the corresponding component's event will be fired.
 */
fluid.defaults("gpii.app.shortcutsManager", {
    gradeNames: ["fluid.modelComponent"],

    events: {},

    listeners: {
        "onDestroy.clearShortcuts": {
            funcName: "gpii.app.shortcutsManager.clearShortcuts"
        }
    },

    invokers: {
        registerGlobalShortcut: {
            funcName: "gpii.app.shortcutsManager.registerGlobalShortcut",
            args: [
                "{that}",
                "{arguments}.0", // command
                "{arguments}.1"  // eventName
            ]
        },
        deregisterGlobalShortcut: {
            funcName: "gpii.app.shortcutsManager.deregisterGlobalShortcut",
            args: [
                "{that}",
                "{arguments}.0" // command
            ]
        },
        isGlobalShortcutRegistered: {
            funcName: "gpii.app.shortcutsManager.isGlobalShortcutRegistered",
            args: [
                "{arguments}.0" // command
            ]
        },
        registerLocalShortcut: {
            funcName: "gpii.app.shortcutsManager.registerLocalShortcut",
            args: [
                "{that}",
                "{arguments}.0", // command
                "{arguments}.1", // eventName
                "{arguments}.2"  // targetWindows
            ]
        },
        deregisterLocalShortcut: {
            funcName: "gpii.app.shortcutsManager.deregisterLocalShortcut",
            args: [
                "{arguments}.0", // command
                "{arguments}.1"  // targetWindows
            ]
        }
    }
});

/**
 * Ensure global shortcuts are cleared after app destruction.
 */
gpii.app.shortcutsManager.clearShortcuts = function () {
    globalShortcut.unregisterAll();
};

/**
 * Registers a global shortcut, i.e. a shortcut which is triggered if the app
 * is running but not necessarily focused.
 * @param {Component} that - The `gpii.app.shortcutsManager` instance.
 * @param {String} command - The global shortcut string. For further information,
 * see https://electronjs.org/docs/api/accelerator.
 * @param {String} eventName - The name of the event which should be triggered when
 * the shortcut is activated.
 */
gpii.app.shortcutsManager.registerGlobalShortcut = function (that, command, eventName) {
    var shortcutEvent = that.events[eventName];
    if (!shortcutEvent) {
        fluid.fail("ShortcutsManager: Missing shortcut event - ", eventName);
    }

    if (globalShortcut.isRegistered(command)) {
        // Check whether a shortcut is registered.
        fluid.fail("ShortcutsManager: Global shortcut already exists - ", command);
    }

    globalShortcut.register(command, shortcutEvent.fire);
};

/**
 * Checks whether a given accelerator is registered as a global shortcut.
 * @param {String} command - The global shortcut string.
 * @return {Boolean} `true` if the given shortcut string is registered as a global
 * shortcut and `false` otherwise.
 */
gpii.app.shortcutsManager.isGlobalShortcutRegistered = function (command) {
    return globalShortcut.isRegistered(command);
};

/**
 * Deregisters a global shortcut.
 * @param {Component} that - The `gpii.app.shortcutsManager` instance.
 * @param {String} command - The global shortcut string.
 */
gpii.app.shortcutsManager.deregisterGlobalShortcut = function (that, command) {
    if (that.isGlobalShortcutRegistered(command)) {
        globalShortcut.unregister(command);
    } else {
        fluid.fail("ShortcutsManager: Cannot unregister an unexisting global shortcut - ", command);
    }
};

/**
 * Registers a local shortcut, i.e. a shortcut which is triggered only if the
 * given `BrowserWindow` is visible and has focus.
 * @param {Component} that - The `gpii.app.shortcutsManager` instance.
 * @param {String} command - The local shortcut string. It has the same format
 * as the global shortcut string.
 * @param {String} eventName - The name of the event which should be triggered when
 * the shortcut is activated.
 * @param {BrowserWindow[]} targetWindows - An array of windows for which the
 * shortcut has to be registered.
 */
gpii.app.shortcutsManager.registerLocalShortcut = function (that, command, eventName, targetWindows) {
    var shortcutEvent = that.events[eventName];
    var windows = targetWindows;

    if (!shortcutEvent) {
        fluid.fail("ShortcutsManager: Missing shortcut event - ", eventName);
    }
    if (!windows) {
        fluid.fail("ShortcutsManager: Local shortcuts require windows to be attached to - ", eventName);
    }

    windows = Array.isArray(windows) ? windows : [windows];

    fluid.each(windows, function (winGrade) {
        var winCmp = fluid.queryIoCSelector(fluid.rootComponent, winGrade)[0];

        if (!winCmp || !winCmp.dialog) {
            fluid.fail("ShortcutsManager: Target window either missing or not of `gpii.app.dialog` grade - ", winGrade);
        }
        localshortcut.register(winCmp.dialog, command, shortcutEvent.fire);
    });
};

/**
 * Deregisters a local shortcut.
 * @param {String} command - The local shortcut string.
 * @param {BrowserWindow[]} targetWindows - An array of windows for which the
 * shortcut has to be deregistered.
 */
gpii.app.shortcutsManager.deregisterLocalShortcut = function (command, targetWindows) {
    var windows = targetWindows;
    windows = Array.isArray(windows) ? windows : [windows];

    fluid.each(windows, function (winGrade) {
        var winCmp = fluid.queryIoCSelector(fluid.rootComponent, winGrade)[0];

        if (!winCmp || !winCmp.dialog) {
            fluid.fail("ShortcutsManager: Target window either missing or not of `gpii.app.dialog` grade - ", winGrade);
        }

        localshortcut.unregister(winCmp.dialog, command);
    });
};
