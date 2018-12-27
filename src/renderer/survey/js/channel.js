/**
 * Channel for survey related IPC.
 *
 * A component responsible for IPC between the main and the renderer processes regarding
 * the surveys, as well as between the survey `BrowserWindow` and the webview embedding
 * the actual survey web page.
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

    /**
     * Responsible for communication between the main and the renderer
     * processes for survey related messages.
     */
    fluid.defaults("gpii.survey.channel", {
        gradeNames: ["fluid.component"],
        events: {
            onSurveyOpen: null,
            onExecuteJavaScript: null
        },
        listeners: {
            "onCreate.initChannel": {
                funcName: "gpii.survey.channel.initialize",
                args: ["{that}"]
            }
        },
        invokers: {
            sendMessage: {
                funcName: "gpii.survey.channel.sendMessage"
            }
        }
    });

    /**
     * Sends asynchronously a message to the main process.
     *
     * @param {String} channel - The channel via which the message will be sent.
     * @param {Any} message - The actual message that is to be sent.
     */
    gpii.survey.channel.sendMessage = function (channel, message) {
        ipcRenderer.send(channel, message);
    };

    /**
     * Initializes the component by registering listeners for survey
     * related messages sent by the main process.
     * @param {Component} that - The `gpii.survey.channel` instance.
     */
    gpii.survey.channel.initialize = function (that) {
        ipcRenderer.on("onSurveyOpen", function (event, surveyParams) {
            that.events.onSurveyOpen.fire(surveyParams);
        });

        ipcRenderer.on("onExecuteJavaScript", function (event, command) {
            that.events.onExecuteJavaScript.fire(command);
        });
    };
})(fluid);
