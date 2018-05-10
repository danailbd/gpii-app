/**
 * Initializes the about dialog
 *
 * Creates the about dialog once the document has been loaded.
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
    var gpii = fluid.registerNamespace("gpii");

    var electron = require("electron");
    var windowInitialParams = electron.remote.getCurrentWindow().params;

    /*
     * Wrapper that enables translations for the `gpii.psp.aboutDialog` component and
     * applies interception of all anchor tags on the page so that an external browser is used
     * for loading them.
     */
    fluid.defaults("gpii.psp.translatedAboutDialog", {
        gradeNames: ["gpii.psp.messageBundles",  "gpii.psp.linksInterceptor", "fluid.viewComponent"],

        selectors: {
            clickthrough: ".flc-clickthrough"
        },

        listeners: {
            onCreate: {
                funcName: "gpii.psp.addClickThroughListeners",
                args: ["{that}.dom.clickthrough"]
            }
        },

        components: {
            aboutDialog: {
                type: "gpii.psp.aboutDialog",
                container: "{translatedAboutDialog}.container",
                options: {
                    model: {
                        version:       "{translatedAboutDialog}.model.version",
                        userListeners: "{translatedAboutDialog}.model.userListeners"
                    }
                }
            }
        }
    });


    gpii.psp.addClickThroughListeners = function (element) {
        element = $(".flc-clickthrough");

        var win = require('electron').remote.getCurrentWindow();

        element.on('mouseenter', function () {
            win.setIgnoreMouseEvents(true, {forward: true})
            console.log("enter");
        })
        element.on('mouseleave', function () {
            win.setIgnoreMouseEvents(false)
            console.log("leave");
        })
    };

    jQuery(function () {
        gpii.psp.translatedAboutDialog(".fl-dialog", {
            model: {
                version:       windowInitialParams.version,
                userListeners: windowInitialParams.userListeners
            }
        });
    });
})(fluid);
