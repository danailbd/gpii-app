/**
 * The main window component of the PSP
 *
 * A component which houses all visual components of the PSP (header, settingsPanel,
 * footer, restart warning).
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.psp");

    /**
     * Calculates the total height of the PSP assuming that the settings panel is
     * displayed fully, without the need for it to scroll (i.e. if there were enough
     * vertical space for the whole document).
     * @param mainWindow {Component} An instance of mainWindow.
     * @param container {jQuery} A jQuery object representing the mainWindow container.
     * @param content {jQuery} A jQuery object representing the content of the
     * document between the header and footer. This container is scrollable.
     * @param settingsList {jQuery} A jQuery object representing the container in
     * which the various widgets will have their containers inserted.
     * @param {Number} The height of the PSP assuming the settings panel is displayed
     * fully.
     */
    gpii.psp.calculateHeight = function (mainWindow, container, content, settingsList) {
        return container.outerHeight(true) - content.height() + settingsList.height();
    };

    /**
     * Updates the "theme" of the PSP `BrowserWindow`. Currently, the
     * theme consists simply of a definition of a `--main-color` variable
     * which is used for styling various widgets within the application.
     * @param theme {jQuery} The `style` tag which houses the application
     * theme definitions.
     * @param accentColor {String} The accent color used in the user's OS.
     */
    gpii.psp.updateTheme = function (theme, accentColor) {
        // The accent color is an 8-digit hex number whose last 2 digits
        // represent the alpha. In case the user has chosen his accent
        // color to be automatically picked by Windows, the accent color
        // is sometimes reported as an 8-digit hex number and sometimes
        // as a 6-digit number. The latter appears is incorrect and
        // should be ignored.
        if (accentColor && accentColor.length === 8) {
            var mainColor = "#" + accentColor.slice(0, 6),
                themeRules = ":root{ --main-color: " + mainColor + "; }";
            theme.text(themeRules);
        }
    };

    gpii.psp.playActivePrefSetSound = function (preferences) {
        if (!preferences.activeSet) {
            return;
        }

        var activePreferenceSet = fluid.find_if(preferences.sets,
            function (preferenceSet) {
                return preferenceSet.path === preferences.activeSet;
            }
        );

        if (activePreferenceSet && activePreferenceSet.soundSrc) {
            var sound = new Audio(activePreferenceSet.soundSrc);
            sound.play();
        }
    };

    /**
     * Shows or hides the sign in view depending on the keyed in state
     * of the user.
     *
     * @param {jQuery} signinView The signIn view container
     * @param {jQuery} pspView The psp view container
     * @param {Object} preferences An object representing the available
     * preference set, the active preference set and the available settings.
     */
    gpii.psp.toggleView = function (signinView, pspView, preferences) {
        if (preferences.sets && preferences.sets.length > 0) {
            signinView.hide();
            pspView.show();
        } else {
            signinView.show();
            pspView.hide();
        }
    };


    /**
     * Responsible for drawing the settings list
     *
     * Note: currently only single update of available setting is supported
     */
    fluid.defaults("gpii.psp.mainWindow", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.heightObservable"],
        model: {
            messages: {
                titlebarAppName: null
            },
            preferences: {
                sets: [],
                activeSet: null,
                settings: []
            }
        },
        selectors: {
            signin: ".flc-signin",
            psp:    ".flc-settingsEditor",

            theme: "#flc-theme",
            titlebar: "#flc-titlebar",
            header: "#flc-header",
            content: "#flc-content",
            footer: "#flc-footer",
            settingsList: "#flc-settingsList",
            restartWarning: "#flc-restartWarning",
            heightListenerContainer: "#flc-settingsList"
        },

        components: {
            titlebar: {
                type: "gpii.psp.titlebar",
                container: "{that}.dom.titlebar",
                options: {
                    model: {
                        messages: {
                            title: "{mainWindow}.model.messages.titlebarAppName"
                        }
                    },
                    listeners: {
                        "onClose": "{mainWindow}.events.onPSPClose"
                    }
                }
            },
            header: {
                type: "gpii.psp.header",
                container: "{that}.dom.header",
                options: {
                    model: {
                        preferences: {
                            sets: "{mainWindow}.model.preferences.sets",
                            activeSet: "{mainWindow}.model.preferences.activeSet"
                        }
                    },
                    events: {
                        onPreferencesUpdated: "{mainWindow}.events.onPreferencesUpdated",
                        onActivePreferenceSetAltered: "{mainWindow}.events.onActivePreferenceSetAltered",
                        onKeyOut: "{mainWindow}.events.onKeyOut"
                    }
                }
            },

            singinPage: {
                type: "gpii.psp.signin",
                container: ".flc-signin"
                // Once there is logic for registration in the core
                // options: {
                //     listeners: {
                //         onSignin: null,
                //         onSingup: null,
                //         onForgottenPassword: null
                //     }
                // }
            },

            settingsPanel: {
                type: "gpii.psp.settingsPanel",
                container: "{that}.dom.settingsList",
                createOnEvent: "{mainWindow}.events.onPreferencesUpdated",
                options: {
                    model: {
                        settings: "{mainWindow}.model.preferences.settings"
                    },
                    events: {
                        onSettingAltered: "{mainWindow}.events.onSettingAltered",
                        onSettingUpdated: "{mainWindow}.events.onSettingUpdated",
                        onRestartRequired: "{mainWindow}.events.onRestartRequired"
                    }
                }
            },
            restartWarning: {
                type: "gpii.psp.restartWarning",
                container: "{that}.dom.restartWarning",
                options: {
                    listeners: {
                        onHeightChanged: {
                            funcName: "{mainWindow}.updateHeight"
                        },
                        "{mainWindow}.events.onRestartRequired": {
                            funcName: "{that}.updatePendingChanges"
                        }
                    },
                    events: {
                        onRestartNow: "{mainWindow}.events.onRestartNow",
                        onUndoChanges: "{mainWindow}.events.onUndoChanges"
                    }
                }
            },
            footer: {
                type: "gpii.psp.footer",
                container: "{that}.dom.footer"
            }
        },
        modelListeners: {
            "preferences": "{that}.events.onPreferencesUpdated"
        },
        listeners: {
            "onCreate.setInitilView": {
                funcName: "{that}.toggleView",
                args: ["{that}.model.preferences"]
            },
            "onPreferencesUpdated.toggleView": {
                funcName: "{that}.toggleView",
                args: [
                    "{arguments}.0" // preferences
                ]
            },
            onActivePreferenceSetAltered: {
                func: "{that}.playActivePrefSetSound"
            }
        },
        invokers: {
            toggleView: {
                funcName: "gpii.psp.toggleView",
                args: [
                    "{that}.dom.signin",
                    "{that}.dom.psp",
                    "{arguments}.0" // preferences
                ]
            },
            "updatePreferences": {
                changePath: "preferences",
                value: "{arguments}.0",
                source: "psp.mainWindow"
            },
            "updateSetting": {
                func: "{that}.events.onSettingUpdated.fire",
                args: [
                    "{arguments}.0", // path
                    "{arguments}.1"  // value
                ]
            },
            "updateTheme": {
                funcName: "gpii.psp.updateTheme",
                args: [
                    "{that}.dom.theme",
                    "{arguments}.0" // accentColor
                ]
            },
            "calculateHeight": {
                funcName: "gpii.psp.calculateHeight",
                args: ["{that}", "{that}.container", "{that}.dom.content", "{that}.dom.settingsList"]
            },
            "playActivePrefSetSound": {
                funcName: "gpii.psp.playActivePrefSetSound",
                args: ["{that}.model.preferences"]
            }
        },
        events: {
            onPreferencesUpdated: null,

            onSettingAltered: null, // the setting was altered by the user
            onSettingUpdated: null,  // setting update is present from the API

            onPSPClose: null,
            onKeyOut: null,
            onActivePreferenceSetAltered: null,
            onHeightChanged: null,

            onRestartRequired: null,
            onRestartNow: null,
            onUndoChanges: null
        }
    });
})(fluid);
