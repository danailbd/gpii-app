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
    var electron = require("electron"),
        windowInitialParams = electron.remote.getCurrentWindow().params,
        gpii = fluid.registerNamespace("gpii");

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
            "gpii.psp.baseWindowCmp.signalDialogReady",
            "gpii.psp.baseWindowCmp.zoomOpPropagator"
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

    fluid.defaults("gpii.psp.baseWindowCmp.zoomOpPropagator", {
        invokers: {
            notify: {
                funcName: "gpii.psp.baseWindowCmp.notifyZoomOperation",
                args: [
                    "{zoomChannelNotifier}",
                    "{arguments}.0", // isZoomIn?
                    "{arguments}.1"  // keyEvent
                ]
            }
        },

        components: {
            zoomKeysListener: {
                type: "fluid.component",
                options: {
                    gradeNames: "gpii.app.keyListener",
                    target: { expander: { funcName: "jQuery", args: [window] } },

                    keyEventNamespace: "zoomInterceptor",

                    events: {
                        onAddPressed: null,
                        onSubtractPressed: null,
                        onEqualsPressed: null
                    },
                    listeners: {
                        onAddPressed:      "{zoomOpPropagator}.notify(true, {arguments}.0)",
                        onEqualsPressed:   "{zoomOpPropagator}.notify(true, {arguments}.0)",
                        onSubtractPressed: "{zoomOpPropagator}.notify(false, {arguments}.0)"
                    }
                }
            },
            zoomChannelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        onZoomInOccurred: null,
                        onZoomOutOccurred: null
                    }
                }
            }
        }
    });

    gpii.psp.baseWindowCmp.notifyZoomOperation = function (zoomChannelNotifier, isZoomIn, keyEvent) {
        if (keyEvent.ctrlKey) {
            if (isZoomIn) {
                zoomChannelNotifier.events.onZoomInOccurred.fire();
            } else {
                zoomChannelNotifier.events.onZoomOutOccurred.fire();
            }
        }
    };

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
