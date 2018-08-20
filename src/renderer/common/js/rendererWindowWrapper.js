/**
 * Basic renderer window component
 *
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
    var electron = require("electron");

    fluid.defaults("gpii.psp.rendererWrapper.signalDialogReady", {
        listeners: {
            "onCreate.signalInit": {
                funcName: "gpii.psp.channel.notifyChannel",
                args: [
                    "onDialogReady",
                    // use the gradeName as a unique dialog identifier
                    electron.remote.getCurrentWindow().grade
                ]
            }
        }
    });
})(fluid);