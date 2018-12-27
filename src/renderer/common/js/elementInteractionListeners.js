/**
 * Interactions listeners
 *
 * Generic components for DOM element interaction events.
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
     * A component whose container can be clicked. Whenever such an interaction
     * occurs, the `onClicked` event will be fired.
     */
    fluid.defaults("gpii.app.clickable", {
        events: {
            onClicked: null
        },

        listeners: {
            "onCreate.addClickHandler": {
                this: "{that}.container",
                method: "click",
                args: "{that}.events.onClicked.fire"
            }
        }
    });

    /**
     * A component whose container can be hovered. When the mouse pointer enters the
     * DOM element, the `onMouseEnter` event will be fired. After that, when the mouse
     * pointer is no longer within the element's container, the `onMouseLeave` event
     * will be fired.
     */
    fluid.defaults("gpii.app.hoverable", {
        events: {
            onMouseEnter: null,
            onMouseLeave: null
        },

        listeners: {
            "onCreate.addHoverHandler": {
                this: "{that}.container",
                method: "hover",
                args: [
                    "{that}.events.onMouseEnter.fire",
                    "{that}.events.onMouseLeave.fire"
                ]
            }
        }
    });

    /**
     * Register keyup events on a DOM element. Once a key is pressed the and the
     * corresponding event is registered in the component's configuration, the
     * latter will be fired.
     * Every special component event follow the format: `on<KeyName>Pressed`
     * where the available <KeyName>s can be viewed here:
     * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
     *
     * Expects either a target (jquery element) to be given or the implementor's
     * component to have container (i.e. to be a `fluid.viewComponent`).
     *
     * Note: The <KeyName> for the space bar is "Spacebar", which differs from the name
     * in the specification which is simply " "
     */
    fluid.defaults("gpii.app.keyListener", {

        events: {}, // given by implementor

        target: null,

        // Some keys lack descriptive names so we attach such to them
        specialKeyEvents: {
            " ": "Spacebar",
            "+": "Add",
            "-": "Subtract",
            "=": "Equals"
        },

        listeners: {
            "onCreate.addKeyPressHandler": {
                funcName: "gpii.app.keyListener.registerListener",
                args: ["{that}"]
            },
            "onDestroy.clearListeners": {
                funcName: "gpii.app.keyListener.deregisterListener",
                args: ["{that}"]
            }
        },

        invokers: {
            registerKeyPress: {
                funcName: "gpii.app.keyListener.registerKeyPress",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    /**
     * Registers a `keyup` listener either for the specified `target` in
     * the component's configuration or for the component's container.
     * @param {Component} that - The `gpii.app.keyListener` instance.
     */
    gpii.app.keyListener.registerListener = function (that) {
        var target = that.options.target || that.container;

        target.on("keyup", that.registerKeyPress);
    };

    /**
     * Deregisters the `keyup` listener for the specified `target` in
     * the component's configuration or for the component's container.
     * @param {Component} that - The `gpii.app.keyListener` instance.
     */
    gpii.app.keyListener.deregisterListener = function (that) {
        var target = that.options.target || that.container;

        target.off("keyup", that.registerKeyPress);
    };

    /**
     * The function which will actually handle a key press.
     * @param {Component} that - The `gpii.app.keyListener` instance.
     * @param {KeyboardEvent} KeyboardEvent - The keyboard event that has been triggered.
     */
    gpii.app.keyListener.registerKeyPress = function (that, KeyboardEvent) {
        // Make use of a relatively new feature https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
        // The full list of key names can be view here: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
        // To ensure a proper name for an event is given, override some keys' event
        var keyName = that.options.specialKeyEvents[KeyboardEvent.key] || KeyboardEvent.key;

        var eventName = "on" + keyName + "Pressed";

        // Check whether such key press is observed
        if (that.events[eventName]) {
            that.events[eventName].fire(KeyboardEvent);
        }
    };

    /**
     * Represents a visual component which can be activated by clicking its
     * container or by pressing Enter or Spacebar. The implementors have to
     * provide the behavior for the `activate` invoker.
     */
    fluid.defaults("gpii.app.activatable", {
        gradeNames: [
            "gpii.app.keyListener",
            "gpii.app.clickable",
            "fluid.viewComponent"
        ],

        events: {
            onSpacebarPressed: null,
            onEnterPressed: null
        },

        attrs: {
            // User provided attrs such as aria-*
        },

        listeners: {
            "onCreate.addAttrs": {
                "this": "{that}.container",
                method: "attr",
                args: ["{that}.options.attrs"]
            },

            "onClicked.activate": {
                func: "{that}.activate",
                args: [
                    {key: null}
                ]
            },
            "onSpacebarPressed.activate": {
                func: "{that}.activate",
                args: [
                    {key: "Spacebar"}
                ]
            },
            "onEnterPressed.activate": {
                func: "{that}.activate",
                args: [
                    {key: "Enter"}
                ]
            }
        },

        invokers: {
            activate: {
                func: "fluid.notImplemented"
            }
        }
    });
})(fluid);
