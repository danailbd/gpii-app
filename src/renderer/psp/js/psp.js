/**
 * The PSP component in the renderer view
 *
 * A wrapper for the PSP window and the channel used for IPC between the main and the
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
    fluid.registerNamespace("gpii.psp");

    fluid.defaults("gpii.psp", {
        gradeNames: ["fluid.component", "gpii.psp.messageBundles"],
        model: {
            theme: null,
            sounds: {},
            urls: {
                help: null
            }
        },
        components: {
            channel: {
                type: "gpii.psp.clientChannel",
                options: {
                    listeners: {
                        onIsKeyedInUpdated: {
                            funcName: "{mainWindow}.updateIsKeyedIn"
                        },
                        onPreferencesUpdated: {
                            funcName: "{mainWindow}.updatePreferences"
                        },
                        onAccentColorChanged: {
                            funcName: "{mainWindow}.updateAccentColor"
                        },
                        onThemeChanged: {
                            funcName: "{mainWindow}.updateTheme"
                        },
                        onSettingUpdated: {
                            funcName: "{mainWindow}.updateSetting"
                        },
                        onRestartRequired: {
                            funcName: "{mainWindow}.events.onRestartRequired.fire"
                        }
                    }
                }
            },

            mainWindow: {
                type: "gpii.psp.mainWindow",
                container: "#flc-body",
                options: {
                    model: {
                        theme: "{psp}.model.theme",
                        sounds: "{psp}.model.sounds",
                        urls: "{psp}.model.urls"
                    },
                    listeners: {
                        onPSPClose: "{channel}.close",
                        onKeyOut: "{channel}.keyOut",
                        onSettingAltered: "{channel}.alterSetting",
                        onActivePreferenceSetAltered: "{channel}.alterActivePreferenceSet",
                        onHeightChanged: "{channel}.changeContentHeight",

                        onRestartNow:   "{channel}.restartNow",
                        onUndoChanges:  "{channel}.undoChanges",

                        onSignInRequested: "{channel}.requestSignIn"
                    }
                }
            },

            // Listen for window key events...
            windowKeyListener: {
                type: "fluid.component",
                options: {
                    gradeNames: "gpii.app.keyListener",
                    target: {
                        expander: {
                            funcName: "jQuery",
                            args: [window]
                        }
                    },
                    events: {
                        onEscapePressed: null
                    },
                    listeners: {
                        onEscapePressed: {
                            func: "{channel}.close",
                            args: [{
                                key: "{arguments}.0.key"
                            }]
                        }
                    }
                }
            }
        }
    });
})(fluid);
