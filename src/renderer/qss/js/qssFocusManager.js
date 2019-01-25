/**
 * Defines a `focusManager` component for the QSS
 *
 * A focus manager which enables navigation between the various focusable elements
 * using (Shift +) Tab and all arrow keys.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid jQuery */

"use strict";
(function (fluid, jQuery) {
    var gpii = fluid.registerNamespace("gpii");

    /**
     * A special type of focusManager which enables navigation between the focusable
     * elements using Tab, Shift + Tab, Arrow Up, Arrow Down, Arrow Left and the
     * Arrow Right key. The navigation focus basically moves in the visual direction.
     */
    fluid.defaults("gpii.qss.qssFocusManager", {
        gradeNames: ["gpii.qss.horizontalFocusManager", "gpii.qss.verticalFocusManager"],

        model: {
            // TODO doc
            focusGroupsInfo: {
                focusGroups: [],
                focusGroupIndex: -1,
                focusIndex: -1
            }
        },

        maxElementsPerFocusGroup: 2,

        styles: {
            button: "fl-qss-button",
            smallButton: "fl-qss-smallButton"
        },

        // TODO
        listeners: {
            "onDomSubtreeUpdated.updateFocusGroups": {
                func: "{that}.updateFocusGroupInfo"
            },
            "onCreate.initFocusGroups": {
                func: "{that}.updateFocusGroupInfo"
            }
        },

        modelListeners: {
            "focusedElementData": {
                funcName: "gpii.qss.qssFocusManager.updateGroupFocusIndex",
                args: [
                    "{that}",
                    "{change}.value"
                ],
                excludeSource: "init"
            }
        },

        invokers: {
            updateFocusGroupInfo: {
                funcName: "gpii.qss.qssFocusManager.updateFocusGroupInfo",
                args: ["{that}", "{that}.container"]
            },

            focusNextHorizontally: {
                funcName: "gpii.qss.qssFocusManager.focusElementHorizontally",
                args: [
                    "{that}",
                    false
                ]
            },
            focusPreviousHorizontally: {
                funcName: "gpii.qss.qssFocusManager.focusElementHorizontally",
                args: [
                    "{that}",
                    true
                ]
            },
            focusNextVertically: {
                funcName: "gpii.qss.qssFocusManager.focusNearestVertically",
                args: [
                    "{that}",
                    true
                ]
            },
            focusPreviousVertically: {
                funcName: "gpii.qss.qssFocusManager.focusNearestVertically",
                args: [
                    "{that}",
                    false
                ]
            }
        }
    });

    /**
     * Retrieves the tab index of a given DOM or jQuery element as a number.
     * @param {HTMLElement | jQuery} element - A simple DOM element or wrapped in a jQuery
     * object.
     * @return {Number} The tab index of the given element or `undefined` if this property
     * is not specified.
     */
    gpii.qss.qssFocusManager.getTabIndex = function (element) {
        var tabIndex = jQuery(element).attr("tabindex");
        if (tabIndex) {
            return parseInt(tabIndex, 10);
        }
    };


    /**
     * Represents a group of QSS buttons some (or all) of which can gain focus. The number of
     * QSS elements in a group cannot exceed `maxElementsPerFocusGroup`. A group can have
     * multiple buttons if and only if they are "small" QSS buttons, i.e. a large button always
     * appears in its own group.
     * @typedef {HTMLElement[]} FocusGroup
     */

    /**
     * An object containing useful information about the QSS buttons and the currently focused
     * QSS button if any.
     * @typedef {Object} FocusGroupsInfo
     * @property {FocusGroup[]} focusGroups - An array of `FocusGroup`s which together contain
     * all QSS buttons.
     * @property {Number} focusGroupIndex - The index of the focus group in which the currently
     * focused element resides, or -1 if currently there is no focused element
     * @property {Number} focusIndex - the index of the focused element within its own group, or
     * -1 if currently there is no focused element. If the `focusGroupIndex` is -1, this implies
     * that the `focusIndex` will also be -1.
     */

    /**
     * Returns an array of `FocusGroup`s each of which can contain a different number of QSS
     * buttons. Grouping is performed by examining the buttons in the order in which they appear
     * in the DOM.
     * @param {Component} that - The `gpii.qss.qssFocusManager` instance.
     * @return {FocusGroup[]} An array of `FocusGroup`s which together contain all QSS buttons.
     */
    gpii.qss.qssFocusManager.getFocusGroups = function (that) {
        var focusGroups = [],
            styles = that.options.styles,
            qssButtons = qssButtons = that.container.find("." + styles.button + ":visible"),
            currentFocusGroup = [];

        fluid.each(qssButtons, function (qssButton) {
            if (jQuery(qssButton).hasClass(styles.smallButton)) {
                currentFocusGroup.push(qssButton);
                // Mark the group as complete if the max number of elements has been reached.
                if (currentFocusGroup.length >= that.options.maxElementsPerFocusGroup) {
                    focusGroups.push(currentFocusGroup);
                    currentFocusGroup = [];
                }
            } else {
                // A "big" button can only be added to a group where it is the only element.
                // So complete any partial group that may exist before that.
                if (currentFocusGroup.length > 0) {
                    focusGroups.push(currentFocusGroup);
                    currentFocusGroup = [];
                }
                focusGroups.push([qssButton]);
            }
        });

        return focusGroups;
    };

    /**
     * Generates necessary metadata to support navigation with arrow keys in groups.
     * @param {Component} that - The `gpii.qss.qssFocusManager` instance.
     * @param {jQuery} container - The jQuery element representing the container of the component.
     */
    gpii.qss.qssFocusManager.updateFocusGroupInfo = function (that, container) {
        var focusGroups = gpii.qss.qssFocusManager.getFocusGroups(that, container);

        that.applier.change(
            "focusGroupsInfo", {
                focusGroups: focusGroups
            }
        );
    };


    /**
     * TODO
     * This is related to the base `focusedElementData` and it is updated dependent on it.
     * @param that
     * @param focusedElementData
     * @returns {undefined}
     */
    gpii.qss.qssFocusManager.updateGroupFocusIndex = function (that, focusedElementData) {
        // find group index & index
        var focusIndex = -1,
            focusGroupIndex = fluid.find(that.model.focusGroupsInfo.focusGroups, function (focusGroup, index) {
                focusIndex = jQuery.inArray(focusedElementData.element, focusGroup);
                if (focusIndex > -1) {
                    return index;
                }
            }, -1);

        that.applier.change(
            "focusGroupsInfo", {
                focusGroupIndex: focusGroupIndex,
                focusIndex: focusIndex
            }
        );
    };

    /**
     * Focuses the first available button which conforms to all of the following conditions:
     * 1. The button is focusable.
     * 2. The button is in the same focus group as the currently focused button.
     * 3. The button is the first button before or after the currently focused button (depending
     * on the `backwards` argument) which conforms to the two conditions above.
     * @param {Component} that - The `gpii.qss.qssFocusManager` instance.
     * @param {Boolean} backwards - If `true` the scanning direction will be from bottom to top.
     * Otherwise, it will be from top to bottom.
     */
    gpii.qss.qssFocusManager.focusNearestVertically = function (that, backwards) {
        var focusGroupsInfo = that.model.focusGroupsInfo,
            focusGroups = focusGroupsInfo.focusGroups,
            focusGroupIndex = focusGroupsInfo.focusGroupIndex,
            focusGroup = focusGroups[focusGroupIndex],
            delta = backwards ? 1 : -1,
            nextElementIndex = focusGroupsInfo.focusIndex + delta;

        if (focusGroupIndex > -1) {
            while (0 <= nextElementIndex && nextElementIndex < focusGroup.length) {
                var elementToFocus = focusGroup[nextElementIndex];
                if (that.isFocusable(elementToFocus)) {
                    that.focusElement(elementToFocus);
                    break;
                } else {
                    nextElementIndex += delta;
                }
            }
        }
    };

    /**
     * Focuses the first available button which conforms to all of the following conditions:
     * 1. The button is focusable.
     * 2. The button is in the first focusable group which comes to the left or to the right
     * (depending on the value of the `backwards` flag) of the current focus group. If there
     * is no such button in any of the groups to the left or to the right, the groups to the right
     * or to the left of the current focus group respectively are also examined starting from the
     * farthest.
     * 3. The button has the same index in its focus group as the index of the currently focused
     * button in its group. If the new group has fewer buttons, its last button will be focused.
     * @param {Component} that - The `gpii.qss.qssFocusManager` instance.
     * @param {FocusGroupsInfo} focusGroupsInfo - An object holding information about the focusable
     * elements in the QSS.
     * @param {Number} initialGroupIndex - the index of the focus group from which the examination
     * should commence
     * @param {Boolean} backwards - If `true` the scanning direction will be from right to left
     * Otherwise, it will be from left to right.
     */
    gpii.qss.qssFocusManager.focusNearestHorizontally = function (that, focusGroupsInfo, initialGroupIndex, backwards) {
        var focusGroups = focusGroupsInfo.focusGroups,
            focusIndex = focusGroupsInfo.focusIndex,
            delta = backwards ? -1 : 1,
            nextGroupIndex = initialGroupIndex;

        /* Use a do-while because we are passing the group from which the examination should start,
         * i.e. no need to check the condition the first time. Useful for handling the case when
         * there is no focus group initially (see usage in `gpii.qss.qssFocusManager.focusElementHorizontally`).
         */
        do {
            var nextFocusGroup = focusGroups[nextGroupIndex],
                elementIndex = Math.max(0, Math.min(focusIndex, nextFocusGroup.length - 1)),
                elementToFocus = nextFocusGroup[elementIndex];

            if (that.isFocusable(elementToFocus)) {
                that.focusElement(elementToFocus);
                break;
            } else {
                nextGroupIndex = gpii.psp.modulo(nextGroupIndex + delta, focusGroups.length);
            }
        } while (nextGroupIndex !== initialGroupIndex);
    };

    /**
     * Focuses the first available button which conforms to all of the following conditions:
     * 1. The button is focusable.
     * 2. The button is in a focus group which is visually to the right of the current focus group
     * or the leftmost group if there is no focus group initially.
     * If there is no such button in any of the groups to the right, the groups to the left of the
     * current focus group are also examined starting from the farthest.
     * 3. The button has the same index in its focus group as the index of the currently focused
     * button in its group. If the new group has fewer buttons, its last button will be focused.
     * @param {Component} that - The `gpii.qss.qssFocusManager` instance.
     */
    gpii.qss.qssFocusManager.focusElementHorizontally = function (that, backwards) {
        var focusGroupsInfo = that.model.focusGroupsInfo,
            focusGroupIndex = focusGroupsInfo.focusGroupIndex,
            focusGroups = focusGroupsInfo.focusGroups,
            delta = backwards ? -1 : 1,
            desiredGroupIndex;

        if (focusGroupIndex < 0) {
            desiredGroupIndex = backwards ? focusGroups.length - 1 : 0;
        } else {
            desiredGroupIndex = gpii.psp.modulo(focusGroupIndex + delta, focusGroups.length);
        }

        gpii.qss.qssFocusManager.focusNearestHorizontally(that, focusGroupsInfo, desiredGroupIndex, backwards);
    };
})(fluid, jQuery);
