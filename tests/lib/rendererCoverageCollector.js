/**
 * Utilities for collection of renderer processes coverage
 *
 * prepending and appending necessary sequence elements to the test definitions and
 * for bootstraping the test application instance.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */


var fluid = require("gpii-universal"),
    gpii = fluid.registerNamespace("gpii");
require("gpii-testem");


function sendCoverage() {
    var coveragePort = 7003; // TODO configurabale (stringTemplate)
    // send coverage
    // notify server for change

    function notifyCoverageSuccess() {
        require("electron").ipcRenderer.send("coverageSuccess");
    }
    // Similar to: https://github.com/GPII/gpii-testem/blob/master/src/js/client/coverageSender.js#L27
    if (window.__coverage__) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    console.log("Saved coverage data.");
                }
                else {
                    console.error("Error saving coverage data:", this.responseText);
                }

                // notify the main process TODO or listen for even of server
                notifyCoverageSuccess();
            }
        };
        xhr.open("POST", "http://localhost:" + coveragePort + "/coverage");
        xhr.setRequestHeader("Content-type", "application/json");
        var wrappedPayload = {
            payload: {
                document: {
                    title: document.title,
                    URL: document.URL
                },
                navigator: {
                    appCodeName: navigator.appCodeName,
                    appName: navigator.appName,
                    product: navigator.product,
                    productSub: navigator.productSub,
                    userAgent: navigator.userAgent,
                    vendor: navigator.vendor,
                    vendorSub: navigator.vendorSub
                },
                coverage: window.__coverage__
            }
        };
        xhr.send(JSON.stringify(wrappedPayload, null, 2));
    } else {
        // notify anyways
        notifyCoverageSuccess();
    }
}



/**
 * Component that ensures `gpii.app.dialog`s are using the instrumented version of renderer content 
 */
fluid.defaults("gpii.tests.app.instrumentedDialog", {
    // use the instrumented renderer files
    config: {
        filePrefixPath: "/instrumented/src/renderer"
    },
    listeners: {
        // "onDestroy.cleanupElectron": null,
        // "onCreate.attachCoverageCollector": {
        //     funcName: "gpii.tests.app.instrumentedDialog.attachCoverageCollector",
        //     args: ["{that}.dialog"]
        // },
        "onCreate.log": { // XXX dev
            funcName: "console.log",
            args: ["INSTRUMENTED DIALOG: ", "{that}.options.gradeNames"]
        }
    }
});

gpii.tests.app.instrumentedDialog.requestCoverage = function () {
    var promise = fluid.promise();

    var dialogs = require("electron").BrowserWindow.getAllWindows();
    var dialogCounter = 0;

    fluid.each(dialogs, function (dialog) {
        // dialog.webContents.toggleDevTools();
        console.log("REQUEST COVERAGE: ", dialog.gradeNames);
        gpii.test.executeJavaScript(dialog, sendCoverage.toString() + " sendCoverage();");
    });

    require("electron").ipcMain.on("coverageSuccess", function (e) {
        dialogCounter++;

        var diags = require("electron").BrowserWindow.getAllWindows();
        console.log("State: ", diags.map((d) => d.isDestroyed()))
        console.log("Sender: ", e.sender.isDestroyed());

        // XXX DEV
        console.log("Getting: ", dialogs.length, diags.length, dialogCounter);

        if (dialogCounter >= dialogs.length) {
            promise.resolve();
            require("electron").ipcMain.removeAllListeners("coverageSuccess");
        }
    });

    return promise;
};

gpii.tests.app.instrumentedDialog.attachCoverageCollector = function (dialog) {
    dialog.on("closed", function () {
        // TODO load script form file
        // XXX DEV
        console.log("REQUEST COVERAGE: ", dialog.gradeNames);
        gpii.test.executeJavaScript(dialog, sendCoverage.toString() + " sendCoverage();");
    });
    require("electron").ipcMain.on("covereageSuccess", dialog.destroy);
};

