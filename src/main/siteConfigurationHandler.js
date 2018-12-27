/**
 * The site config handler
 *
 * Introduces a component that loads the "site config" and distributes its values.
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

    saveSettingPath: "save",

    distributeOptions: {
        distributeSaveSettings: {
            record: {
                expander: {
                    funcName: "gpii.app.siteConfigurationHandler.getSaveDistribution",
                    args: [
                        "{that}.options.saveSettingPath",
                        "{that}.options.siteConfig.hideQssSaveButton"
                    ]
                }
            },
            target: "{app qssWrapper}.options.settingOptions.hiddenSettings"
        },
        distributeQssConfig: {
            record: "{that}.options.siteConfig.qss",
            target: "{app qssWrapper}.options.siteConfig"
        },
        distributeLanguageLabelTemplate: {
            record: "{that}.options.siteConfig.qss.languageOptionLabel",
            target: "{app qssWrapper}.options.settingOptions.languageOptionLabelTemplate"
        },
        distributeDefaultLanguage: {
            record: "{that}.options.siteConfig.qss.defaultLanguage",
            target: "{app qssWrapper}.options.settingOptions.defaultLanguage"
        },
        distributePspConfig: {
            record: "{that}.options.siteConfig.psp",
            target: "{app psp}.options.siteConfig"
        },
        distributeDialogScaleFactor: {
            record: "{app}.configurationHandler.options.siteConfig.psp.scaleFactor",
            target: "{app dialogManager}.options.model.scaleFactor"
        },
        distributeQssMorePanelConfig: {
            record: "{that}.options.siteConfig.qssMorePanel",
            target: "{app qssMorePanel}.options.siteConfig"
        },
        distributeQssClickOutside: {
            record: "{that}.options.siteConfig.closeQssOnClickOutside",
            target: "{app gpiiConnector}.options.defaultPreferences.closeQssOnBlur"
        },
        distributePspClickOutside: {
            record: "{that}.options.siteConfig.closePspOnClickOutside",
            target: "{app gpiiConnector}.options.defaultPreferences.closePspOnBlur"
        },
        distributeOpenQssShortcut: {
            record: "{that}.options.siteConfig.openQssShortcut",
            target: "{app gpiiConnector}.options.defaultPreferences.gpiiAppShortcut"
        },
        distributeDisableRestartWarning: {
            record: "{that}.options.siteConfig.disableRestartWarning",
            target: "{app gpiiConnector}.options.defaultPreferences.disableRestartWarning"
        },
        distributeSurveyTriggersUrl: {
            record: "{that}.options.siteConfig.surveyTriggersUrl",
            target: "{app surveyConnector}.options.config.surveyTriggersUrl"
        },
        distributeAboutDialogConfig: {
            record: "{that}.options.siteConfig.aboutDialog",
            target: "{app aboutDialog}.options.siteConfig"
        }
    }
});

/**
 * Get value for hiding the save button in QSS.
 * @param {String} saveSettingPath - The path for the "Save" button setting
 * @param {Boolean} shouldHideSaveButton - Whether the save button should be hidden or not
 * @return {String[]} - In case it should be hidden, return the "Save" setting's path
 */
gpii.app.siteConfigurationHandler.getSaveDistribution = function (saveSettingPath, shouldHideSaveButton) {
    return shouldHideSaveButton ? [saveSettingPath] : [];
};
