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
var Menu  = require("electron").Menu;

var gpii  = fluid.registerNamespace("gpii");

/*
 ** Configuration for using the menu in the app.
 ** Note that this is an incomplete grade which references the app.
 */
fluid.defaults("gpii.app.menuInApp", {
    gradeNames: "gpii.app.menu",
    model: {
        keyedInUserToken: "{app}.model.keyedInUserToken",
        preferences: {
            sets: "{app}.model.preferences.sets",
            activeSet: "{app}.model.preferences.activeSet"
        }
    },
    modelListeners: {
        "menuTemplate": {
            namespace: "updateMenu",
            funcName: "gpii.app.updateMenu",
            args: ["{tray}.tray", "{that}.model.menuTemplate", "{that}.events"]
        }
    },
    listeners: {
        "onPCP.performPCP": {
            listener: "{pcp}.show"
        },

        "onActivePrefSetUpdate.performActiveSetChange": {
            listener: "{gpiiConnector}.updateActivePrefSet",
            args: "{arguments}.0.path"
        },

        // onKeyIn event is fired when a new user keys in through the task tray.
        // This should result in:
        // 1. key out the old keyed in user token
        // 2. key in the new user token
        //   a) trigger GPII {lifecycleManager}.events.onSessionStart
        //   b) fire a model change to set the new model.keyedInUserToken
        //   c) update the menu
        "onKeyIn.performKeyOut": {
            listener: "{app}.keyOut"
        },
        "onKeyIn.performKeyIn": {
            listener: "{app}.keyIn",
            args: ["{arguments}.0.token"],
            priority: "after:performKeyOut"
        },
        // onKeyOut event is fired when a keyed-in user keys out through the task tray.
        // This should result in:
        // 1. key out the currently keyed in user
        //    a) change model.keyedInUserToken
        //    b) update the menu
        "onKeyOut.performKeyOut": {
            listener: "{app}.keyOut"
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
            label: "Larger 125%",
            click: "onKeyIn",
            args: {
                token: "snapset_1a"
            }
        }, {
            label: "Larger 150%",
            click: "onKeyIn",
            args: {
                token: "snapset_1b"
            }
        }, {
            label: "Larger 175%",
            click: "onKeyIn",
            args: {
                token: "snapset_1c"
            }
        }, {
            label: "Dark & Larger 125%",
            click: "onKeyIn",
            args: {
                token: "snapset_2a"
            }
        }, {
            label: "Dark & Larger 150%",
            click: "onKeyIn",
            args: {
                token: "snapset_2b"
            }
        }, {
            label: "Dark & Larger 175%",
            click: "onKeyIn",
            args: {
                token: "snapset_2c"
            }
        }, {
            label: "Read To Me",
            click: "onKeyIn",
            args: {
                token: "snapset_3"
            }
        }, {
            label: "Magnifier 200%",
            click: "onKeyIn",
            args: {
                token: "snapset_4a"
            }
        }, {
            label: "Magnifier 400%",
            click: "onKeyIn",
            args: {
                token: "snapset_4b"
            }
        }, {
            label: "Magnifier 200% & Display Scaling 175%",
            click: "onKeyIn",
            args: {
                token: "snapset_4c"
            }
        }, {
            label: "Dark Magnifier 200%",
            click: "onKeyIn",
            args: {
                token: "snapset_4d"
            }
        }, {
            label: "Multi pref sets; Magnifier",
            click: "onKeyIn",
            args: {
                token: "context1"
            }
        }, {
            label: "Invalid user",
            click: "onKeyIn",
            args: {
                token: "danailbd"
            }
        }]
    },
    exit: {
        label: "{that}.options.menuLabels.exit",
        click: "onExit"
    }
});


/*
 ** Component to generate the menu tree structure that is relayed to gpii.app for display.
 */
fluid.defaults("gpii.app.menu", {
    gradeNames: "fluid.modelComponent",
    model: {
        // Expected as configuration
        //keyedInUserToken: null,
        //preferences: {
        //    sets: null,
        //    activeSet: null
        //},
        // locally updated
        preferenceSetsMenuItems: [],  // Updated on `preferences` changed.
        keyedInUser: null,            // Must be updated when keyedInUserToken changes.
        keyOut: null,                 // May or may not be in the menu, must be updated when keyedInUserToken changes.
        menuTemplate: []              // This is updated on change of keyedInUserToken.
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
        "keyedInUser": {
            target: "keyedInUser",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.getKeyedInUser",
                args: ["{that}.model.keyedInUserToken", "{that}.model.userName", "{that}.options.menuLabels.keyedIn"]
            },
            priority: "after:userName"
        },
        "keyOut": {
            target: "keyOut",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.getKeyOut",
                args: ["{that}.model.keyedInUserToken", "{that}.options.menuLabels.keyOut", "{that}.options.menuLabels.notKeyedIn"]
            },
            priority: "after:userName"
        },
        "showPCP": {
            target: "showPCP",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.getShowPCP",
                args: ["{that}.model.keyedInUserToken", "{that}.options.menuLabels.pcp"]
            }
        },
        "preferenceSetsMenuItems": {
            target: "preferenceSetsMenuItems",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.getPreferenceSetsMenuItems",
                args: ["{that}.model.preferences.sets", "{that}.model.preferences.activeSet"]
            }
        },
        "menuTemplate": {
            target: "menuTemplate",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.menu.generateMenuTemplate",
                args: ["{that}.model.showPCP", "{that}.model.keyedInUser", "{that}.options.snapsets", "{that}.model.preferenceSetsMenuItems", "{that}.model.keyOut", "{that}.options.exit"]
            },
            priority: "last"
        }
    },
    menuLabels: {
        pcp: "Open PSP",
        keyedIn: "Keyed in with %userTokenName",    // string template
        keyOut: "Key-out of GPII",
        notKeyedIn: "(No one keyed in)",

        // XXX DEV items
        exit: "Exit GPII",
        keyIn: "Key in ..."
    },
    events: {
        onPCP: null,
        onActivePrefSetUpdate: null,
        onKeyOut: null,

        // XXX DEV items
        onKeyIn: null,
        onExit: null
    }
});

/**
  * Generates a user name to be displayed based on the user token.
  * @param userToken {String} A user token.
  */
gpii.app.menu.getUserName = function (userToken) {
    // TODO: Name should actually be stored by the GPII along with the user token.
    var name = userToken ? userToken.charAt(0).toUpperCase() + userToken.substr(1) : "";
    return name;
};


/**
*  Object representing options for a `Electron` `ContextMenu` item.
 * @typedef {Object} ElectronMenuItem
 * @property {String} label The label that will be visualized in the menu
 * @property {String} enabled Whether the menu item is enabled
 * @property {String} [type] The type of the menu item
 * @property {String} [click] The event that is fired when the menu item is clicked
 * @property {Object} [args] The arguments to be passed to the click handler
 *               Currently in use
 * @property {String} [args.token] The user token
 * @property {String} [args.path] The path of the setting
 */

/**
  * Generates an object that represents the menu item for keying in.
  * @param keyedInUserToken {String} The user token that is currently keyed in.
  * @param name {String} The name of the user who is keyed in.
  * @param keyedInStrTemp {String} The string template for the label when a user is keyed in.
  * @return {ElectronMenuItem}
  */
gpii.app.menu.getKeyedInUser = function (keyedInUserToken, name, keyedInStrTemp) {
    var keyedInUser = null;

    if (keyedInUserToken) {
        keyedInUser = {
            label: fluid.stringTemplate(keyedInStrTemp, {"userTokenName": name}),
            enabled: false
        };
    }

    return keyedInUser;
};

/**
  * Generates an object that represents the menu item for keying out.
  * @param keyedInUserToken {String} The user token that is currently keyed in.
  * @param keyOutStr {String} The string to be displayed for the key out menu item
  * if there is a keyed in user.
  * @param notKeyedInStr {String} The string to be displayed when a user is not
  * keyed in.
  * @return {ElectronMenuItem}
  */
gpii.app.menu.getKeyOut = function (keyedInUserToken, keyOutStr, notKeyedInStr) {
    var keyOut;

    if (keyedInUserToken) {
        keyOut = {
            label: keyOutStr,
            click: "onKeyOut",
            args: {
                token: keyedInUserToken
            },
            enabled: true
        };
    } else {
        keyOut = {
            label: notKeyedInStr,
            enabled: false
        };
    }

    return keyOut;
};

/**
 * Generates an array that represents the menu items related to a
 * user's preference sets. The returned array can be used in the
 * context menu of a {Tray} object.
 * @param preferenceSets {Array} An array of all preference sets for the user.
 * @param activeSet {String} The path of the currently active preference set.
 * @return {ElectronMenuItem[]}
 */
gpii.app.menu.getPreferenceSetsMenuItems = function (preferenceSets, activeSet) {
    var preferenceSetsLabels,
        separator = {type: "separator"};

    preferenceSetsLabels = preferenceSets.map(function (preferenceSet) {
        return {
            label: preferenceSet.name,
            type: "radio",
            args: {
                path: preferenceSet.path
            },
            click: "onActivePrefSetUpdate",
            checked: preferenceSet.path === activeSet
        };
    });

    if (preferenceSetsLabels.length > 0) {
        preferenceSetsLabels.unshift(separator);
        preferenceSetsLabels.push(separator);
    }

    return preferenceSetsLabels;
};

/**
  * Generates an object that represents the menu items for opening the settings panel
  * @param keyedInUserToken {String} The user token that is currently keyed in.
  * @param openSettingsStr {String} The string to be displayed for the open setting panel menu item.
  * @returns {ElectronMenuItem}
  */
gpii.app.menu.getShowPCP = function (keyedInUserToken, openSettingsStr) {
    return {
        label: openSettingsStr,
        click: "onPCP",
        args: {
            token: keyedInUserToken
        }
    };
};

/**
  * Creates a JSON representation of a menu.
  * @param {Object} An object containing a menu item template.
  * There should be one object per menu item in the order they should appear in the mneu.
  */
gpii.app.menu.generateMenuTemplate = function (/* all the items in the menu */) {
    var menuTemplate = [],
        menuItems = fluid.flatten(fluid.makeArray(arguments));

    fluid.each(menuItems, function (item) {
        if (item) {
            menuTemplate.push(item);
        }
    });

    return menuTemplate;
};

/**
  * Takes a JSON array that represents a menu template and expands the "click" entries into functions
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
                events[evtName].fire(menuItem.args);
            };
        }
        if (menuItem.submenu) {
            menuItem.submenu = gpii.app.menu.expandMenuTemplate(menuItem.submenu, events);
        }
    });

    return menuTemplate;
};