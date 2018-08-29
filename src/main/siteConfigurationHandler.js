/**
 * The site config handler
 *
 * Introduces a component that loads the "site config" and distributes its values.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");

// already added in app.js
// require("json5/lib/register");


/**
 * Take care of the "site configuration" for the gpii-app. It is responsible of loading the config
 * and distributing these options to the proper places. It translates the config values to the
 * proper options that the affected components use.
 */
fluid.defaults("gpii.app.siteConfigurationHandler", {
    gradeNames: ["fluid.component"],

    siteConfigPath: "%gpii-app/siteconfig.json5",
    siteConfig: "@expand:fluid.require({that}.options.siteConfigPath)",

    distributeOptions: {
        distributeSaveSettings: {
            record: "@expand:gpii.app.siteConfigurationHandler.getSaveDistribution({that}.options.siteConfig.disableQssSaveButton)",
            target: "{app qssWrapper}.options.settingOptions.disabledSettings"
        }
    }
});

/**
 * Get value for disabling the save button in QSS.
 * @param {Boolean} shouldDisableSaveButton - Whether that option is enabled and should be applied
 * @return {String[]} - In case it should be disabled, return the path the save setting
 */
gpii.app.siteConfigurationHandler.getSaveDistribution = function (shouldDisableSaveButton) {
    return shouldDisableSaveButton ? ["save"] : [];
};