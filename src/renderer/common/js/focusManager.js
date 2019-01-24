/**
 * Different types of focus managers
 *
 * Responsible for managing the focused element within a container.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid, jQuery */

"use strict";
(function (fluid, jQuery) {
    var gpii = fluid.registerNamespace("gpii");

    /**
     * A component responsible for managing focus within a container. All elements in the
     * container that can gain focus must have the class "fl-focusable". The currently
     * focused element (can be only one at any given time) will have the "fl-focused" class which
     * is simply a marker class used when computing which should be the next or previous element
     * to focus. The "fl-highlighted" class is added to a focused element if the element has gained
     * focus via keyboard interaction. This allows different CSS styles depending on whether the
     * element has been focused using the keyboard or via click/touch.
     *
     * This is the base grade for a focus manager which enables focusing of elements using the
     * Tab / Shift + Tab keys.
     */
    fluid.defaults("gpii.qss.focusManager", {
        gradeNames: ["fluid.viewComponent"],

        model: {
            focusableElements: [],
            // TODO default focus - 2 ?
            focusedElementData: {
                index: -1, // TODO use default
                element: null,
                isHighlighted: true
            }
        },

        styles: {
            focusable: "fl-focusable",
            focused: "fl-focused"
        },

        modelListeners: {
            "focusedElementData": {
                funcName: "gpii.qss.focusManager.handleFocusedElementChange",
                args: [
                    "{that}",
                    "{change}.value",
                    "{change}.oldValue"
                ],
                excludeSource: "init"
            },
            // TODO focusableElements
        },

        components: {
            windowKeyListener: {
                type: "fluid.component",
                options: {
                    gradeNames: "gpii.app.keyListener",
                    target: {
                        expander: {
                            funcName: "jQuery",
                            args: [window]
                        }
                    },
                    events: {
                        onTabPressed: null
                    }
                }
            }
        },
        events: {
            onTabPressed: "{windowKeyListener}.events.onTabPressed",
            onElementFocused: null, // TODO use modelListener
            onFocusLost: null
        },
        listeners: {
            // TODO are there other ways to update the dom (focusedItems) - setting gets updated?
            // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#Example
            //
            // TODO focus on create? should we focus an element when the focus manager is create (in some cases more likely not)
            "onCreate.prepareFocus": {
                func: "gpii.qss.focusManager.observeDomChanges",
                args: ["{that}"]
            },
            "onCreate.initFocusElements": {
                func: "{that}.updateFocusableElements"
            },

            "onTabPressed.impl": {
                func: "{that}.onTabPressed"
            },
            "onCreate.overrideDomInteractionHandlers": {
                funcName: "gpii.qss.focusManager.overrideDomInteractionHandlers",
                args: ["{that}"]
            },
            "onDestroy.restoreDomInteractionHandler": {
                funcName: "gpii.qss.focusManager.restoreDomInteractionHandler"
            }
        },
        invokers: {
            // DOM interactors
            updateFocusableElements: {
                funcName: "gpii.qss.focusManager.updateFocusableElements",
                args: ["{that}"]
            },
            applyFocus: {
                funcName: "gpii.qss.focusManager.applyFocus",
                args: [
                    "{that}",
                    "{arguments}.0"
                ]
            },
            clearFocus: {
                funcName: "gpii.qss.focusManager.clearFocus",
                args: [
                    "{that}",
                    "{arguments}.0"
                ]
            },

            updateFocusedElement: {
                funcName: "gpii.qss.focusManager.updateFocusedElement",
                args: [
                    "{that}",
                    "{arguments}.0", // index
                    "{arguments}.1"  // highlight
                ]
            },
            // TODO rename / split
            // TODO removeFocus / defocus
            removeHighlight: {
                funcName: "gpii.qss.focusManager.removeHighlight",
                args: [
                    "{that}",
                    "{arguments}.0" // clearFocus
                ]
            },
            isHighlighted: {
                funcName: "gpii.qss.focusManager.isHighlighted",
                args: [
                    "{that}",
                    "{arguments}.0" // element
                ]
            },
            isFocusable: {
                funcName: "gpii.qss.focusManager.isFocusable",
                args: [
                    "{arguments}.0", // element
                    "{that}.options.styles"
                ]
            },


            onTabPressed: {
                funcName: "gpii.qss.focusManager.onTabPressed",
                args: [
                    "{that}",
                    "{arguments}.0" // KeyboardEvent
                ]
            },
            //
            // Public
            //
            //
            focusElement: {
                funcName: "gpii.qss.focusManager.focusElement",
                args: [
                    "{that}",
                    "{arguments}.0", // element
                    "{arguments}.1"  // silentFocus
                ]
            },

            focusNext: {
                funcName: "gpii.qss.focusManager.focusNext",
                args: ["{that}"]
            },
            focusPrevious: {
                funcName: "gpii.qss.focusManager.focusPrevious",
                args: ["{that}"]
            }
        }
    });

    /**
     * observeDomChanges
     * @param that
     */
    gpii.qss.focusManager.observeDomChanges = function (that) {
        // TODO check whether the callback is triggered with init
        that.mutationObserver = new MutationObserver(that.updateFocusableElements);

        // Start observing the target node for configured mutations
        that.mutationObserver.observe(that.container[0], {
            childList: true, subtree: true
        });

        // TODO move to onDestroy
        // Later, you can stop observing
        // observer.disconnect();
    };

    /**
     * Adds the necessary listeners so that the default Tab key behavior is overridden and
     * also in order to detect clicks in the document. All listeners have the jQuery namespace
     * "focusManager" so that they can be easily deregistered.
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     */
    gpii.qss.focusManager.overrideDomInteractionHandlers = function (that) {
        $(document).on("keydown.focusManager", function (KeyboardEvent) {
            if (KeyboardEvent.key === "Tab") {
                KeyboardEvent.preventDefault();
            }
        });

        $(document).on("click.focusManager", function () {
            that.removeHighlight(false);
        });
    };

    /**
     * Deregisters the listeners related to the focus manager (i.e. listeners with the namespace
     * "focusManager") when the component is destroyed.
     */
    gpii.qss.focusManager.restoreDomInteractionHandler = function () {
        $(document).off(".focusManager");
    };

    gpii.qss.focusManager.handleFocusedElementChange = function (that, newFocusedElementData, oldFocusedElementData) {
        // we'd always want to clear the previous focused element
        if (oldFocusedElementData.element || !newFocusedElementData.isHighlighted) {
            that.clearFocus(oldFocusedElementData.element);
        }

        if (!newFocusedElementData.element) {
            that.events.onFocusLost.fire();
        } else if (newFocusedElementData.isHighlighted) {
            that.applyFocus(newFocusedElementData.element);

            // TODO
            // Notify with full element data (this is useful for positioning the tooltip)
            that.events.onElementFocused.fire(newFocusedElementData.element);
        }
        // every other cases don't need interaction with the DOM
    };

    /**
     * Focuses the given focusable element and optionally applies the keyboard navigation
     * highlight (the "fl-highlighted" class). Depending on the value of the `silentFocus`
     * argument, the `onElementFocused` event can be fired when the focusing process completes.
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     * @param {jQuery} element - A jQuery object representing the element to be focused.
     * @param {Boolean} applyHighlight - Whether the keyboard navigation highlight should be
     * applied to the element which is to be focused.
     * @param {Boolean} silentFocus - If `true` no event will be fired after the necessary UI
     * changes are made.
     */
    gpii.qss.focusManager.applyFocus = function (that, element) {
        jQuery(element)
            .addClass(that.options.styles.focused)
            .focus();
    };

    gpii.qss.focusManager.clearFocus = function (that, focusedElement) {
        jQuery(focusedElement).removeClass(that.options.styles.focused);
    };



    /**
     * TODO
     * Returns information about the focusable elements in the page as well as the index of
     * the currently focused element. The focusable elements are returned in the order in which
     * they appear in the page.
     * @param {jQuery} container - The jQuery element representing the container in which this
     * focus manager handles focus.
     * @param {Object} styles - A styles object containing various classes related to focusing
     * of elements
     * @return {Object} Information about the focusable elements.
     */
    gpii.qss.focusManager.updateFocusableElements = function (that) {
        var focusableElements = that.container.find("." + that.options.styles.focusable + ":visible");

        gpii.app.applier.replace(
            that.applier,
            "focusableElements",
            focusableElements.toArray()
        );
    };

    /**
     * Removes the keyboard navigation highlight (i.e. the "fl-highlighted" class) from all
     * focusable elements within the container of the focus manager and optionally clears
     * the marker "fl-focused" class.
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     * @param {jQuery} container - The jQuery element representing the container in which this
     * focus manager handles focus.
     * @param {Boolean} clearFocus - Whether the marker "fl-focused" class should be removed
     * as well.
     */
    gpii.qss.focusManager.removeHighlight = function (that, clearFocus) {
        that.updateFocusedElement(-1, !clearFocus);
    };

    /**
     * Focuses a focusable and visible element with a given index in the container and optionally applies
     * the keyboard navigation highlight (the "fl-highlighted" class).
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     * @param {jQuery} container - The jQuery element representing the container in which this
     * focus manager handles focus.
     * @param {Number} index - The index of the focusable element to be focused.
     * TODO is it needed?
     * @param {Boolean} highlight - Whether the keyboard navigation highlight should be
     * applied to the element which is to be focused.
     */
    gpii.qss.focusManager.updateFocusedElement = function (that, index, highlight) {
        highlight = fluid.isValue(highlight) ? highlight : true;

        var focusedElementData = {
            index: index,
            element: null,
            isHighlighted: highlight
        };

        if (index >= 0) {
            focusedElementData.element = that.model.focusableElements[index];
        }

        // XXX
        that.applier.change("focusedElementData", focusedElementData);
    };

    // TODO rename isSilent
    gpii.qss.focusManager.focusElement = function (that, element, isSilent) {
        var focusableElementIdx = that.model.focusableElements.findIndex(function (focusableElement) {
            return focusableElement === element;
        });

        if (focusableElementIdx >= 0) {
            that.updateFocusedElement(focusableElementIdx, !isSilent);
        }
    };

    /**
     * Focuses the next available visible focusable element. If the last focusable element has
     * been reached, the first element will be focused, then the second and so on. Note
     * that the keyboard navigation highlight will be applied in this case.
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     */
    gpii.qss.focusManager.focusNext = function (that) {
        var focusableElements = that.model.focusableElements,
            focusIndex = that.model.focusedElementData.index,
            nextIndex;

        if (focusIndex < 0) {
            nextIndex = 0;
        } else {
            nextIndex = gpii.psp.modulo(focusIndex + 1, focusableElements.length);
        }

        that.updateFocusedElement(nextIndex);
    };

    /**
     * Focuses the previous available focusable element. If the first focusable element has
     * been reached, the last element will be focused, then the last but one and so on. Note
     * that the keyboard navigation highlight will be applied in this case.
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     */
    gpii.qss.focusManager.focusPrevious = function (that) {
        var focusableElements = that.model.focusableElements,
            focusIndex = that.model.focusedElementData.index,
            previousIndex;

        if (focusIndex < 0) {
            previousIndex = focusableElements.length - 1;
        } else {
            previousIndex = gpii.psp.modulo(focusIndex - 1, focusableElements.length);
        }

        that.updateFocusedElement(previousIndex);
    };



    /**
     * Returns whether the provided `element` is focusable or not.
     * @param {HTMLElement | jQuery} element - A simple DOM element or wrapped in a jQuery
     * object.
     * @param {Object} styles - A styles object containing various classes related to focusing
     * of elements
     * @return {Boolean} `true` if the specified element is focusable and `false` otherwise.
     */
    // TODO rework; get rid of  - possibly find in the array
    gpii.qss.focusManager.isFocusable = function (element, styles) {
        element = jQuery(element);
        return element.hasClass(styles.focusable);
    };

    /**
     * Focuses the next available focusable element when the Tab key is pressed. If the Tab
     * key is pressed in conjunction with the Shift key, the previous focusable element will
     * receive the focus.
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     * @param {KeyboardEvent} KeyboardEvent - The event which triggered the invocation of this
     * function.
     */
    gpii.qss.focusManager.onTabPressed = function (that, KeyboardEvent) {
        if (KeyboardEvent.shiftKey) {
            that.focusPrevious();
        } else {
            that.focusNext();
        }
    };

    /**
     * Returns whether the given element has a keyboard navigation highlight.
     * @param {Component} that - The `gpii.qss.focusManager` instance.
     * @param {jQuery} element - A jQuery object representing the element to be checked.
     * @return {Boolean} `true` if the element has a keyboard navigation highlight and `false`
     * otherwise.
     */
    // TODO rework or get rid of
    gpii.qss.focusManager.isHighlighted = function (that, element) {
        var styles = that.options.styles;
        return element.hasClass(styles.focusable) &&
                element.hasClass(styles.focused) &&
                element.hasClass(styles.highlighted);
    };

    /**
     * An instance of a focus manager which enables focusing of elements both by using the Tab /
     * Shift + Tab keys and by using the Arrow Up and Arrow Down keys. Note that the keyboard
     * navigation highlight will be applied in this case.
     */
    fluid.defaults("gpii.qss.verticalFocusManager", {
        gradeNames: ["gpii.qss.focusManager"],
        components: {
            windowKeyListener: {
                options: {
                    events: {
                        onArrowDownPressed: null,
                        onArrowUpPressed: null
                    }
                }
            }
        },
        events: {
            onArrowUpPressed: "{windowKeyListener}.events.onArrowUpPressed",
            onArrowDownPressed: "{windowKeyListener}.events.onArrowDownPressed"
        },
        listeners: {
            // TODO update namespace
            "onArrowUpPressed.handleArrowUp": {
                func: "{that}.focusNextVertically"
            },
            "onArrowDownPressed.handleArrowDown": {
                func: "{that}.focusPreviousVertically"
            }
        },
        invokers: {
            focusNextVertically: {
                func: "{that}.focusNext"
            },
            focusPreviousVertically: {
                func: "{that}.focuPrevious"
            }
        }
    });

    /**
     * An instance of a focus manager which enables focusing of elements both by using the Tab /
     * Shift + Tab keys and by using the Arrow Left and Arrow Right keys.
     */
    fluid.defaults("gpii.qss.horizontalFocusManager", {
        gradeNames: ["gpii.qss.focusManager"],
        components: {
            windowKeyListener: {
                options: {
                    events: {
                        onArrowLeftPressed: null,
                        onArrowRightPressed: null
                    }
                }
            }
        },
        events: {
            onArrowLeftPressed: "{windowKeyListener}.events.onArrowLeftPressed",
            onArrowRightPressed: "{windowKeyListener}.events.onArrowRightPressed"
        },
        listeners: {
            "onArrowLeftPressed.handleArrowLeft": {
                func: "{that}.focusPreviousHorizontally"
            },
            "onArrowRightPressed.handleArrowLeft": {
                func: "{that}.focusNextHorizontally"
            }
        },
        invokers: {
            focusNextHorizontally: {
                func: "{that}.focusNext"
            },
            focusPreviousHorizontally: {
                func: "{that}.focusPrevious"
            }
        }
    });
})(fluid, jQuery);
