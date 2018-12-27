/**
 * Basic renderer window component
 *
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
    var electron = require("electron"),
        windowInitialParams = electron.remote.getCurrentWindow().params;

    // Make the object just a simple data container (get rid of additional
    // methods and prototypes). In case this is omitted, the merging of
    // options will not work (these objects will simply override options).
    windowInitialParams = jQuery.extend({}, windowInitialParams);

    /**
     * A basic type of components for BrowserWindow dialogs.
     */
    fluid.defaults("gpii.psp.baseWindowCmp", {
        gradeNames: [
            "gpii.psp.messageBundles",
            "fluid.viewComponent",
            "gpii.psp.linksInterceptor",
            "gpii.psp.baseWindowCmp.signalDialogReady"
        ],

        baseGrade: null, // to be overridden

        components: {
            dialog: {
                type: "{that}.options.baseGrade",
                container: "{baseWindowCmp}.container",
                options: {
                    model: windowInitialParams
                }
            }
        }
    });

    /**
     * Notify the corresponding dialog wrapper component in main,
     * that the base window component has finished initialization.
     *
     * This is needed as the Electon's "ready-to-show" event may
     * be fired too soon - before the renderer wrapper component has
     * finished loading which causes troubles with init data sent from the main.
     */
    fluid.defaults("gpii.psp.baseWindowCmp.signalDialogReady", {
        listeners: {
            "onCreate.signalInit": {
                funcName: "gpii.psp.channel.notifyChannel",
                args: [
                    "onDialogReady",
                    // use the main component gradeName as a unique dialog identifier
                    electron.remote.getCurrentWindow().relatedCmpId
                ],
                priority: "last"
            }
        }
    });
})(fluid, jQuery);
