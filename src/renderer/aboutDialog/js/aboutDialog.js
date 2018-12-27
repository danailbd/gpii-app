/**
 * The about dialog
 *
 * Represents an about dialog that can be closed by the user.
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


    /**
     * Represents the controller for the about dialog
     * that gives information for the application version,
     * user listeners (keys) and some useful links.
     */
    fluid.defaults("gpii.psp.aboutDialog", {
        gradeNames: ["fluid.viewComponent", "gpii.psp.selectorsTextRenderer"],

        model: {
            messages: {
                title:             null,
                titlebarAppName:   null,
                update:            null,
                userListenersText: null,
                version:           null,
                morphicHome:       null,
                submitSuggestions: null
            },

            values: {
                version: null
            },

            userListeners: null,

            urls: {
                morphicHome: null,
                submitSuggestions: null
            }
        },

        selectors: {
            titlebar:          ".flc-titlebar",

            title:             ".flc-contentTitle",
            version:           ".flc-contentVersion",
            update:            ".flc-contentCheckUpdates",
            links:             ".flc-contentLinks",
            userListeners:     ".flc-contentUserListeners",

            morphicHome:       ".flc-morphicHome",
            submitSuggestions: ".flc-submitSuggestions"
        },

        modelListeners: {
            "messages.userListenersText": {
                this: "{that}.dom.userListeners",
                method: "text",
                args: "@expand:gpii.psp.aboutDialog.getUserListenersText({change}.value, {that}.model.userListeners)",
                excludeSource: "init"
            },

            "urls.morphicHome": {
                this: "{that}.dom.morphicHome",
                method: "attr",
                args: ["href", "{change}.value"]
            },

            "urls.submitSuggestions": {
                this: "{that}.dom.submitSuggestions",
                method: "attr",
                args: ["href", "{change}.value"]
            }
        },

        components: {
            titlebar: {
                type: "gpii.psp.titlebar",
                container: "{that}.dom.titlebar",
                options: {
                    model: {
                        messages: {
                            title: "{aboutDialog}.model.messages.titlebarAppName"
                        }
                    },
                    listeners: {
                        "onClose": {
                            funcName: "gpii.psp.channel.notifyChannel",
                            args: "onAboutDialogClosed"
                        }
                    }
                }
            }
        }
    });


    /**
     * Constructs the user listeners text.
     *
     * @param {String} description - The description with a placeholder by the name "listeners"
     * @param {String[]} userListeners - The list of key in listeners for the user
     * @return {String} The constructed string
     */
    gpii.psp.aboutDialog.getUserListenersText = function (description, userListeners) {
        return fluid.stringTemplate(description, { listeners: userListeners.join(", ") });
    };
})(fluid);
