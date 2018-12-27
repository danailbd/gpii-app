/**
 * The survey component in the renderer view
 *
 * A wrapper for the survey popup and the channel used for IPC between the main, the
 * renderer process and the webview housing the survey web page.
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
/**
 * A wrapper component for the `gpii.survey.channel` (which handles the
 * communication between the `BrowserWindow` and the main electron process)
 * and the `gpii.survey.popup` (which wraps and serves as an intermediary
 * for the webview).
 */
(function (fluid) {
    fluid.defaults("gpii.survey", {
        gradeNames: ["fluid.component"],
        components: {
            channel: {
                type: "gpii.survey.channel",
                options: {
                    listeners: {
                        onSurveyOpen: {
                            funcName: "{popup}.openSurvey"
                        },
                        onExecuteJavaScript: {
                            funcName: "{popup}.executeJavaScript"
                        }
                    }
                }
            },
            popup: {
                type: "gpii.survey.popup",
                container: "#flc-survey",
                options: {
                    listeners: {
                        onIPCMessage: "{channel}.sendMessage"
                    }
                }
            }
        }
    });
})(fluid);
