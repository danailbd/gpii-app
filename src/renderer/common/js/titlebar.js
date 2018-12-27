/*!
 * PSP titlebar
 *
 * Contains a component representing the titlebar of the PSP.
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
    /**
     * A component representing the titlebar of a window. Contains the application
     * icon, the application title (given by implementor), as well as
     * a button for closing the window.
     */
    fluid.defaults("gpii.psp.titlebar", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            title: ".flc-title",
            closeBtn: ".flc-closeBtn"
        },
        events: {
            onClose: null
        },

        model: {
            messages: {
                title: null
            }
        },

        modelListeners: {
            "messages.title": {
                this: "{that}.dom.title",
                method: "text",
                args: ["{change}.value"]
            }
        },

        components: {
            closeBtn: {
                type: "gpii.app.activatable",
                container: "{that}.dom.closeBtn",
                options: {
                    attrs: {
                        "aria-label": "Close"
                    },
                    invokers: {
                        activate: {
                            this: "{titlebar}.events.onClose",
                            method: "fire",
                            args: "{arguments}.0"
                        }
                    }
                }
            }
        }
    });
})(fluid);
