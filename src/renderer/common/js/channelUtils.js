/**
 * Channel utilities
 *
 * Defines utilities for communication with the main process.
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
    var ipcRenderer = require("electron").ipcRenderer;

    var gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.psp.channel");

    /**
     * Sends a message to the main process.
     * @param {...Any} The channel to be notified and the parameters to be passed
     * with the message.
     */
    gpii.psp.channel.notifyChannel = function () {
        ipcRenderer.send.apply(null, arguments);
    };

    /**
     * Listens for events from the main process.
     * It expects component events to be supplied and it uses their keys as
     * channel names to which it attaches. Once data from a specific channel is
     * received, the corresponding event will be fired.
     */
    fluid.defaults("gpii.psp.channelListener", {
        gradeNames: "gpii.app.shared.simpleChannelListener",
        ipcTarget: ipcRenderer,

        events: {} // defined by implementor
    });

    /**
     * Sends data to the main process.
     * It expects component events to be supplied and it uses their keys as
     * channel names to which it sends data. Data is sent once a matching event
     * is fired.
     */
    fluid.defaults("gpii.psp.channelNotifier", {
        gradeNames: "gpii.app.common.simpleChannelNotifier",
        ipcTarget: ipcRenderer,

        events: {} // defined by implementor
    });
})(fluid);
