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
     * Registers callbacks to be invoked whenever the main electron
     * process sends a corresponding message.
     * @param that {Component} An instance of mainWindow.
     */
    gpii.pcp.addCommunicationChannel = function (that) {
        ipcRenderer.on("keyIn", function (event, preferences) {
            that.updatePreferences(preferences);
        });

        ipcRenderer.on("updateSetting", function (event, settingData) {
            that.updateSetting(settingData.path, settingData.value);
        });

        ipcRenderer.on("keyOut", function (event, preferences) {
            that.updatePreferences(preferences);
        });

        ipcRenderer.on("accentColorChanged", function (event, accentColor) {
            var mainColor = "#" + accentColor.slice(0, 6),
                theme = ":root{ --main-color: " + mainColor + "; }";
            that.updateTheme(theme);
        });
    };

    /**
     * A function which should be called whenever a settings is updated
     * as a result of a user's input. Its purpose is to notify the main
     * electron process for the change.
     * @param path {String} The path of the updated setting.
     * @param value {Any} The new, updated value for the setting. Can be
     * of different type depending on the setting.
     */
    gpii.pcp.notifySettingUpdate = function (path, value) {
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
    gpii.pcp.updateActivePreferenceSet = function (value) {
        ipcRenderer.send("updateActivePreferenceSet", {
            value: value
        });
    };

    /**
     * Notifies the main electron process that the user must be keyed out.
     */
    gpii.pcp.keyOut = function () {
        ipcRenderer.send("keyOut");
    };

    /**
     * A function which should be called when the PCP window needs to be
     * closed. It simply notifies the main electron process for this.
     */
    gpii.pcp.closeSettingsWindow = function () {
        ipcRenderer.send("closePCP");
    };

    /**
     * A function which should be called whenever the total height of the document
     * assuming that the settings panel is displayed fully, without the need for it
     * to scroll (i.e. if there is enough vertical space for the whole document),
     * changes.
     * @param mainWindow {jQuery} A jQuery object representing the mainWindow.
     * @param content {jQuery} A jQuery object representing the content of the
     * document between the header and footer. This container is scrollable.
     * @param settingsList {jQuery} A jQuery object representing the container in
     * which the various widgets will have their containers inserted.
     */
    gpii.pcp.onContentHeightChanged = function (mainWindow, content, settingsList) {
        var height = mainWindow.outerHeight(true) - content.height() + settingsList.height();
        ipcRenderer.send("contentHeightChanged", height);
    };

    /**
     * Shows or hides the splash window according to the current
     * preference sets. The splash window should only be hidden when
     * there are no preference sets passed (the user is keyed out).
     *
     * @param splash {Object} The splash component
     * @param sets {Object[]} The current preference sets
     */
    gpii.pcp.splash.toggleSplashWindow = function (splash, sets) {
        if (sets && sets.length > 0) {
            splash.hide();
        } else {
            splash.show();
        }
    };

    /**
     * Responsible for detecting height changes in the element in which
     * the component's container is nested.
     */
    fluid.defaults("gpii.pcp.heightChangeListener", {
        gradeNames: ["fluid.viewComponent"],
        listeners: {
            "onCreate.initResizeListener": {
                "this": "@expand:$({that}.container.0.contentWindow)",
                method: "on",
                args: ["resize", "{that}.onHeightChanged"]
            }
        },
        invokers: {
            onHeightChanged: fluid.notImplemented
        }
    });

    /**
     * Responsible for drawing the settings list
     *
     * TODO support redrawing of settings
     * currently only single update of available setting is supported
     */
    fluid.defaults("gpii.pcp.mainWindow", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            preferences: {
                sets: [],
                activeSet: null,
                settings: []
            }
        },
        selectors: {
            theme: "#flc-theme",
            header: "#flc-header",
            content: "#flc-content",
            footer: "#flc-footer",
            settingsList: "#flc-settingsList",
            heightChangeListener: "#flc-heightChangeListener"
        },
        components: {
            splash: {
                type: "gpii.pcp.splash",
                container: "{that}.container",
                options: {
                    listeners: {
                        "{mainWindow}.events.onPreferencesUpdated": {
                            funcName: "gpii.pcp.splash.toggleSplashWindow",
                            args: ["{that}", "{mainWindow}.model.preferences.sets"]
                        }
                    }
                }
            },
            header: {
                type: "gpii.pcp.header",
                container: "{that}.dom.header",
                options: {
                    model: {
                        preferences: {
                            sets: "{mainWindow}.model.preferences.sets",
                            activeSet: "{mainWindow}.model.preferences.activeSet"
                        }
                    },
                    events: {
                        onPreferencesUpdated: "{mainWindow}.events.onPreferencesUpdated"
                    },
                    listeners: {
                        "onCloseClicked": "{mainWindow}.close"
                    }
                }
            },
            settingsPanel: {
                type: "gpii.pcp.settingsPanel",
                container: "{that}.dom.settingsList",
                createOnEvent: "{mainWindow}.events.onPreferencesUpdated",
                options: {
                    model: {
                        settings: "{mainWindow}.model.preferences.settings"
                    },
                    events: {
                        onSettingAltered: "{mainWindow}.events.onSettingAltered",
                        onSettingUpdated: "{mainWindow}.events.onSettingUpdated"
                    }
                }
            },
            footer: {
                type: "gpii.pcp.footer",
                container: "{that}.dom.footer",
                options: {
                    listeners: {
                        onKeyOutClicked: "{mainWindow}.keyOut"
                    }
                }
            },
            heightChangeListener: {
                type: "gpii.pcp.heightChangeListener",
                container: "{that}.dom.heightChangeListener",
                options: {
                    invokers: {
                        onHeightChanged: "{mainWindow}.onContentHeightChanged"
                    }
                }
            }
        },
        modelListeners: {
            "preferences": "{that}.events.onPreferencesUpdated"
        },
        listeners: {
            "onCreate.addCommunicationChannel": {
                funcName: "gpii.pcp.addCommunicationChannel",
                args: ["{that}"]
            },

            "onSettingAltered.notifyIPC": {
                funcName: "gpii.pcp.notifySettingUpdate",
                args: ["{arguments}.0", "{arguments}.1"]
            }
        },
        invokers: {
            "updatePreferences": {
                changePath: "preferences",
                value: "{arguments}.0",
                source: "pcp.mainWindow"
            },
            "updateSetting": {
                // TODO just fire because... (redrawing)
                func: "{that}.events.onSettingUpdated.fire",
                args: [
                    "{arguments}.0",
                    "{arguments}.1"
                ]
            },
            "updateTheme": {
                "this": "{that}.dom.theme",
                method: "text",
                args: ["{arguments}.0"]
            },
            "onContentHeightChanged": {
                funcName: "gpii.pcp.onContentHeightChanged",
                args: [
                    "{that}.container",
                    "{that}.dom.content",
                    "{that}.dom.settingsList"
                ]
            },
            "close": "gpii.pcp.closeSettingsWindow()",
            "keyOut": "gpii.pcp.keyOut()"
        },
        events: {
            onPreferencesUpdated: null,

            onSettingAltered: null, // the setting was altered by the user
            onSettingUpdated: null  // setting update is present from the API
        }
    });
})(fluid);
