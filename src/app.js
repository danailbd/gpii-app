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

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");
var Menu = require("electron").Menu;
var Tray = require("electron").Tray;
var path = require("path");
var request = require("request");
require("./networkCheck.js");

gpii.app.registerAppListener = function (evtName, listener) {
    require("electron").app.on(evtName, listener);
};

/*
 ** Component to manage the app.
 */
fluid.defaults("gpii.app", {
    gradeNames: "fluid.modelComponent",
    model: {
        keyedInUserToken: null
    },
    components: {
        tray: {
            type: "gpii.app.tray",
            createOnEvent: "onPrequisitesReady"
        },
        networkCheck: { // Network check component to meet GPII-2349
            type: "gpii.app.networkCheck"
        }
    },
    events: {
        onPrequisitesReady: {
            events: {
                onGPIIReady: "onGPIIReady",
                onAppReady: "onAppReady"
            }
        },
        onGPIIReady: null,
        onAppReady: null,
        onAppQuit: null
    },
    listeners: {
        "onCreate.registerAppReadyListener": {
            listener: "gpii.app.registerAppListener",
            args: ["ready", "{that}.events.onAppReady.fire"]
        },
        "onCreate.registerAppQuitListener": {
            listener: "gpii.app.registerAppListener",
            args: ["quit", "{that}.events.onAppQuit.fire"]
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
        keyIn: {
            funcName: "gpii.app.keyIn",
            args: ["{arguments}.0"]
        },
        keyOut: {
            funcName: "gpii.app.keyOut",
            args: ["{arguments}.0"]
        },
        exit: {
            funcName: "gpii.app.exit",
            args: "{that}"
        },
        "handleUncaughtException": {
            funcName: "gpii.app.handleUncaughtException",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

/**
  * Keys into the GPII.
  * Currently uses an url to key in although this should be changed to use Electron IPC.
  * @param token {String} The token to key in with.
  */
gpii.app.keyIn = function (token) {
    request("http://localhost:8081/user/" + token + "/login", function (/*error, response, body*/) {
        //TODO Put in some error logging
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
            gpii.rejectToLog(that.keyOut(that.model.keyedInUserToken), "Couldn't logout current user"),
            gpii.app.performQuit
        ]);
    } else {
        gpii.app.performQuit();
    }
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
 //TODO: Fix the access to the 'tray'.
gpii.app.handleUncaughtException = function (that, err) {
    var handledErrors = {
        "EADDRINUSE": {
            message: "There is another application listening on port " + err.port,
            fatal: true
        }
    };

    if (err.code) {
        var error = handledErrors[err.code];
        if (error) {
            that.tray.displayBalloon({
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
                that.tray.on("balloon-closed", quit);
                that.tray.on("balloon-click", quit);
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
 * Component that contains an Electron Tray.
 */

fluid.defaults("gpii.app.tray", {
    gradeNames: "fluid.component",
    members: {
        tray: {
            expander: {
                funcName: "gpii.app.makeTray",
                args: ["{that}.options.icon"]
            }
        }
    },
    components: {
        menu: {
            type: "gpii.app.menuInApp"
        }
    },
    listeners: {
        "onCreate.addTooltip": {
            "this": "{that}.tray",
            method: "setToolTip",
            args: ["{that}.options.labels.tooltip"]
        }
    },
    icon: "icons/gpii.ico",
    labels: {
        tooltip: "GPII"
    }
});

/**
  * Creates the Electron Tray
  * @param icon {String} Path to the icon that represents the GPII in the task tray.
  */
gpii.app.makeTray = function (icon) {
    var tray = new Tray(path.join(__dirname, icon));
    tray.on("click", function () {
        tray.popUpContextMenu();
    });
    return tray;
};

/*
 ** Configuration for using the menu in the app.
 ** Note that this is an incomplete grade which references the app.
 */
fluid.defaults("gpii.app.menuInApp", {
    gradeNames: "gpii.app.menu",
    model: {
        keyedInUserToken: "{app}.model.keyedInUserToken"
    },
    modelListeners: {
        "menuTemplate": {
            namespace: "updateMenu",
            funcName: "gpii.app.updateMenu",
            args: ["{tray}.tray", "{that}.model.menuTemplate", "{that}.events"]
        }
    },
    listeners: {
        // onKeyIn event is fired when a new user keys in through the task tray.
        // This should result in:
        // 1. key out the old keyed in user token
        // 2. key in the new user token
        //   a) trigger GPII {lifecycleManager}.events.onSessionStart
        //   b) fire a model change to set the new model.keyedInUserToken
        //   c) update the menu
        "onKeyIn.performKeyOut": {
            listener: "{app}.keyOut",
            args: "{that}.model.keyedInUserToken"
        },
        "onKeyIn.performKeyIn": {
            listener: "{app}.keyIn",
            args: ["{arguments}.0"],
            priority: "after:performKeyOut"
        },
        // onKeyOut event is fired when a keyed-in user keys out through the task tray.
        // This should result in:
        // 1. key out the currently keyed in user
        //    a) change model.keyedInUserToken
        //    b) update the menu
        "onKeyOut.performKeyOut": {
            listener: "{app}.keyOut",
            args: ["{arguments}.0"]
        },

        // onExit
        "onExit.performExit": {
            listener: "{app}.exit"
        }
    }
});

/**
  * Refreshes the task tray menu for the GPII Application using the menu in the model
  * @param tray {Object} An Electron 'Tray' object.
  * @param menuTemplate {Array} A nested array that is the menu template for the GPII Application.
  * @param events {Object} An object containing the events that may be fired by items in the menu.
  */
gpii.app.updateMenu = function (tray, menuTemplate, events) {
    menuTemplate = gpii.app.menu.expandMenuTemplate(menuTemplate, events);

    tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
};

fluid.defaults("gpii.app.menuInAppDev", {
    gradeNames: "gpii.app.menuInApp",
    // The list of the default snapsets shown on the task tray menu for key-in
    snapsets: {
        label: "{that}.options.menuLabels.keyIn",
        submenu: [{
            label: "Alice",
            click: "onKeyIn",
            token: "alice"
        }, {
            label: "Davey",
            click: "onKeyIn",
            token: "davey"
        }, {
            label: "David",
            click: "onKeyIn",
            token: "david"
        }, {
            label: "Elaine",
            click: "onKeyIn",
            token: "elaine"
        }, {
            label: "Elmer",
            click: "onKeyIn",
            token: "elmer"
        }, {
            label: "Elod",
            click: "onKeyIn",
            token: "elod"
        }, {
            label: "Livia",
            click: "onKeyIn",
            token: "livia"
        }]
    }
});


/*
 ** Component to generate the menu tree structure that is relayed to gpii.app for display.
 */
fluid.defaults("gpii.app.menu", {
    gradeNames: "fluid.modelComponent",
    model: {
        //keyedInUserToken  // This comes from the app.
        keyedInUser: {
            label: "",      // Must be updated when keyedInUserToken changes.
            enabled: false
        },
        keyOut: null        // May or may not be in the menu, must be updated when keyedInUserToken changes.
        //menuTemplate: []  // This is updated on change of keyedInUserToken.
    },
    modelRelay: {
        "userName": {
            target: "userName",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.getUserName",
                args: ["{that}.model.keyedInUserToken"]
            }
        },
        "keyedInUserLabel": {
            target: "keyedInUser.label",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.getKeyedInLabel",
                args: ["{that}.model.userName", "{that}.options.menuLabels.keyedIn", "{that}.options.menuLabels.notKeyedIn"]
            },
            priority: "after:userName"
        },
        "keyOut": {
            target: "keyOut",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.getKeyOut",
                args: ["{that}.model.keyedInUserToken", "{that}.model.userName", "{that}.options.menuLabels.keyOut"]
            },
            priority: "after:userName"
        },
        "menuTemplate:": {
            target: "menuTemplate",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.generateMenuTemplate",
                args: ["{that}.model.keyedInUser", "{that}.model.keyOut", "{that}.options.snapsets", "{that}.options.exit"]
            },
            priority: "last"
        }
    },
    exit: {
        label: "{that}.options.menuLabels.exit",
        click: "onExit"
    },
    menuLabels: {
        keyedIn: "Keyed in with %userTokenName",    // string template
        keyOut: "Key out %userTokenName",           // string template
        notKeyedIn: "Not keyed in",
        exit: "Exit GPII",
        keyIn: "Key in ..."
    },
    events: {
        onKeyIn: null,
        onKeyOut: null,
        onExit: null
    }
});

/**
  * Generates a user name to be displayed based on the user token.
  * @param userToken {String} A user token.
  */
gpii.app.menu.getUserName = function (userToken) {
    // TODO: Name should actually be stored by the GPII along with the user token.
    return userToken ? userToken.charAt(0).toUpperCase() + userToken.substr(1) : "";
};

/**
  * Generates a label based on whether or not a user name is present.
  * @param name {String} The name of the user who is keyed in.
  * @param keyedInStrTemp {String} The string template for the label when a user is keyed in.
  * @param notKeyedInStr {String} The string when a user is not keyed in.
  */
gpii.app.menu.getKeyedInLabel = function (name, keyedInStrTemp, notKeyedInStr) {
    return name ? fluid.stringTemplate(keyedInStrTemp, {"userTokenName": name}) : notKeyedInStr;
};

/**
  * Generates an object that represents the menu item for keying out.
  * @param keyedInUserToken {String} The user token that is currently keyed in.
  * @param name {String} The name of the user that is currently keyed in.
  * @param keyOutStrTemp {String} The string to be displayed for the key out menu item.
  */
gpii.app.menu.getKeyOut = function (keyedInUserToken, name, keyOutStrTemp) {
    var keyOut = null;

    if (keyedInUserToken) {
        keyOut = { // TODO: probably should put at least the structure of this into configuration
            label: fluid.stringTemplate(keyOutStrTemp, {"userTokenName": name}),
            click: "onKeyOut",
            token: keyedInUserToken
        };
    }

    return keyOut;
};

/**
  * Creates a JSON representation of a menu.
  * @param {Object} An object containing a menu item template.
  * There should be one object per menu item in the order they should appear in the mneu.
  */
gpii.app.menu.generateMenuTemplate = function (/* all the items in the menu */) {
    var menuTemplate = [];
    fluid.each(arguments, function (item) {
        if (item) {
            menuTemplate.push(item);
        }
    });

    return menuTemplate;
};

/**
  * Takes a JSON array that represents a menu template and expands the 'click' entries into functions
  * that fire the appropriate event.
  * @param events {Object} An object that contains the events that might be fired from an item in the menu.
  * @param menuTemplate {Array} A JSON array that represents a menu template
  * @return {Array} The expanded menu template. This can be used to create an Electron menu.
  */
gpii.app.menu.expandMenuTemplate = function (menuTemplate, events) {
    fluid.each(menuTemplate, function (menuItem) {
        if (typeof menuItem.click === "string") {
            var evtName = menuItem.click;
            menuItem.click = function () {
                events[evtName].fire(menuItem.token);
            };
        }
        if (menuItem.submenu) {
            menuItem.submenu = gpii.app.menu.expandMenuTemplate(menuItem.submenu, events);
        }
    });

    return menuTemplate;
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