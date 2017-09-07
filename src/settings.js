"use strict";
(function () {
    var fluid = window.fluid,
        gpii = fluid.registerNamespace("gpii"),
        ipcRenderer = require("electron").ipcRenderer;

    fluid.registerNamespace("gpii.app.settings");

    ipcRenderer.on("message", function (event, message) {
        console.log("Browser window received message:", message);
    });

    gpii.app.settings.getIcon = function (preferenceSets, activePreferenceSet) {
        if (!gpii.app.settings.hasPreferenceSets(preferenceSets)) {
            return;
        }

        for (var i = 0; i < preferenceSets.names.length; i++) {
            if (preferenceSets.names[i] === activePreferenceSet) {
                return preferenceSets.icons[i];
            }
        }
    };

    gpii.app.settings.addCommunicationChannel = function (that) {
        that.updatePreferenceSets({
            names: ["GPII Default", "Subway", "Noisy"],
            icons: ["../icons/gear-cloud-black.png",
                "../icons/gear-cloud-white.png",
                "../icons/gear-cloud-black.png"]
        });

        that.updateAvailableSettings([{
            path: "settingOnePath",
            type: "string",
            values: ["a", "b", "c", "d"],
            title: "Setting one title",
            description: "Setting one description",
            icon: "../icons/gear-cloud-black.png",
            value: "b"
        }, {
            path: "settingTwoPath",
            type: "string",
            values: ["b", "c", "d", "e"],
            title: "Setting two title",
            description: "Setting two description",
            icon: "../icons/gear-cloud-black.png",
            value: "c"
        }, {
            path: "textfieldPath",
            type: "text",
            title: "Text input",
            description: "Text input description",
            icon: "../icons/gear-cloud-white.png",
            value: ""
        }, {
            path: "invertColorsPath",
            type: "boolean",
            title: "Invert colors",
            description: "Invert colors description",
            icon: "../icons/gear-cloud-black.png",
            value: true
        }, {
            path: "highContrastPath",
            type: "radio",
            title: "High contrast",
            description: "High contrast description",
            icon: "../icons/gear-cloud-white.png",
            value: false
        }, {
            path: "zoomPath",
            type: "number",
            title: "Zoom",
            description: "Zoom description",
            icon: "../icons/gear-cloud-black.png",
            value: 1,
            min: 0.5,
            max: 4,
            divisibleBy: 0.1
        }, {
            path: "spacingPath",
            type: "numberStep",
            title: "Spacing",
            description: "Spacing description",
            icon: "../icons/gear-cloud-black.png",
            value: 1,
            min: 0.5,
            max: 2,
            divisibleBy: 0.25
        }, {
            path: "ttsTrackingPath",
            type: "array",
            title: "TTS tracking mode",
            description: "TTS tracking mode description",
            icon: "../icons/gear-cloud-white.png",
            values:  ["mouse", "caret", "focus"],
            value: ["mouse", "focus"]
        }]);
    };

    gpii.app.settings.hasPreferenceSets = function (preferenceSets) {
        // TODO use in settingRow
        return preferenceSets && preferenceSets.names && preferenceSets.names.length > 0;
    };

    gpii.app.settings.updateSetting = function (path, value) {
        ipcRenderer.send("updateSetting", {
            path: path,
            value: value
        });
    };

    gpii.app.settings.keyOut = function () {
        ipcRenderer.send("keyOut");
    };

    gpii.app.settings.closeSettingsWindow = function () {
        ipcRenderer.send("closeSettingsWindow");
    };

    fluid.registerNamespace("gpii.app.settings.settingRow");

    gpii.app.settings.settingRow.getWidgetOptions = function (widgetGrade, model) {
        switch (widgetGrade) {
        case "gpii.app.settings.widgets.dropDown": {
            return {
                model: {
                    optionNames: model.values,
                    optionList: model.values,
                    selection: "{settingRow}.model.value"
                }
            };
        }
        case "gpii.app.settings.widgets.textfield": {
            return {
                model: {
                    value: "{settingRow}.model.value"
                }
            };
        }
        case "gpii.app.settings.widgets.switch":
        case "gpii.app.settings.widgets.radioToggle": {
            return {
                model: {
                    enabled: "{settingRow}.model.value"
                }
            };
        }
        case "gpii.app.settings.widgets.slider":
        case "gpii.app.settings.widgets.stepper": {
            return {
                model: {
                    value: "{settingRow}.model.value",
                    step: "{settingRow}.model.divisibleBy",
                    range: {
                        min: "{settingRow}.model.min",
                        max: "{settingRow}.model.max"
                    }
                }
            };
        }
        case "gpii.app.settings.widgets.multipicker": {
            return {
                model: {
                    values: "{settingRow}.model.values",
                    names: "{settingRow}.model.values",
                    value: "{settingRow}.model.value"
                }
            };
        }
        default:
            // should not reach here
            return "";
        }
    };

    /**
     * Handles a signle row of the visualized list of settings.
     * Responsible for injecting the markup required for the row itself,
     * and the widget that is to be used (based on the setting type).
     * Expects to be supplied: widget grade, model data
     */
    fluid.defaults("gpii.app.settings.settingRow", {
        // TODO make viewComponent to use container
        gradeNames: ["fluid.modelComponent"],
        template: "./settingRow.html",
        model: {
            values: [],
            icon: null,
            title: null,
            // TODO add as tooltip?
            description: null,
            // XXX probably not needed
            value: null // can be string/array/boolean
        },
        events: {
            onContainerCreated: null,
            onRowTemplateRendered: null,
            onWidgetTemplateRendered: null
        },
        components: {
            renderRowTemplate: {
                type: "fluid.viewComponent",
                container: "{settingRow}.options.rowContainer",
                createOnEvent: "onContainerCreated",
                options: {
                    listeners: {
                        "onCreate.renderRowTemplate" : {
                            this: "{that}.container",
                            method: "append",
                            args: "{settingRow}.options.markups.row"
                        },
                        "onCreate.onRowTemplateRendered" : {
                            func: "{settingRow}.events.onRowTemplateRendered.fire",
                            priority: "after:renderRowTemplate"
                        }
                    }
                }
            },
            renderWidgetTemplate: {
                type: "fluid.viewComponent",
                container: "{settingRow}.options.rowContainer",
                createOnEvent: "onRowTemplateRendered",
                options: {
                    selectors: {
                        // Add the widget template under the dedicated widget container
                        widget: ".flc-widget"
                    },
                    listeners: {
                        "onCreate.renderWidgetTemplate": {
                            this: "{that}.dom.widget",
                            method: "append",
                            args: "{settingRow}.options.markups.widget"
                        },
                        "onCreate.onWidgetTemplateRendered": {
                            func: "{settingRow}.events.onWidgetTemplateRendered.fire",
                            priority: "after:renderWidgetTemplate"
                        }
                    }
                }
            },
            setting: {
                type: "fluid.viewComponent",
                container: "{settingRow}.options.rowContainer",
                createOnEvent: "onWidgetTemplateRendered",
                options: {
                    selectors: {
                        icon: ".flc-icon",
                        // TODO supply usage of description
                        //descriptions: ".flc-description",
                        title: ".flc-title",
                        widget: ".flc-widget"
                    },
                    components: {
                        widget: {
                            type: "{settingRow}.options.widgetGrade",
                            container: "{setting}.dom.widget",
                            options: "@expand:gpii.app.settings.settingRow.getWidgetOptions({settingRow}.options.widgetGrade, {settingRow}.model)"
                        }
                    },
                    listeners: {
                        "onCreate.setIcon": {
                            "this": "{that}.dom.icon",
                            method: "attr",
                            args: ["src", "{settingRow}.model.icon"]
                        },
                        "onCreate.setTitle": {
                            "this": "{that}.dom.title",
                            method: "append",
                            args: "{settingRow}.model.title"
                        }
                    }
                }
            }
        }
    });

    fluid.registerNamespace("gpii.app.settings.settingsVisualizer");

    gpii.app.settings.settingsVisualizer.getRowContainerClass = function (markups, containerIndex) {
        return "." + fluid.stringTemplate(markups.containerClassPrefix, { id: containerIndex });
    };

    gpii.app.settings.settingsVisualizer.getRowContainerMarkup = function (markups, containerIndex) {
        // Remove the "." prefix
        var containerClass = gpii.app.settings.settingsVisualizer.getRowContainerClass(markups, containerIndex).substring(1);
        return fluid.stringTemplate(markups.container, { containerClass: containerClass });
    };

    gpii.app.settings.settingsVisualizer.getWidgetMarkup = function (resources, widgetGrade) {
        //TODO improve; use markup if any
        return resources[widgetGrade] && resources[widgetGrade].resourceText;
    };

    /**
     * Returns the widget grade matching the given GPII setting scheme type.
     *
     * @param that {Object} A fluid component containing `widgets` option, e.g. `settingsVisualizer`
     * @param type {String} GPII setting scheme type
     * @returns {String} The widget to be used
     */
    gpii.app.settings.settingsVisualizer.getWidgetGrade = function (that, type) {
        var widgetPrefix = that.options.widgets.gradePrefix,
            widgetGrade,
            widgetGradesToTypes = that.options.widgets.typesToGrades;

        if (!widgetGradesToTypes) {
            console.log("`widgetGradesToTypes` missing - Widget grades to types not supplied.");
        }

        widgetGrade = widgetGradesToTypes[type];
        if (!widgetGrade) {
            console.log("Widget " + type + " is not supported.");
        }

        return widgetPrefix + "." + widgetGrade;
    };

    // TODO simplify - probably do this sort of mapping somewhere up the chain?
    gpii.app.settings.settingsVisualizer.getRequiredResources = function (settingsVisualizer, settings) {
        function appendWidgetResources(resources, settings, settingsVisualizer) {
            var widgetGrades = settings
                .map(function (setting) { return setting.type; })
                .filter(function uniq(setting, idx, settings) { return settings.indexOf(setting) === idx; })
                .map(
                    // receives the GPII setting type
                    gpii.app.settings.settingsVisualizer.getWidgetGrade.bind(null, settingsVisualizer)
                );

            widgetGrades.forEach(function (widgetGrade) {
                var template = fluid.defaults(widgetGrade).template;
                resources[widgetGrade] = template;
            });
        }

        // TODO remove this ugliness
        var resources = {
            rowTemplate:  fluid.defaults("gpii.app.settings.settingRow").template
        };

        appendWidgetResources(resources, settings, settingsVisualizer);

        return resources;
    };


    /**
     * Responsible for visualizing the list of user settings.
     * Behaviour:
     *  - Loads templates for the setting row and widget that is to be used
     *  - Once templates are loaded, dynamicaly creates and supplies container for a `settingRow` element, for every user setting
     * Expects: list of settings
     */
    fluid.defaults("gpii.app.settings.settingsVisualizer", {
        gradeNames: "fluid.viewComponent",
        model: {
            // TODO modelRelay - transform received settings with 
            //  pcp specific data (widgets)
            settings: []
        },
        widgets: {
            // Represents a map for GPII settings schema type to PCP widget grade to be used
            typesToGrades: {
                array: "multipicker",
                boolean: "switch",
                string: "dropDown",
                number: "slider",
                numberStep: "stepper",
                text: "textfield",
                radio: "radioToggle"
            },
            gradePrefix: "gpii.app.settings.widgets"
        },
        markups: {
            container: "<div class=\"%containerClass\"></div>",
            containerClassPrefix: "flc-settingListRow-%id"
        },
        components: {
            resourcesLoader: {
                type: "fluid.resourceLoader",
                options: {
                    resources: "@expand:gpii.app.settings.settingsVisualizer.getRequiredResources({settingsVisualizer}, {settingsVisualizer}.model.settings)",
                    listeners: {
                        onResourcesLoaded: {
                            func: "{settingsVisualizer}.events.onTemplatesLoaded.fire"
                        }
                    }
                }
            },
            // TODO
            // Represents the list of the settings component
            settingsLoader: {
                type: "fluid.component",
                createOnEvent: "onTemplatesLoaded",
                //TODO Is this the best approach - component wrapper only to postpone initialization of dynamic components?
                options: {
                    dynamicComponents: {
                        settingVisulizer: {
                            sources: "{settingsVisualizer}.model.settings",
                            type: "gpii.app.settings.settingRow",
                            // TODO extract to a function?
                            options: {
                                containerIndex: "{sourcePath}",
                                source: "{source}",
                                widgetGrade: "@expand:gpii.app.settings.settingsVisualizer.getWidgetGrade({settingsVisualizer}, {that}.model.type)",
                                markups: {
                                    row: "{resourcesLoader}.resources.rowTemplate.resourceText",
                                    widget: {
                                        expander: {
                                            funcName: "gpii.app.settings.settingsVisualizer.getWidgetMarkup",
                                            args: ["{resourcesLoader}.resources", "{that}.options.widgetGrade"]
                                        }
                                    }
                                },
                                model: "{that}.options.source",
                                modelListeners: {
                                    value: {
                                        funcName: "gpii.app.settings.updateSetting",
                                        args: ["{that}.model.path", "{change}.value"],
                                        excludeSource: "init"
                                    }
                                },
                                // TODO return container instead of string?
                                rowContainer: "@expand:gpii.app.settings.settingsVisualizer.getRowContainerClass({settingsVisualizer}.options.markups, {that}.options.containerIndex)",
                                listeners: {
                                    "onCreate.createContainer": {
                                        "this": "{settingsVisualizer}.container",
                                        method: "append",
                                        args: "@expand:gpii.app.settings.settingsVisualizer.getRowContainerMarkup({settingsVisualizer}.options.markups, {that}.options.containerIndex)"
                                    },
                                    "onCreate.onContainerCreated": {
                                        funcName: "{that}.events.onContainerCreated.fire",
                                        priority: "after:createContainer"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        events: {
            onTemplatesLoaded: null
        }
    });

    /**
     * TODO
     */
    fluid.defaults("gpii.app.settings.header", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            preferenceSet: ".flc-prefSetPicker",
            closeBtn: ".flc-closeBtn"
        },
        model: {
            preferenceSets: "{mainWindow}.model.preferenceSets",
            activePreferenceSet: "GPII Default",
            icon: "../icons/gear-cloud-black.png"
        },
        components: {
            preferenceSets: {
                type: "gpii.app.settings.settingRow",
                container: "{header}.dom.preferenceSet",
                options: {
                    model: {
                        option: "{header}.model.preferenceSets",
                        //TODO TEST ONLY - include in the option
                        icon: "{header}.model.icon"
                    }
                }
            }
        },
        listeners: {
            "onCreate.initCloseBtn": {
                "this": "{that}.dom.closeBtn",
                method: "on",
                args: ["click", "{mainWindow}.close"]
            }
        }
    });

    /**
     * Responsible for drawing the settings list
     *
     * TODO support redrawing of settings
     * currently only single update of available setting is supported
     */
    fluid.defaults("gpii.app.settings.mainWindow", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            preferenceSets: null,
            availableSettings: []
        },
        selectors: {
            header: "#flc-settingsHeader",
            settingsList: "#flc-settingsList",
            keyOutBtn: ".flc-keyOutBtn"
        },
        components: {
            header: {
                type: "gpii.app.settings.header",
                container: "{that}.dom.header"
                // TODO send options
            },
            settingsVisualizer: {
                type: "gpii.app.settings.settingsVisualizer",
                container: "{that}.dom.settingsList",
                createOnEvent: "onAvailableSettngsReceived",
                options: {
                    model: {
                        settings: "{mainWindow}.model.availableSettings"
                    }
                }
            },
            keyOutBtn: {
                type: "gpii.app.settings.widgets.button",
                container: "{that}.dom.keyOutBtn",
                options: {
                    label: "Key Out",
                    invokers: {
                        "onClick": "{mainWindow}.keyOut"
                    }
                }
            }
        },
        modelListeners: {
            availableSettings: "{that}.events.onAvailableSettngsReceived"
        },
        listeners: {
            "onCreate.addCommunicationChannel": {
                funcName: "gpii.app.settings.addCommunicationChannel",
                args: ["{that}"]
            }
        },
        invokers: {
            "updatePreferenceSets": {
                changePath: "preferenceSets",
                value: "{arguments}.0"
            },
            "updateAvailableSettings": {
                changePath: "availableSettings",
                value: "{arguments}.0"
            },
            "close": "gpii.app.settings.closeSettingsWindow()",
            "keyOut": "gpii.app.settings.keyOut()"
        },
        events: {
            onAvailableSettngsReceived: null
        }

    });

    $(function () {
        var main = gpii.app.settings.mainWindow("#flc-body");
        //        var x = gpii.app.settings.settingsVisualizer("#flc-settingsVisualizer");
        //console.log(x);
        // XXX Debuging
        console.log(main);
    });
})();
