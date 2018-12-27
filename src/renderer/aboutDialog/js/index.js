/**
 * Initializes the about dialog
 *
 * Creates the about dialog once the document has been loaded.
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
    var gpii = fluid.registerNamespace("gpii");

    var electron = require("electron");
    var windowInitialParams = electron.remote.getCurrentWindow().params;

    /**
     * Wrapper that enables translations for the `gpii.psp.aboutDialog` component and
     * applies interception of all anchor tags on the page so that an external browser is used
     * for loading them.
     */
    fluid.defaults("gpii.psp.translatedAboutDialog", {
        gradeNames: ["gpii.psp.messageBundles", "fluid.viewComponent", "gpii.psp.linksInterceptor"],

        components: {
            aboutDialog: {
                type: "gpii.psp.aboutDialog",
                container: "{translatedAboutDialog}.container",
                options: {
                    model: {
                        values: {
                            version:   "{translatedAboutDialog}.model.version"
                        },
                        userListeners: "{translatedAboutDialog}.model.userListeners",
                        urls:          "{translatedAboutDialog}.model.urls"
                    }
                }
            }
        }
    });


    jQuery(function () {
        gpii.psp.translatedAboutDialog(".fl-dialog", {
            model: {
                version:       windowInitialParams.version,
                userListeners: windowInitialParams.userListeners,
                urls:          windowInitialParams.urls
            }
        });
    });
})(fluid);
