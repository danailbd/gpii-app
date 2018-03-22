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
    gradeNames: ["fluid.modelComponent", "gpii.psp.i18n"],

    model: {
        locale: "bg",

        // keep messages here in order to make use
        // of the model events system
        messages: {}
    },

    defaultLocale: "en_us",

    // messageBundles: <%= compiledMessageBundles %>,
    messageBundles: {
        "en_us": {
            // TODO naming
            "gpii_app_menu_open-psp": "Open PSP",
            "gpii_app_menu_status_keyed_in": "Keyed in with %snapsetName",
            "gpii_app_menu_status_not_keyed": "(No one keyed in)",
            "gpii_app_menu_keyed_out_btn": "Key-out of GPII",

            gpii_app_restartWarning_restartTitle: "Changes require restart",
            gpii_app_restartWarning_osRestartText: "Windows needs to restart to apply your changes.",
            gpii_app_restartWarning_restartText: "In order to be applied, some of the changes you made require the following applications to restart:",
            gpii_app_restartWarning_restartQuestion: "What would you like to do?",

            gpii_app_restartWarning_undo: "Cancel\n(Undo Changes)",
            gpii_app_restartWarning_restartLater: "Close and\nRestart Later",
            gpii_app_restartWarning_restartNow: "Restart Now"
        },
        "bg": {
            // персонален панел за настройки
            "gpii_app_menu_open-psp": "Отвори ППН",
            "gpii_app_menu_status_not_keyed": "(Не сте влезли)",
            "gpii_app_menu_status_keyed_in": "Вписан с %snapsetName",
            "gpii_app_menu_keyed_out_btn": "Отписване от GPII",

            gpii_app_restartWarning_restartTitle: "Промените изискват рестартиране.",
            gpii_app_restartWarning_osRestartText: "Windows изисква да бъде рестартиран, за да се приложат настройките.",
            gpii_app_restartWarning_restartText: "За да могат част от вашите настройки да бъдат приложени, следните приложения трябва да бъдат презаредени:",
            gpii_app_restartWarning_restartQuestion: "Какво бихте желали да направите?",

            gpii_app_restartWarning_undo: "Отказ\n(Отменете промените)",
            gpii_app_restartWarning_restartLater: "Затваряне и\n рестартиране по-късно",
            gpii_app_restartWarning_restartNow: "Рестартиране сега"
        }
    },

    modelListeners: {
        "locale": {
            func: "{that}.updateMessages"
        }
    },

    listeners: {
        // XXX DEV
        onCreate: {
            this: "console",
            method: "log",
            args: "===========HERE=============="
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
    }
});

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

    var groupedMessages = gpii.app.messageBundles.getMessagesGroupedByComponent(messages);

    that.applier.change("messages", groupedMessages);
};

gpii.app.messageBundles.getComponentName = function (messageKey) {
    var keyDelimiterIndex = messageKey.lastIndexOf("_");
    return messageKey.slice(0, keyDelimiterIndex);
};

gpii.app.messageBundles.getSimpleMessageKey = function (messageKey) {
    var keyDelimiterIndex = messageKey.lastIndexOf("_");
    return messageKey.slice(keyDelimiterIndex + 1);
};

gpii.app.messageBundles.getMessagesGroupedByComponent = function (messages) {
    var groupedMessages = {};

    fluid.each(messages, function (value, key) {
        var componentName = gpii.app.messageBundles.getComponentName(key),
            simpleMessageKey = gpii.app.messageBundles.getSimpleMessageKey(key),
            messageObj = {};

        messageObj[simpleMessageKey] = value;
        groupedMessages[componentName] = fluid.extend(true, {}, groupedMessages[componentName], messageObj);
    });
    return groupedMessages;
};


fluid.defaults("gpii.psp.i18n", {
    gradeNames: ["fluid.modelComponent"],

    listeners: {
        "onCreate.distributeMessagesBinding": {
            funcName: "gpii.psp.i18n.distributeBindingsAndReconstruct",
            args: ["{that}"]
        }
    }
});

gpii.psp.i18n.distributeBindingsAndReconstruct = function (that) {
    if (that.options.distributed) {
        return;
    }

    console.log("====UPON DISTRIBUTION", that.model.messages);
    var messagesBindingsDistributions = {};

    var defaultLocale = that.options.defaultLocale;
    var defaultLocaleMessages = that.options.messageBundles[defaultLocale];
    var groupedMessages = gpii.app.messageBundles.getMessagesGroupedByComponent(defaultLocaleMessages);
    var dependetCompEl = "{/ %typeName}.options.model.messages";
    var binding = "{%messageBundle}.model.messages.%typeName";

    // TODO reduce
    fluid.each(groupedMessages, function (bundle, typeName) {
        console.log("TypeName: ", typeName, "Bundle: ", bundle, "\n");
        var componentName = typeName.replace(/_/g, ".");

        messagesBindingsDistributions[componentName] = { // typeName + "MessagesDistribution"
            target: fluid.stringTemplate(dependetCompEl, { typeName: componentName }),
            record: fluid.stringTemplate(binding, {
                messageBundle: that.typeName,
                typeName: typeName
            })
        }
    });


    console.log("======DISTRIBUTIONS", messagesBindingsDistributions);

    var newly = fluid.construct(fluid.pathForComponent(that), {
        type: that.typeName,
        distributed: true,

        distributeOptions: messagesBindingsDistributions
    });
};
