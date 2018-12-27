/**
 * Undo stack component
 *
 * A component that represents a simple undo stack.
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
"use strict";

var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

/**
 * A simple wrapper of an array to simulate an undo stack. It simply stores a
 * number of reversible changes. If a change has to be undone, it is removed
 * from the stack and the `onChangeUndone` event is fired. It is up to the users
 * of the undo stack to define what the change object should contain and how
 * exactly the effect of the change should be undone when necessary.
 */
fluid.defaults("gpii.app.undoStack", {
    gradeNames: "fluid.modelComponent",

    model: {
        undoStack: [],
        hasChanges: false
    },

    events: {
        onChangeUndone: null
    },

    modelRelay: {
        hasChanges: {
            target: "hasChanges",
            singleTransform: {
                type: "fluid.transforms.free",
                func: "gpii.app.undoStack.hasChanges",
                args: ["{that}.model.undoStack"]
            },
            forward: {
                // on the initial step the `undoStack` is still `undefined`
                excludeSource: "init"
            }
        }
    },

    invokers: {
        undo: {
            funcName: "gpii.app.undoStack.undo",
            args: ["{that}"]
        },
        registerChange: {
            funcName: "gpii.app.undoStack.registerChange",
            args: [
                "{that}",
                "{arguments}.0" // change
            ]
        },
        clear: {
            changePath: "undoStack",
            value: []
        }
    }
});

/**
 * Removes the topmost change from the stack and fires the `onChangeUndone`
 * event with that change as an argument. This is essentially all that the
 * undo stack needs to do to consider that the change is reverted.
 * @param {Component} that - The `gpii.app.undoStack` instance.
 */
gpii.app.undoStack.undo = function (that) {
    var undoStack = fluid.copy(that.model.undoStack);

    if (undoStack.length === 0) {
        fluid.log("UndoStack: undoStack is empty.");
        return;
    }

    var undoChange = undoStack.pop();

    that.applier.change("undoStack", undoStack);

    that.events.onChangeUndone.fire(undoChange);
};

/**
 * Registers a single change in the undo stack.
 * @param {Component} that - The `gpii.app.undoStack` instance.
 * @param {Any} change - The change to be registered.
 */
gpii.app.undoStack.registerChange = function (that, change) {
    var undoStack = fluid.copy(that.model.undoStack);

    undoStack.push(change);
    that.applier.change("undoStack", undoStack);
};

/**
 * Returns whether there are changes in the undo stack.
 * @param {Any[]} undoStack - The array of the registered undoable changes
 * so far.
 * @return {Boolean} `true` if there is at least one registered undoable
 * change and `false` otherwise.
 */
gpii.app.undoStack.hasChanges = function (undoStack) {
    return undoStack.length > 0;
};
