/*!
GPII Application Logging
Copyright 2018 Raising the Floor - US

Licensed under the New BSD license. You may not use this file except in
compliance with this License.
The R&D that led to this software was funded by the Rehabilitation Services Administration,
 * US Dept of Education under grant H421A150006 (APCP), by the National Institute on Disability,
 * Independent Living, and Rehabilitation Research (NIDILRR), US Administration for
 * Independent Living & US Dept of Education under Grants H133E080022 (RERC-IT) and H133E130028/90RE5003-01-00
 * (UIITA-RERC), by the European Union's Seventh Framework Programme (FP7/2007-2013) grant agreement n° 289016 (Cloud4all)
 * and 610510 (Prosperity4All), by the Flora Hewlett Foundation, the Ontario Ministry of Research and Innovation,
 * and the Canadian Foundation for Innovation, by Adobe Foundation and the Consumer Electronics Association Foundation.
 * The opinions and results herein are those of the authors and not necessarily those of the funding agencies.
You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
*/
"use strict";

var fs = require("fs");
var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

var settingsDirComponent = gpii.settingsDir();
var gpiiSettingsDir = settingsDirComponent.getGpiiSettingsDir();

var startupTime = Date.now();
var logFileName = gpiiSettingsDir + "/log-" + gpii.journal.formatTimestamp(startupTime) + ".txt";

// Increase this limit to produce more verbose logs to aid debugging
fluid.logObjectRenderChars = 10240;

// Monkey-patch the core Infusion "doLog" implementation https://github.com/fluid-project/infusion/blob/master/src/framework/core/js/Fluid.js#L279
// Already monkey-patched once at https://github.com/fluid-project/infusion/blob/master/src/module/fluid.js#L161

fluid.doLog = function (args) {
    args = fluid.transform(args, fluid.renderLoggingArg);
    fs.appendFileSync(logFileName, args.join("") + "\n");
};
