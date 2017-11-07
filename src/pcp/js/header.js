/*
Copyright 2013-2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    fluid.defaults("gpii.pcp.header", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            preferenceSetPicker: ".flc-prefSetPicker",
            activePreferenceSet: ".flc-activePreferenceSet",
            closeBtn: ".flc-closeBtn"
        },
        model: {
            preferences: {
                sets: [],
                activeSet: null
            }
        },
        events: {
            onPreferencesUpdated: null,
            onCloseClicked: null
        },
        modelListeners: {
            "preferences.activeSet": [{
                funcName: "gpii.pcp.updateActivePreferenceSet",
                args: ["{change}.value"],
                excludeSource: ["init", "pcp.mainWindow"],
                namespace: "notifyMainProcess"
            },{
                funcName: "gpii.pcp.updateActiveSetElement",
                args: ["{that}.dom.activePreferenceSet", "{that}.model.preferences"],
                namespace: "updateElement"
            }]
        },
        components: {
            preferenceSetPicker: {
                type: "@expand:gpii.pcp.getPreferenceSetPickerType({that}.model.preferences.sets)",
                container: "{that}.dom.preferenceSetPicker",
                createOnEvent: "onPreferencesUpdated",
                options: {
                    model: {
                        optionNames: {
                            expander: {
                                func: "fluid.getMembers",
                                args: ["{header}.model.preferences.sets", "name"]
                            }
                        },
                        optionList: {
                            expander: {
                                func: "fluid.getMembers",
                                args: ["{header}.model.preferences.sets", "path"]
                            }
                        },
                        selection: "{header}.model.preferences.activeSet"
                    },
                    listeners: {
                        "onDestroy.removeOptions": {
                            funcName: "gpii.pcp.onPreferenceSetPickerDestroy",
                            args: ["{that}.container"]
                        }
                    },
                    attrs: {
                        "aria-label": "Preference set"
                    }
                }
            },
            closeBtn: {
                type: "gpii.pcp.widgets.button",
                container: "{that}.dom.closeBtn",
                options: {
                    attrs: {
                        "aria-label": "Close"
                    },
                    invokers: {
                        "onClick": "{header}.events.onCloseClicked.fire"
                    }
                }
            }
        },
        listeners: {
            onPreferencesUpdated: {
                funcName: "gpii.pcp.updateHeader",
                args: ["{that}.model.preferences.sets", "{that}.dom.preferenceSetPicker", "{that}.dom.activePreferenceSet"]
            }
        }
    });

    /**
     * Updates the passed DOM element to contain the name of the active preference
     * set. If there is no currently active preference set (e.g. if there is no
     * keyed-in user), nothing should be displayed.
     * @param activeSetElement {jQuery} A jQuery object representing the DOM element
     * whose text is to be updated.
     * @param preferences {Object} An object containing all preference set, as well
     * as information about the currently active preference set.
     */
    gpii.pcp.updateActiveSetElement = function (activeSetElement, preferences) {
        var activePreferenceSet = fluid.find_if(preferences.sets,
            function (preferenceSet) {
                return preferenceSet.path === preferences.activeSet;
            }
        );

        if (activePreferenceSet) {
            activeSetElement.text(activePreferenceSet.name);
        } else {
            activeSetElement.empty();
        }
    };

    /**
     * A function which checks if an array object holds more than one element.
     * @param arr {Array} The array to be checked.
     * @return {Boolean} Whether the array has more than one element.
     */
    gpii.pcp.hasMultipleItems = function (arr) {
        return arr && arr.length > 1;
    };

    /**
     * Retrieves the type for the preferenceSetPicker subcomponent. In case there
     * is more than one available preference set, the type should be a dropdown.
     * Otherwise, the component should not initialize and ignore all its config
     * properties (and hence must have an emptySubcomponent type).
     * @param preferenceSets {Array} An array of the current preference sets.
     * @return {String} The type of the preferenceSetPicker subcomponent.
     */
    gpii.pcp.getPreferenceSetPickerType = function (preferenceSets) {
        return gpii.pcp.hasMultipleItems(preferenceSets) ? "gpii.pcp.widgets.dropdown" : "fluid.emptySubcomponent";
    };

    /**
     * Updates the DOM elements corresponding to the header component whenever new
     * preferences are received.
     * @param preferenceSets {Array} An array containing the new preferece sets.
     * @param preferenceSetPickerElem {jQuery} A jQuery object corresponding to the
     * preference set dropdown (in case there are multiple preference sets, it should
     * be shown, otherwise it should be hidden).
     * @param activePreferenceSetElem {jQuery} A jQuery object corresponding to the
     * preference set label (in case there is a single preference set it should be
     * show, otherwise it should be hidden).
     */
    gpii.pcp.updateHeader = function (preferenceSets, preferenceSetPickerElem, activePreferenceSetElem) {
        if (gpii.pcp.hasMultipleItems(preferenceSets)) {
            preferenceSetPickerElem.show();
            activePreferenceSetElem.hide();
        } else {
            preferenceSetPickerElem.hide();
            activePreferenceSetElem.show();
        }
    };

    /**
     * A listener which is invoked whenever the preference set picker component is
     * destroyed. This function simply removes all options for the dropdown (actually
     * represented as a <select> element) from the DOM.
     * @param container {jQuery} A jQuery object representing the parent container
     * of the preference set picker.
     */
    gpii.pcp.onPreferenceSetPickerDestroy = function (container) {
        container.find("option").remove();
    };
})(fluid);