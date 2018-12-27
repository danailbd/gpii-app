/**
 * The PSP Assets Manager
 *
 * A component which manages application assets.
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

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii");

/**
 * A component which manages application assets. Contains means for resolving
 * an asset's path given its name and the `assetsDir` which is a configurable
 * option for the component.
 */
fluid.defaults("gpii.app.assetsManager", {
    gradeNames: "fluid.component",

    assetsDir: "%gpii-app/src/assets/",

    invokers: {
        resolveAssetPath: {
            funcName: "gpii.app.assetsManager.resolveAssetPath",
            args: [
                "{that}.options.assetsDir",
                "{arguments}.0" // filename
            ]
        }
    }
});

/**
 * Returns the absolute path to an asset given its `filename` and the absolute
 * path of the assets directory. The latter can be prefixed with a module name.
 * @param {String} assetsDir - The path (possibly starting with a module name) to
 * the assets folder.
 * @param {String} filename - The simple name of the asset including the extension.
 * @return {String} the absolute path to the asset.
 */
gpii.app.assetsManager.resolveAssetPath = function (assetsDir, filename) {
    return fluid.module.resolvePath(assetsDir + filename);
};
