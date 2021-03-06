/**
 * Initializes the QuickSetStrip widget window
 *
 * Creates the Quick Set Strip widget once the document has been loaded.
 * Copyright 2017 Raising the Floor - International
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");

    /**
     * A wrapper for the QSS widget which enables internationalization.
     */
    fluid.defaults("gpii.psp.translatedQssWidget", {
        gradeNames: ["gpii.psp.messageBundles", "fluid.viewComponent", "gpii.psp.linksInterceptor"],

        // may be given from the main process
        params: {
            sounds: null
        },

        components: {
            qssWidget: {
                type: "gpii.psp.qssWidget",
                container: "{translatedQssWidget}.container",
                options: "{translatedQssWidget}.options.params"
            }
        }
    });

    /**
     * A wrapper for the QSS widget (either a menu or a stepper) which also contains
     * the necessary components for managing focus, communication with the main process,
     * showing the "Learn more" links, etc.
     */
    fluid.defaults("gpii.psp.qssWidget", {
        gradeNames: ["fluid.viewComponent"],

        model: {
            setting: {}
        },

        selectors: {
            stepper: ".flc-qssStepperWidget",
            menu: ".flc-qssMenuWidget"
        },

        events: {
            onWidgetClosed: null,
            onSettingUpdated: null,
            onQssWidgetSettingAltered: null,
            onQssWidgetNotificationRequired: null,
            onQssWidgetCreated: null
        },

        sounds: {},

        components: {
            titlebar: {
                type: "gpii.psp.titlebar",
                container: ".flc-titlebar",
                options: {
                    events: {
                        onClose: null
                    },
                    listeners: {
                        onClose: {
                            funcName: "gpii.psp.qssWidget.close",
                            args: [
                                "{qssWidget}",
                                "{arguments}.0" // KeyboardEvent
                            ]
                        }
                    }
                }
            },
            widget: {
                type: "@expand:gpii.psp.qssWidget.getWidgetType({arguments}.0)",
                createOnEvent: "onSettingUpdated",
                container: "@expand:gpii.psp.qssWidget.getWidgetContainer({arguments}.0, {qssWidget}.dom.stepper, {qssWidget}.dom.menu)",
                options: {
                    sounds: "{qssWidget}.options.sounds",
                    activationParams: "{arguments}.1",
                    model: {
                        setting: "{qssWidget}.model.setting",
                        messages: {
                            tip: "{qssWidget}.model.setting.tip",
                            learnMore: "{qssWidget}.model.messages.learnMore"
                        }
                    },
                    selectors: {
                        tip: ".flc-qssWidget-tip",
                        learnMoreLink: ".flc-qssWidget-learnMoreLink"
                    },
                    components: {
                        learnMoreLink: {
                            type: "gpii.psp.qssWidget.learnMoreLink",
                            container: "{that}.dom.learnMoreLink",
                            options: {
                                model: {
                                    setting: "{qssWidget}.model.setting",
                                    messages: {
                                        learnMore: "{qssWidget}.model.messages.learnMore"
                                    }
                                }
                            }
                        }
                    },
                    events: {
                        onNotificationRequired: "{qssWidget}.events.onQssWidgetNotificationRequired",
                        onQssWidgetCreated: "{qssWidget}.events.onQssWidgetCreated"
                    },
                    listeners: {
                        "onCreate.processParams": {
                            funcName: "gpii.qssWidget.processParams",
                            args: ["{focusManager}", "{that}.options.activationParams"]
                        },
                        "onCreate.notifyCreated": {
                            func: "{that}.events.onQssWidgetCreated.fire",
                            args: [null],
                            priority: "last"
                        }
                    }
                }
            },
            focusManager: {
                type: "gpii.qss.verticalFocusManager",
                container: "{qssWidget}.container"
            },
            windowKeyListener: {
                type: "fluid.component",
                options: {
                    gradeNames: "gpii.app.keyListener",
                    target: {
                        expander: {
                            funcName: "jQuery",
                            args: [window]
                        }
                    },
                    events: {
                        onArrowLeftPressed: null,
                        onArrowRightPressed: null,
                        onEscapePressed: null
                    },
                    listeners: {
                        onArrowLeftPressed: "{qssWidget}.close({arguments}.0)",
                        onArrowRightPressed: "{qssWidget}.close({arguments}.0)",
                        onEscapePressed: "{qssWidget}.close({arguments}.0)"
                    }
                }
            },
            // TODO send data from the main process
            channelListener: {
                type: "gpii.psp.channelListener",
                options: {
                    events: {
                        // Add events from the main process to be listened for
                        onSettingUpdated: "{qssWidget}.events.onSettingUpdated"
                    }
                }
            },
            channelNotifier: {
                type: "gpii.psp.channelNotifier",
                options: {
                    events: {
                        // Add events the main process to be notified for
                        onQssWidgetClosed:               "{qssWidget}.events.onWidgetClosed",
                        onQssWidgetSettingAltered:       "{qssWidget}.events.onQssWidgetSettingAltered",
                        onQssWidgetNotificationRequired: "{qssWidget}.events.onQssWidgetNotificationRequired",
                        onQssWidgetCreated:              "{qssWidget}.events.onQssWidgetCreated"
                    }
                }
            }
        },

        listeners: {
            onSettingUpdated: [{
                funcName: "gpii.app.applier.replace",
                args: [
                    "{that}.applier",
                    "setting",
                    "{arguments}.0"
                ]
            }, {
                funcName: "gpii.psp.qssWidget.updateContainerVisibility",
                args: [
                    "{that}.dom.stepper",
                    "{that}.dom.menu",
                    "{that}.model.setting"
                ]
            }]
        },
        invokers: {
            close: {
                funcName: "gpii.psp.qssWidget.close",
                args: [
                    "{that}",
                    "{arguments}.0" // KeyboardEvent
                ]
            }
        }
    });

    /**
     * Fires the appropriate event which is communicated to the main process to
     * indicate that the QSS widget should be closed.
     * @param {Component} that - The `gpii.psp.qssWidget` instance.
     * @param {KeyboardEvent} KeyboardEvent - The keyboard event (if any) which
     * led to the triggering of this function.
     */
    gpii.psp.qssWidget.close = function (that, KeyboardEvent) {
        KeyboardEvent = KeyboardEvent || {};

        that.events.onWidgetClosed.fire({
            setting: that.model.setting,
            key: KeyboardEvent.key
        });
    };

    /**
     * Determines the type of the `widget` subcomponent (either a menu or a stepper)
     * depending on the type of the setting.
     * @param {Object} setting - The setting which corresponds to the activated
     * QSS button.
     * @return {String} The grade name for the `widget` subcomponent.
     */
    gpii.psp.qssWidget.getWidgetType = function (setting) {
        return setting.schema.type === "number" ? "gpii.qssWidget.stepper" : "gpii.qssWidget.menu";
    };

    /**
     * Determines the jQuery element which should be the container of the `widget`
     * view subcomponent depending on the type of the setting.
     * @param {Object} setting - The setting which corresponds to the activated
     * QSS button.
     * @param {jQuery} stepperElement - The container for the QSS stepper widget.
     * @param {jQuery} menuElement - The container for the QSS menu widget.
     * @return {jQuery} The jQuery element representing the container object.
     */
    gpii.psp.qssWidget.getWidgetContainer = function (setting, stepperElement, menuElement) {
        return setting.schema.type === "number" ? stepperElement : menuElement;
    };

    /**
     * Shows the appropriate container depending on the type of the setting.
     * @param {jQuery} stepperElement - The container for the QSS stepper widget.
     * @param {jQuery} menuElement - The container for the QSS menu widget.
     * @param {Object} setting - The setting which corresponds to the activated
     * QSS button.
     */
    gpii.psp.qssWidget.updateContainerVisibility = function (stepperElement, menuElement, setting) {
        if (setting.schema.type === "number") {
            stepperElement.show();
            menuElement.hide();
        } else {
            stepperElement.hide();
            menuElement.show();
        }
    };

    /**
     * Depending on whether the QSS widget was shown as a result of keyboard interaction,
     * this function takes care of either focusing the first focusable element (that comes
     * after the close button) in the document or removing the focus if there is such
     * remaining.
     * @param {focusManager} focusManager - The `gpii.qss.focusManager` instance for the
     * QSS widget.
     * @param {Object} activationParams - An object containing parameter's for the activation
     * of the QSS widget (e.g. which key was used to activate the button).
     */
    gpii.qssWidget.processParams = function (focusManager, activationParams) {
        activationParams = activationParams || {};
        if (activationParams.key) {
            // If the widget is show via the keyboard, focus the second focusable element, i.e. the
            // element that appears after the close button and the "learn more" link.
            focusManager.focus(2, true);
        } else {
            // Otherwise there will be no focused element and any remaining highlight will be removed.
            focusManager.removeHighlight(true);
        }
    };

    /**
     * A component representing the "Learn more" link in the QSS widget.
     */
    fluid.defaults("gpii.psp.qssWidget.learnMoreLink", {
        gradeNames: ["gpii.app.activatable"],

        model: {
            setting: null,
            messages: {
                learnMore: null
            }
        },

        modelListeners: {
            "messages.learnMore": {
                this: "{that}.container",
                method: "text",
                args: ["{change}.value"]
            }
        },

        invokers: {
            activate: {
                funcName: "gpii.psp.qssWidget.learnMoreLink.activate",
                args: ["{that}.model.setting"]
            }
        }
    });

    /**
     * Opens the learn more link of the current setting in the default OS browser.
     * @param {Object} setting - The setting which corresponds to the activated
     * QSS button.
     */
    gpii.psp.qssWidget.learnMoreLink.activate = function (setting) {
        if (setting && setting.learnMoreLink) {
            gpii.psp.openUrlExternally(setting.learnMoreLink);
        }
    };
})(fluid);
