/**
 * Generic utilities for the renderer
 *
 * Contains utility functions and components shared between different BrowserWindows.
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

/* global fluid, jQuery */

"use strict";
(function (fluid, jQuery) {
    var gpii = fluid.registerNamespace("gpii"),
        shell = require("electron").shell;


    fluid.registerNamespace("gpii.psp");

    /**
     * An implementation of the modulation operation which resolves the
     * notorious "JavaScrip Modulo bug".
     * @param {Number} a - The dividend
     * @param {Number} b - The divisor
     * @return {Number} The remainder - a number in the range [0, Math.abs(b) - 1]
     */
    gpii.psp.modulo = function (a, b) {
        return ((a % b) + b) % b;
    };

    /**
     * Opens the passed url externally using the default browser for the
     * OS (or set by the user).
     * @param {String} url - The url to open externally.
     */
    gpii.psp.openUrlExternally = function (url) {
        shell.openExternal(url);
    };

    /**
     * Plays a sound identified by an absolute path or a URL to it.
     * @param {String} soundPath - The path or URL of the sound to play.
     */
    gpii.psp.playSound = function (soundPath) {
        if (soundPath) {
            var sound = new Audio(soundPath);
            sound.play();
        }
    };

    /**
     * Replaces all anchor tags that are not "#" links to open in an
     * external browser.
     */
    gpii.psp.interceptLinks = function () {
        jQuery(document).on("click", "a:not([href^='#'])", function (event) {
            event.preventDefault();
            gpii.psp.openUrlExternally(this.href);
        });
    };

    /**
     * A wrapper that adds the replacing of the normal behaviour
     * of all anchor tags to open the specified link in an external
     * (default) browser.
     */
    fluid.defaults("gpii.psp.linksInterceptor", {
        listeners: {
            "onCreate.interceptLinks": {
                funcName: "gpii.psp.interceptLinks"
            }
        }
    });

    /**
     * Render text for DOM elements referenced by component's
     * selectors. It simply adds text (using jquery .text method)
     * to every selector element in case there exists a string
     * by the same name as the selector's.
     * This is done with the only `renderText` invoker which needs the
     * map of strings to be given. In case these strings need to be
     * interpolated, optionally a "values" map can also be given.
     */
    fluid.defaults("gpii.psp.selectorsTextRenderer", {
        enableRichText: false,

        model: {
            messages: null,
            // list of values to be used for messages interpolation
            values: null
        },
        modelListeners: {
            // Any change means that the whole view should be re-rendered
            // messages are a default option as it is most likely that
            // we'll need these to be re-rendered
            "messages": {
                funcName: "{that}.renderText",
                args: [
                    "{that}.model.messages",
                    "{that}.model.values"
                ],
                namespace: "renderText"
            }
        },
        invokers: {
            // This is to be used with model listeners
            renderText: {
                funcName: "gpii.psp.selectorsTextRenderer.renderText",
                args: [
                    "{that}",
                    "{that}.options.enableRichText",
                    "{that}.options.selectors",
                    "{arguments}.0", // strings
                    "{arguments}.1"  // values (used for interpolation)
                ]
            }
        }
    });

    /**
     * Sets (rich) text to dom elements using jQuery.
     * Text is added to an element ONLY if a string with the same name as the element's
     * selector property exists.
     * Example:
     *  selector - { signInHeader: ".flc-signInHeader" }
     *  uses a message of the type - { signInHeader: "Header text" }
     *
     * @param {Component} that - The `gpii.psp.signIn` instance.
     * @param {Boolean} enableRichText - Whether the strings can include rich text (e.g.
     * formatting markup). If `true`, measures will be taken to prevent possible scripts
     * in the message from executing.
     * @param {Object} selectors - The viewComponent's selectors
     * @param {Object} strings - The strings to be used for rendering
     * @param {Object} [values] - The value to be used for interpolation of the strings. This
     * is passed as it is to the `fluid.stringTemplate` method, meaning that the names must match.
     */
    gpii.psp.selectorsTextRenderer.renderText = function (that, enableRichText, selectors, strings, values) {
        if (!strings) {
            return;
        }

        fluid.each(selectors, function (value, key) {
            var element = that.dom.locate(key),
                message = strings[key];
            if (element && fluid.isValue(message)) {
                // interpolate the string with missing values
                message = fluid.stringTemplate(message, values || {});
                if (enableRichText) {
                    // Use parseHTML to prevent scripts from executing.
                    var parsedMessage = jQuery.parseHTML(message);
                    element.html(parsedMessage);
                } else {
                    element.text(message);
                }
            }
        });
    };
})(fluid, jQuery);
