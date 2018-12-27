/**
 * The renderer portion of the QSS More Panel
 *
 * Creates the Quick Set Strip More Panel once the document has been loaded.
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
     * Enables internationalization of the QSS More Panel.
     */
    fluid.defaults("gpii.psp.translatedQssMorePanel", {
        gradeNames: ["gpii.psp.messageBundles", "fluid.viewComponent", "gpii.psp.linksInterceptor"],

        components: {
            qssMorePanel: {
                type: "gpii.psp.qssMorePanel",
                container: "{translatedQssMorePanel}.container",
                options: {
                    model: {
                        urls: "{translatedQssMorePanel}.model.urls"
                    }
                }
            }
        }
    });

    /**
     * Represents the More Panel. Takes care of initializing it and handling
     * user interaction.
     */
    fluid.defaults("gpii.psp.qssMorePanel", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        model: {
            messages: {
                details: null,
                link: null
            },
            urls: {
                moreInfo: null
            },
            values: {
                moreInfoUrl: "{that}.model.urls.moreInfo"
            }
        },

        selectors: {
            details: ".flc-qssMorePanel-details",
            link: ".flc-qssMorePanel-link"
        },

        enableRichText: true
    });
})(fluid);
