/**
 * The "More" dialog for the QSS
 *
 * Introduces a component that uses an Electron BrowserWindow to represent the QSS
 * "More" dialog.
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
"use strict";

var fluid = require("infusion");

require("../basic/centeredDialog.js");

/**
 * A centered blurrable dialog which represents the "More" window
 * in the QSS.
 */
fluid.defaults("gpii.app.qssMorePanel", {
    gradeNames: ["gpii.app.centeredDialog", "gpii.app.blurrable"],

    // Configuration which may differ depending on the machine on which the app is deployed
    siteConfig: {
        defaultWidth: 400,
        defaultHeight: 300,
        alwaysOnTop: true,
        movable: true,
        resizable: true,

        urls: {
            moreInfo: "http://morphic.world/more"
        }
    },

    linkedWindowsGrades: ["gpii.app.qss", "gpii.app.qssMorePanel"],

    config: {
        attrs: {
            width: "{that}.options.siteConfig.defaultWidth",
            height: "{that}.options.siteConfig.defaultHeight",

            icon: {
                expander: {
                    funcName: "fluid.module.resolvePath",
                    args: ["%gpii-app/src/icons/Morphic-Desktop-Icon.ico"]
                }
            },

            alwaysOnTop: "{that}.options.siteConfig.alwaysOnTop",
            frame: true,
            type: null,
            transparent: false,
            fullscreenable: true,

            movable: "{that}.options.siteConfig.movable",
            resizable: "{that}.options.siteConfig.resizable",
            destroyOnClose: true,
            minimizable: false,
            maximizable: false
        },
        params: {
            urls: "{that}.options.siteConfig.urls"
        },
        fileSuffixPath: "qssMorePanel/index.html"
    },

    listeners: {
        "onCreate.hideMenu": {
            this: "{that}.dialog",
            method: "setMenu",
            args: [null]
        }
    }
});
