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

var electron = require("electron");
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
var path = require("path");
var request = require("request");

var BrowserWindow = electron.BrowserWindow;
var ws = require("ws");
require("./networkCheck.js");


require("./menu.js"); // menuInApp, menuInAppDev
require("./tray.js");
require("./psp.js");
//require("./gpiiConnector.js");

/**
 * Promise that resolves when the electron application is ready.
 * Required for testing multiple configs of the app.
 */
gpii.app.appReady = fluid.promise();

/**
 * Listens for the electron 'ready' event and resolves the promise accordingly.
 */
gpii.app.electronAppListener = function () {
    gpii.app.appReady.resolve(true);
};
require("electron").app.on("ready", gpii.app.electronAppListener);


/**
 * Responsible for creation and housekeeping of the connection to the PCP Channel WebSocket
 */
fluid.defaults("gpii.app.gpiiConnector", {
    gradeNames: "fluid.component",

    // Configuration regarding the socket connection
    config: {
        gpiiWSUrl: "ws://localhost:8081/pcpChannel"
    },

    members: {
        socket: "@expand:gpii.app.createGPIIConnection({that}.options.config)"
    },

    events: {
        onPreferencesUpdated: null
    },

    listeners: {
        "onDestroy.closeConnection": {
            listener: "{that}.closeConnection"
        }
    },

    invokers: {
        registerPCPListener: {
            funcName: "gpii.app.registerPCPListener",
            args: ["{that}.socket", "{that}", "{arguments}.0"]
        },
        updateSetting: {
            funcName: "gpii.app.gpiiConnector.updateSetting",
            args: ["{that}.socket", "{arguments}.0"]
        },
        updateActivePrefSet: {
            funcName: "gpii.app.gpiiConnector.updateActivePrefSet",
            args: ["{that}.socket", "{arguments}.0"]
        },
        closeConnection: {
            this: "{that}.socket",
            method: "close",
            // for ref https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
            args: [1000]
        }
    }
});

/**
 * Sends setting update request to GPII over the socket.
 *
 * @param socket {Object} The already connected WebSocket instance
 * @param setting {Object} The setting to be changed
 * @param setting.path {String} The id of the setting
 * @param setting.value {String} The new value of the setting
 */
gpii.app.gpiiConnector.updateSetting = function (socket, setting) {
    var payload = JSON.stringify({
        path: ["settingControls", setting.path],
        type: "ADD",
        value: setting.value
    });

    socket.send(payload);
};


/**
 * Send active set change request to GPII.
 *
 * @param socket {ws} The already connected `ws`(`WebSocket`) instance
 * @param newPrefSet {String} The id of the new preference set
 */
gpii.app.gpiiConnector.updateActivePrefSet = function (socket, newPrefSet) {
    var payload = JSON.stringify({
        path: ["activeContextName"],
        type: "ADD",
        value: newPrefSet
    });

    socket.send(payload);
};

/*
 ** Component to manage the app.
 */
fluid.defaults("gpii.app", {
    gradeNames: "fluid.modelComponent",
    model: {
        keyedInUserToken: null,
        showDialog: false,
        preferences: {
            sets: [],
            activeSet: null
        }
    },
    // prerequisites
    components: {
        gpiiConnector: {
            type: "gpii.app.gpiiConnector",
            createOnEvent: "onPrerequisitesReady",
            options: {
                listeners: {
                    "onPreferencesUpdated.updateSets": {
                        listener: "{app}.updatePreferences",
                        args: "{arguments}.0"
                    }
                }
            }
        },
        pcp: {
            type: "gpii.app.pcp",
            createOnEvent: "onPrerequisitesReady",
            options: {
                model: {
                    keyedInUserToken: "{app}.model.keyedInUserToken"
                },
                listeners: {
                    "onCreate.registerWithConnector": {
                        funcName: "{gpiiConnector}.registerPCPListener",
                        args: "{that}"
                    }
                }
            },
            priority: "after:gpiiConnector"
        },
        tray: {
            type: "gpii.app.tray",
            createOnEvent: "onPrerequisitesReady",
            options: {
                model: {
                    keyedInUserToken: "{gpii.app}.model.keyedInUserToken"
                }
            },
            // needed as the pcp window is used by the tray
            priority: "after:pcp"
        },
        dialog: {
            type: "gpii.app.dialog",
            createOnEvent: "onPrerequisitesReady",
            options: {
                model: {
                    showDialog: "{gpii.app}.model.showDialog"
                }
            }
        },
        networkCheck: { // Network check component to meet GPII-2349
            type: "gpii.app.networkCheck"
        }
    },
    events: {
        onPrerequisitesReady: {
            events: {
                onGPIIReady: "onGPIIReady",
                onAppReady: "onAppReady"
            }
        },
        onGPIIReady: null,
        onAppReady: null
    },
    modelListeners: {
        "{lifecycleManager}.model.logonChange": {
            funcName: "{that}.updateShowDialog",
            args: ["{change}.value.inProgress"]
        }
    },
    listeners: {
        "onCreate.appReady": {
            listener: "gpii.app.fireAppReady",
            args: ["{that}.events.onAppReady.fire"]
        },
        "{kettle.server}.events.onListen": {
            "this": "{that}.events.onGPIIReady",
            method: "fire"
        },
        "{lifecycleManager}.events.onSessionStart": {
            listener: "{that}.updateKeyedInUserToken",
            args: ["{arguments}.1"],
            namespace: "onLifeCycleManagerUserKeyedIn"
        },
        "{lifecycleManager}.events.onSessionStop": {
            listener: "gpii.app.handleSessionStop",
            args: ["{that}", "{arguments}.1.options.userToken"]
        }
    },
    invokers: {
        updateKeyedInUserToken: {
            changePath: "keyedInUserToken",
            value: "{arguments}.0"
        },
        updateShowDialog: {
            changePath: "showDialog",
            value: "{arguments}.0"
        },
        updatePreferences: {
            changePath: "preferences",
            value: "{arguments}.0"
        },
        keyIn: {
            funcName: "gpii.app.keyIn",
            args: ["{arguments}.0"]
        },
        keyOut: {
            funcName: "gpii.app.keyOut",
            args: "{that}.model.keyedInUserToken"
        },
        exit: {
            funcName: "gpii.app.exit",
            args: "{that}"
        },
        "handleUncaughtException": {
            funcName: "gpii.app.handleUncaughtException",
            args: ["{that}", "{arguments}.0"]
        }
    },
    distributeOptions: {
        target: "{flowManager requests stateChangeHandler}.options.listeners.onError",
        record: "gpii.app.onKeyInError"
    }
});

/**
 * A function which is called whenever an error occurs while keying in. Note that a real error
 * would have its `isError` property set to true.
 * @param error {Object} The error which has occurred.
 */
gpii.app.onKeyInError = function (error) {
    if (error.isError) {
        fluid.onUncaughtException.fire({
            code: "EKEYINFAIL"
        });
    }
};

gpii.app.fireAppReady = function (fireFn) {
    gpii.app.appReady.then(fireFn);
};

/**
  * Keys into the GPII.
  * Currently uses an url to key in although this should be changed to use Electron IPC.
  * @param token {String} The token to key in with.
  */
gpii.app.keyIn = function (token) {
    request("http://localhost:8081/user/" + token + "/login", function (/* error, response */) {
        // empty
    });
};

/**
  * Keys out of the GPII.
  * Currently uses an url to key out although this should be changed to use Electron IPC.
  * @param token {String} The token to key out with.
  * @return {Promise} A promise that will be resolved/rejected when the request is finished.
  */
gpii.app.keyOut = function (token) {
    var togo = fluid.promise();
    request("http://localhost:8081/user/" + token + "/logout", function (error, response, body) {
        //TODO Put in some error logging
        if (error) {
            togo.reject(error);
            fluid.log(response);
            fluid.log(body);
        } else {
            togo.resolve();
        }
    });
    return togo;
};

/**
  * Stops the Electron Application.
  * @return {Promise} An already resolved promise.
  */
gpii.app.performQuit = function () {
    var app = require("electron").app;
    var togo = fluid.promise();

    gpii.stop();
    app.quit();

    togo.resolve();
    return togo;
};

/**
  * Handles the exit of the Electron Application.
  * @param that {Component} An instance of gpii.app
  */
gpii.app.exit = function (that) {
    if (that.model.keyedInUserToken) {
        fluid.promise.sequence([
            gpii.rejectToLog(that.keyOut(), "Couldn't logout current user"),
            gpii.app.performQuit
        ]);
    } else {
        gpii.app.performQuit();
    }
};

/**
 * Creates a setting view model to be used in the settings window.
 * @param key {String} The name of the setting. Must be unique as
 * subsequent requests to the GPII API will use this key as identifier.
 * @param settingDescriptor {Object} A descriptor for the given setting
 * containing its title, description and constraints regarding its value.
 * @return {Object} The view model for the setting.
 */
gpii.app.createSettingModel = function (key, settingDescriptor) {
    return {
        path: key,
        value: settingDescriptor.value,
        solutionName: settingDescriptor.solutionName,

        icon: "../icons/gear-cloud-white.png",
        dynamicity: "none", // "none", "application" or "os"
        isPersisted: false,

        schema: settingDescriptor.schema
    };
};

/**
 * Extracts data for the user's preference sets (including the active preference
 * set and the applicable settings) from the message received when the user keys in.
 * @param message {Object} The message sent when the user keys is (a JSON
 * object).
 * @return {Object} An object containing all preference sets, the active preference
 * set and the corresponding settings.
 */
gpii.app.extractPreferencesData = function (message) {
    var value = message.value || {},
        preferences = value.preferences || {},
        contexts = preferences.contexts,
        settingControls = value.settingControls,
        sets = [],
        activeSet = value.activeContextName || null,
        settings = [];

    if (contexts) {
        sets = fluid.hashToArray(contexts, "path");
    }

    if (settingControls) {
        settings = fluid.values(
            fluid.transform(settingControls, function (settingDescriptor, settingKey) {
                return gpii.app.createSettingModel(settingKey, settingDescriptor);
            })
        );
    }

    return {
        sets: sets,
        activeSet: activeSet,
        settings: settings
    };
};

/**
 * Register listeners for messages from the GPII socket connection.
 * @param socket {Object} The connected gpii socket
 * @param gpiiConnector {Object} The `gpii.app.gpiiConnector` instance
 * @param pcp {Object} The `gpii.app.pcp` instance
 */
gpii.app.registerPCPListener = function (socket, gpiiConnector, pcp) {
    socket.on("message", function (rawData) {
        var data = JSON.parse(rawData),
            operation = data.type,
            path = data.path,
            preferences;

        if (operation === "ADD") {
            if (path.length === 0) {
                /*
                 * "Keyed in" data has been received
                 */
                preferences = gpii.app.extractPreferencesData(data);
                gpiiConnector.events.onPreferencesUpdated.fire(preferences);
                pcp.notifyPCPWindow("keyIn", preferences);
            } else {
                /*
                 * Setting change update has been received
                 */
                var settingPath = path[path.length - 2],
                    settingValue = data.value;
                pcp.notifyPCPWindow("updateSetting", {
                    path: settingPath,
                    value: settingValue
                });
            }
        } else if (operation === "DELETE") {
            preferences = gpii.app.extractPreferencesData(data);
            gpiiConnector.events.onPreferencesUpdated.fire(preferences);
            pcp.notifyPCPWindow("keyOut", preferences);
        }
    });
};

/**
 * Opens a connection to the PCP Channel WebSocket.
 * @param config {Object} The configuration for the WebSocket
 */
gpii.app.createGPIIConnection = function (config) {
    return new ws(config.gpiiWSUrl); // eslint-disable-line new-cap
};

/**
 * Handles when a user token is keyed out through other means besides the task tray key out feature.
 * @param that {Component} An instance of gpii.app
 * @param keyedOutUserToken {String} The token that was keyed out.
 */
gpii.app.handleSessionStop = function (that, keyedOutUserToken) {
    var currentKeyedInUserToken = that.model.keyedInUserToken;

    if (keyedOutUserToken !== currentKeyedInUserToken) {
        console.log("Warning: The keyed out user token does NOT match the current keyed in user token.");
    } else {
        that.updateKeyedInUserToken(null);
    }
};

/**
 * Listen on uncaught exceptions and display it to the user is if it's interesting.
 * @param that {Component} An instance of gpii.app.
 */
gpii.app.handleUncaughtException = function (that, err) {
    var tray = that.tray.tray;
    var handledErrors = {
        "EADDRINUSE": {
            message: "There is another application listening on port " + err.port,
            fatal: true
        },
        "EKEYINFAIL": {
            message: "Unable to key in. Please try again.",
            fatal: false
        }
    };

    // Update the showDialog model in order for the dialog to show for the
    // next user who tries to key in.
    that.updateShowDialog(false);
    // Immediately hide the loading dialog.
    that.dialog.dialog.hide();

    if (err.code) {
        var error = handledErrors[err.code];
        if (error) {
            tray.displayBalloon({
                title: error.title || "GPII Error",
                content: error.message || err.message,
                icon: path.join(__dirname, "icons/gpii-icon-balloon.png")
            });
            if (error.fatal) {
                var timeout;
                var quit = function () {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                        that.exit();
                    }
                };
                // Exit when the balloon is dismissed.
                tray.on("balloon-closed", quit);
                tray.on("balloon-click", quit);
                // Also terminate after a timeout - sometimes the balloon doesn't show, or the event doesn't fire.
                // TODO: See GPII-2348 about this.
                timeout = setTimeout(quit, 12000);
            }
        }
    }
};

fluid.onUncaughtException.addListener(function (err) {
    var app = fluid.queryIoCSelector(fluid.rootComponent, "gpii.app");
    if (app.length > 0) {
        app[0].handleUncaughtException(err);
    }
}, "gpii.app", "last");



/**
 * Component that contains an Electron Dialog.
 */

fluid.defaults("gpii.app.dialog", {
    gradeNames: "fluid.modelComponent",

    attrs: {
        width: 800,
        height: 600,
        show: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskBar: true
    },
    model: {
        showDialog: false,
        dialogMinDisplayTime: 2000, // minimum time to display dialog to user in ms
        dialogStartTime: 0, // timestamp recording when the dialog was displayed to know when we can dismiss it again
        timeout: 0
    },
    members: {
        dialog: {
            expander: {
                funcName: "gpii.app.makeWaitDialog",
                args: [
                    "{that}.options.attrs",
                    "@expand:{that}.getWindowPosition()"
                ]
            }
        }
    },
    modelListeners: {
        "showDialog": {
            funcName: "gpii.app.showHideWaitDialog",
            args: ["{that}", "{change}.value"]
        }
    },
    listeners: {
        "onDestroy.clearTimers": "gpii.app.clearTimers({that})"
    },
    invokers: {
        getWindowPosition: {
            funcName: "gpii.app.getWindowPosition",
            args: [
                "{that}.options.attrs.width",
                "{that}.options.attrs.height"
            ]
        }
    }
});

gpii.app.clearTimers = function (that) {
    clearTimeout(that.dismissWaitTimeout);
    clearInterval(that.displayWaitInterval);
};

/**
 * Creates a dialog. This is done up front to avoid the delay from creating a new
 * dialog every time a new message should be displayed.
 */
gpii.app.makeWaitDialog = function (windowOptions, position) {
    var dialog = new BrowserWindow(windowOptions);
    dialog.setPosition(position.x, position.y);

    var url = fluid.stringTemplate("file://%gpii-app/src/pcp/html/message.html", fluid.module.terms());
    dialog.loadURL(url);
    return dialog;
};


gpii.app.showHideWaitDialog = function (that, showDialog) {
    showDialog ? gpii.app.displayWaitDialog(that) : gpii.app.dismissWaitDialog(that);
};

/**
 * Shows the dialog on users screen with the message passed as parameter.
 * Records the time it was shown in `dialogStartTime` which we need when
 * dismissing it (checking whether it's been displayed for the minimum amount of time)
 *
 * @param that {Component} the gpii.app instance
 */
gpii.app.displayWaitDialog = function (that) {
    that.dialog.show();
    // Hack to ensure it stays on top, even as the GPII autoconfiguration starts applications, etc., that might
    // otherwise want to be on top
    // see amongst other: https://blogs.msdn.microsoft.com/oldnewthing/20110310-00/?p=11253/
    // and https://github.com/electron/electron/issues/2097
    if (that.displayWaitInterval) {
        clearInterval(that.displayWaitInterval);
        that.displayWaitInterval = 0;
    }
    that.displayWaitInterval = setInterval(function () {
        if (!that.dialog.isVisible()) {
            clearInterval(that.displayWaitInterval);
        };
        that.dialog.setAlwaysOnTop(true);
    }, 100);

    that.model.dialogStartTime = Date.now();
};

/**
 * Dismisses the dialog. If less than `that.dialogMinDisplayTime` ms have passed since we first displayed
 * the window, the function waits until `dialogMinDisplayTime` has passed before dismissing it.
 *
 * @param that {Component} the gpii.app instance
 */
gpii.app.dismissWaitDialog = function (that) {
    if (that.dismissWaitTimeout) {
        clearTimeout(that.dismissWaitTimeout);
        that.dismissWaitTimeout = null;
    }

    // ensure we have displayed for a minimum amount of `dialogMinDisplayTime` secs to avoid confusing flickering
    var remainingDisplayTime = (that.model.dialogStartTime + that.model.dialogMinDisplayTime) - Date.now();

    if (remainingDisplayTime > 0) {
        that.dismissWaitTimeout = setTimeout(function () {
            that.dialog.hide();
        }, remainingDisplayTime);
    } else {
        that.dialog.hide();
    }
};

// A wrapper that wraps gpii.app as a subcomponent. This is the grade need by configs/app.json
// to distribute gpii.app as a subcomponent of GPII flow manager since infusion doesn't support
// broadcasting directly to "components" block which probably would destroy GPII.

fluid.defaults("gpii.appWrapper", {
    gradeNames: ["fluid.component"],
    components: {
        app: {
            type: "gpii.app"
        }
    }
});
