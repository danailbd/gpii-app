/**
 * A connector for survey related operations
 *
 * Responsible for requesting survey triggers, notifying that the desired conditions have
 * been met and instructing the PSP what survey to show.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    request = require("request"),
    URL = require("url").URL,
    URLSearchParams = require("url").URLSearchParams;

/**
 * A component which is responsible for:
 * 1. Requesting the survey data when a user keys in (see the `requestSurveyData` invoker).
 * 2. Firing an event (`onTriggerDataReceived`) when the triggers data is received.
 * 3. Informing the interested parties that a survey trigger has occurred (see the
 * `notifyTriggerOccurred` invoker).
 * 4. Firing an event (`onSurveyRequired`) when a survey needs to be shown by the PSP.
 *
 * This component does not provide an implementation for its invokers, nor does it fire the
 * events mentioned above on its own. The `gpii.app.dynamicSurveyConnector` is currently the only
 * implementation - survey and trigger payloads are fetched from a remote location.
 *
 * The `surveyConnector` should request the survey data by appending the `keyedInUserToken`, the
 * `machineId` and the `language` to the query string in the corresponding urls.
 *
 * The server would return an array of trigger objects in the following format:
 *     {
 *         id: <trigger_id>, // mandatory, used to distinguish the triggers
 *         conditions: {
 *             // lists all conditions that need to be satisfied for this trigger
 *         }
 *     }
 *
 * When the conditions for a survey trigger have been satisfied, the `surveyConnector`
 * would issue a request to the corresponding server route with the following JSON parameter:
 *     {
 *         trigger: <triggerObject> // the trigger which has occurred
 *     }
 *
 * Finally, the message that the survey server will send in order for the PSP to show a survey would
 * look like this:
 *    {
 *        url: <the Qualtrics survey's URL>,
 *        closeOnSubmit: <true | false> // whether the survey should close automatically when completed
 *        window: { // parameters for the `BrowserWindow` in which the survey would open
 *            // Below are given some configuration parameters with their default values
 *            width: 800,
 *            height: 600,
 *            resizable: true,
 *            title: "Morphic Survey",
 *            closable: true, // whether the survey can be closed via a button in the titlebar
 *            minimizable: false, // whether the survey can be minimized via a button in the titlebar
 *            maximizable: false // whether the survey can be maximied via a button in the titlebar
 *        }
 *    }
 * Any valid configuration option for the `BrowserWindow` can also be specified in the `window`
 * object of the payload above without the need for any further actions on the PSP's side.
 */
fluid.defaults("gpii.app.surveyConnector", {
    gradeNames: ["fluid.modelComponent"],
    qssSettingPrefix: "http://registry\\.gpii\\.net/common/",

    model: {
        machineId: null,
        keyedInUserToken: null,
        qssSettings: []
    },

    events: {
        onSurveyRequired: null,
        onTriggerDataReceived: null
    },

    invokers: {
        requestSurveyData: {
            funcName: "fluid.identity",
            args: ["{that}", "{that}.model"]
        },
        notifyTriggerOccurred: {
            funcName: "fluid.identity",
            args: [
                "{that}",
                "{arguments}.0" // trigger
            ]
        }
    }
});

/**
 * This function produces the URL of the survey which is to be displayed by adding
 * any additional information that is necessary. The URL is created as follows:
 * 1. The URL from the survey fixture is used at first.
 * 2. The "keyedInUserToken" and the "machineId" are added to the search portion
 * of the URL.
 * 3. All QSS settings whose values have been modified by the user are also added
 * to the search part of the URL.
 * @param {Component} that - The `gpii.app.staticSurveyConnector` instance.
 * @param {Object} fixture - An object describing the survey which is to be shown.
 * @param {String} fixture.url - The URL of the survey to be loaded.
 * @return {String} The URL with all additional information of the survey to be shown.
 */
gpii.app.surveyConnector.getSurveyUrl = function (that, fixture) {
    var url = new URL(fixture.url),
        searchParams = new URLSearchParams(),
        qssSettingPrefix = that.options.qssSettingPrefix;

    searchParams.set("keyedInUserToken", that.model.keyedInUserToken);
    searchParams.set("machineId", that.model.machineId);

    fluid.each(that.model.qssSettings, function (setting) {
        var path = setting.path,
            value = setting.value,
            defaultValue = setting.schema["default"];

        // in case a setting is disabled its path would be null
        if (path && path.startsWith(qssSettingPrefix) && !fluid.model.diff(value, defaultValue)) {
            var settingKey = path.slice(qssSettingPrefix.length);
            searchParams.set(settingKey, value);
        }
    });

    url.search = searchParams;

    return url.toString();
};

/**
 * Serves triggers and survey payloads from a remote location using the `request`
 * module.
 */
fluid.defaults("gpii.app.dynamicSurveyConnector", {
    gradeNames: ["gpii.app.surveyConnector"],

    // Contains pending requests for fetching trigger and survey data. In case the user
    // keys out, these requests should be aborted.
    members: {
        pendingRequests: [],
        surveyPayloads: {}
    },

    config: {  // will be distributed from the siteConfig.json5
        surveyTriggersUrl: null,
        surveyPayloadsUrl: null
    },

    modelListeners: {
        "{app}.model.keyedInUserToken": {
            func: "{that}.abortPendingRequests"
        }
    },

    invokers: {
        requestSurveyData: {
            funcName: "gpii.app.dynamicSurveyConnector.requestSurveyData",
            args: [
                "{that}",
                "{that}.options.config"
            ]
        },
        notifyTriggerOccurred: {
            funcName: "gpii.app.dynamicSurveyConnector.notifyTriggerOccurred",
            args: [
                "{that}",
                "{arguments}.0" // triggerPayload
            ]
        },
        abortPendingRequests: {
            funcName: "gpii.app.dynamicSurveyConnector.abortPendingRequests",
            args: ["{that}"]
        }
    }
});

/**
 * Retrieves data from a remote location.
 * @param {Component} that - The `gpii.app.dynamicSurveyConnector` instance.
 * @param {String} url - The URL of the data to be retrieved.
 * @return {Promise} - A promise which will be resolved (with the data) or
 * rejected depending on the outcome of the operation.
 */
gpii.app.dynamicSurveyConnector.requestData = function (that, url) {
    var togo = fluid.promise(),
        pendingRequest = request(url, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                fluid.log(fluid.logLevel.WARN, "Survey connector: Cannot get trigger data ", response.statusCode, error);
                togo.reject();
            } else {
                try {
                    var parsedResponse = JSON.parse(body);
                    togo.resolve(parsedResponse);
                } catch (parsingError) {
                    fluid.log(fluid.logLevel.WARN, "Survey connector: Error parsing trigger data", parsingError, body);
                    togo.reject();
                }
            }
        });

    that.pendingRequests.push(pendingRequest);

    return togo;
};

/**
 * Used to retrieve the survey triggers and survey payloads from a remote location.
 * Note that survey data will always be fetched when a new user keys in (including the
 * "noUser"). This means that if the payload residing in the remote location changes
 * between two key-ins, then the surveys will also be different (i.e. survey triggers
 * are not cached).
 * @param {Component} that - The `gpii.app.dynamicSurveyConnector` instance.
 * @param {Object} config - The configuration object for the `surveyConnector` instance.
 */
gpii.app.dynamicSurveyConnector.requestSurveyData = function (that, config) {
    fluid.promise.sequence([
        gpii.app.dynamicSurveyConnector.requestData(that, config.surveyTriggersUrl),
        gpii.app.dynamicSurveyConnector.requestData(that, config.surveyPayloadsUrl)
    ]).then(function (results) {
        // Save surveys first because there might be a trigger which occurs immediately after registration
        that.surveyPayloads = results[1];
        that.events.onTriggerDataReceived.fire(results[0]);
    }, function () {
        that.abortPendingRequests();
    });
};

/**
 * Should be called when a trigger's conditions are met. At this point, the survey payloads
 * have been fetched and this function should find the correct payload based on the trigger
 * which has occurred and should then fire the `onSurveyRequired` with the survey payload.
 * @param {Component} that - The `gpii.app.dynamicSurveyConnector` instance.
 * @param {Object} triggerPayload - An object describing the trigger whose
 * conditions have been met.
 */
gpii.app.dynamicSurveyConnector.notifyTriggerOccurred = function (that, triggerPayload) {
    var surveyFixture = fluid.copy(that.surveyPayloads)[triggerPayload.id];

    fluid.log("StaticSurveyConnector: Trigger occurred - " + triggerPayload);

    if (surveyFixture) {
        surveyFixture.url = gpii.app.surveyConnector.getSurveyUrl(that, surveyFixture);
        that.events.onSurveyRequired.fire(surveyFixture);
    } else {
        fluid.fail("StaticSurveyConnector: Missing survey for trigger: " + triggerPayload.id);
    }
};

/**
 * Whenever a user keys out, this function takes care of aborting any pending requests for
 * fetching triggers and/or survey payloads data.
 * @param {Component} that - The `gpii.app.dynamicSurveyConnector` instance.
 */
gpii.app.dynamicSurveyConnector.abortPendingRequests = function (that) {
    fluid.each(that.pendingRequests, function (pendingRequest) {
        pendingRequest.abort();
    });

    that.pendingRequests = [];
    that.surveyPayloads = {};
};

/**
 * TODO:
 * 1. Improve documentation at the beginning
 * 2. Possibly rename abortPendingRequests
 * 3. Test edge cases (delays, one promise succeeds, another one fails)
 * 4. Write tests
 */
