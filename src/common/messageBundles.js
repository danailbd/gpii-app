/**
 * The PSP Main component
 *
 * A component that represents the whole PSP. It wraps all of the PSP's functionality and also provides information on whether there's someone keyIn or not.
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

var gpii = fluid.registerNamespace("gpii");

/**
 * Holds all messages for the app (renderer included)
 */
fluid.defaults("gpii.app.messageBundles", {
    gradeNames: ["fluid.modelComponent"],

    model: {
        locale: "bg",

        // keep messages here in order to make use
        // of the model events system
        messages: {}
    },

    defaultLocale: "en_us",

    messageBundlesPath: "build/gpii-app-messageBundles.json",

    messageBundles: "@expand:gpii.app.messageBundles.loadMessageBundles({that}.options.messageBundlesPath)",

    modelListeners: {
        "locale": {
            func: "{that}.updateMessages"
        }
    },

    invokers: {
        updateMessages: {
            funcName: "gpii.app.messageBundles.updateMessages",
            args: [
                "{that}",
                "{that}.options.messageBundles",
                "{that}.model.locale",
                "{that}.options.defaultLocale"
            ]
        }
    },

    listeners: {
        "onCreate.distributeMessages": {
            funcName: "gpii.app.messageBundles.distributeMessages",
            args: ["{that}"]
        }
    }
});

gpii.app.messageBundles.loadMessageBundles = function (messageBundlesPath) {
    var resolvedPath = require("path").resolve(messageBundlesPath);
    return require(resolvedPath);
};

/**
 * Make a bulk update of the currently set translations
 *
 * TODO
 * @param that
 * @param messageBundles
 * @param locale
 * @param defaultLocale
 * @returns {undefined}
 */
gpii.app.messageBundles.updateMessages = function (that, messageBundles, locale, defaultLocale) {
    var messages = messageBundles[locale];

    if (!messages) {
        fluid.log(fluid.logLevel.WARN, "Bundles for locale - " + locale + " - are missing. Using default locale of: " + defaultLocale);
        messages = messageBundles[defaultLocale];
    }

    var groupedMessages = gpii.app.messageBundles.groupMessagesByComponent(messages);
    that.applier.change("messages", groupedMessages);
};

gpii.app.messageBundles.getComponentKey = function (messageKey) {
    var keyDelimiterIndex = messageKey.lastIndexOf("_");
    return messageKey.slice(0, keyDelimiterIndex);
};

gpii.app.messageBundles.getSimpleMessageKey = function (messageKey) {
    var keyDelimiterIndex = messageKey.lastIndexOf("_");
    return messageKey.slice(keyDelimiterIndex + 1);
};

gpii.app.messageBundles.groupMessagesByComponent = function (messages) {
    var groupedMessages = {};

    fluid.each(messages, function (value, key) {
        var componentKey = gpii.app.messageBundles.getComponentKey(key),
            simpleMessageKey = gpii.app.messageBundles.getSimpleMessageKey(key),
            messageObj = {};

        messageObj[simpleMessageKey] = value;
        groupedMessages[componentKey] = fluid.extend(true, {}, groupedMessages[componentKey], messageObj);
    });
    return groupedMessages;
};

gpii.app.messageBundles.getMessageDistributions = function (that) {
    var currentLocale = that.model.locale,
        currentMessages = that.options.messageBundles[currentLocale],
        groupedMessages = gpii.app.messageBundles.groupMessagesByComponent(currentMessages),
        dependentPath = "{/ %componentName}.options.model.messages",
        binding = "{%messageBundle}.model.messages.%componentKey";

    return fluid.keys(groupedMessages).reduce(function (distributions, componentKey) {
        var messages = groupedMessages[componentKey],
            componentName = componentKey.replace(/_/g, ".");

        distributions[componentName] = {
            target: fluid.stringTemplate(dependentPath, {componentName: componentName}),
            record: fluid.stringTemplate(binding, {
                messageBundle: that.typeName,
                componentKey: componentKey
            })
        };

        return distributions;
    }, {});
};

gpii.app.messageBundles.distributeMessages = function (that) {
    var distributeOptions = gpii.app.messageBundles.getMessageDistributions(that);

    fluid.construct(fluid.pathForComponent(that).concat(["messageDistributor"]), {
        type: "fluid.component",
        distributeOptions: distributeOptions
    });
};
