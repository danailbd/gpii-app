/**
 * The footer component of the PSP window
 *
 * Defines the buttons contained in the footer of the PSP and their click handlers.
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
    fluid.defaults("gpii.psp.footer", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            helpBtn: ".flc-helpBtn"
        },
        model: {
            messages: {
                help: null
            },
            urls: {
                help: null
            }
        },
        components: {
            helpBtn: {
                type: "gpii.psp.widgets.button",
                container: "{that}.dom.helpBtn",
                options: {
                    model: {
                        label: "{footer}.model.messages.help"
                    },
                    invokers: {
                        "onClick": "gpii.psp.openUrlExternally({footer}.model.urls.help)"
                    }
                }
            }
        }
    });
})(fluid);
