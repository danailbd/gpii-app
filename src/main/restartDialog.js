/*!
GPII Application
Copyright 2016 Steven Githens
Copyright 2016-2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.
The research leading to these results has received funding from the European Union's
Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
*/
"use strict";

var fluid   = require("infusion");
var gpii    = fluid.registerNamespace("gpii");
var ipcMain = require("electron").ipcMain;

require("./utils.js");

// TODO extract to separate dialog
require("./waitDialog.js");

/**
 * A component that serves as simple interface for communication with the
 * electron `BrowserWindow` restart dialog.
 */
fluid.defaults("gpii.app.dialog.restartDialog.channel", {
    gradeNames: ["fluid.component"],

    events: {
        // onRestart: null,
        // onClosed: null,
        // onRestartLater: null
    },

    listeners: {
        "onCreate.registerChannel": {
            funcName: "gpii.app.dialog.restartDialog.channel.register",
            args: ["{that}.events", "{that}.options.source"]
        }
    },

    invokers: {
        updateAffectedSolutions: {
            // TODO rename function
            funcName: "gpii.app.notifyWindow",
            args: [
                "{dialog}.dialog",
                // TODO create 
                "onSolutionsUpdated", // rethink channel name
                "{arguments}.0"
            ]
        }
    }
});

gpii.app.dialog.restartDialog.channel.register = function (events, source) {
    // TODO unite with PSP channel?
    ipcMain.on("onRestartNow", function (event, message) {
        events.onRestart.fire();
    });

    ipcMain.on("onRestartLater", function (event, message) {
        events.onClosed.fire();
    });

    ipcMain.on("onClosed", function (event, message) {
        events.onClosed.fire();
    });

    ipcMain.on("onUndoChanges", function (event, message) {
        events.onUndoChanges.fire();
    });
};


/**
 * TODO
 */
fluid.defaults("gpii.app.dialog.restartDialog", {
    gradeNames: ["gpii.app.dialog"],

    model: {
        affectedSolutions: []
    },

    invokers: {
        show: {
            funcName: "gpii.app.dialog.restartDialog.show",
            args: ["{that}", "{arguments}.0"]
        },
        hide: {
            changePath: "showDialog",
            value: false
        },
        //        TODO not used
//        isShown: {
//            this: "{that}.dialog",
//            method: "isVisible"
//        }
    },

    config: {
        attrs: {
            // width: 300,
            // height: 200
        },
        // TODO extract somehow?
        url: {
            expander: {
                funcName: "fluid.stringTemplate",
                args: [
                    "file://%gpii-app/src/renderer/restartDialog/index.html",
                    "@expand:fluid.module.terms()"
                ]
            }
        }
    },


    listeners: {
        "onCreate.log": {
            func: "{that}.show"
        }
    },
    events: {
        onRestart: null,
        onClosed: null,
        // TODO probably not needed
        onRestartLater: null,
        onUndoChanges: null
    },

    components: {
        dialogChannel: {
            // TODO pass {that}?
            type: "gpii.app.dialog.restartDialog.channel",
            // createOnEvent: "{restartDialog}.events.onCreate", // TODO
            options: {
                events: {
                    onRestart: "{restartDialog}.events.onRestart",
                    onClosed: "{restartDialog}.events.onClosed",
                    // TODO probably not needed
                    onRestartLater: "{restartDialog}.events.onRestartLater",
                    onUndoChanges: "{restartDialog}.events.onUndoChanges"
                },

                // XXX find a better way
                modelListeners: {
                    "{restartDialog}.model.affectedSolutions": {
                        func: "{dialogChannel}.updateAffectedSolutions",
                        args: "{change}.value"
                    }
                }
            }
        }
    }
});

gpii.app.dialog.restartDialog.show = function (restartDialog, affectedSolutions) {

//    if (affectedSolutions.length > 0) {
        // finally, show the dialog
        // TODO improve mechanism?
        restartDialog.applier.change("showDialog", true);

        // change according new solutions
        restartDialog.applier.change("affectedSolutions", affectedSolutions);

        restartDialog.dialog.webContents.openDevTools();
//    }
};
