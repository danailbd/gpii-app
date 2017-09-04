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
        }]);
    };

    gpii.app.settings.hasPreferenceSets = function (preferenceSets) {
        // TODO use in singleSettingVisualizer
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

    fluid.registerNamespace("gpii.app.settings.singleSettingVisualizer");

    gpii.app.settings.singleSettingVisualizer.getWidgetOptions = function (widgetType, model) {
        if (widgetType === "gpii.app.settings.widgets.dropDown") {
            return {
                model: {
                    optionNames: model.values,
                    optionList: model.values,
                    selection: "{singleSettingVisualizer}.model.value"
                }
            };
        }

        // should not reach here
        return "";
    };

    // TODO name singleSettingVisualizer / setting
    fluid.defaults("gpii.app.settings.singleSettingVisualizer", {
        gradeNames: ["fluid.modelComponent"],
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
            onTemplateRendered: null
        },
        components: {
            renderRowTemplate: {
                type:  "fluid.viewComponent",
                createOnEvent: "onContainerCreated",
                container: "{singleSettingVisualizer}.options.rowContainer",
                options: {
                    gradeNames: "fluid.resourceLoader",
                    resources: {
                        // TODO rename template
                        template: "./settingRow.html"
                    },
                    listeners: {
                        "onResourcesLoaded.append": {
                            "this": "{that}.container",
                            method: "append",
                            args: "{resourceLoader}.resources.template.resourceText"
                        },
                        "onResourcesLoaded.render": "{singleSettingVisualizer}.events.onTemplateRendered"
                    }
                }
            },
            setting: {
                type: "fluid.viewComponent",
                container: "{singleSettingVisualizer}.options.rowContainer",
                createOnEvent: "onTemplateRendered",
                options: {
                    selectors: {
                        //TODO set to current .flc-setting
                        icon: ".flc-icon",
                        // TODO
                        //descriptions: ".flc-description",
                        title: ".flc-title",
                        widget: ".flc-widget"
                    },
                    components: {
                        // TODO altered from the outside
                        widget: {
                            type: "{singleSettingVisualizer}.options.widgetType",
                            container: "{setting}.dom.widget",
                            options: "@expand:gpii.app.settings.singleSettingVisualizer.getWidgetOptions({singleSettingVisualizer}.options.widgetType, {singleSettingVisualizer}.model)"
                        }
                    },
                    listeners: {
                        "onCreate.setIcon": {
                            "this": "{that}.dom.icon",
                            method: "attr",
                            args: ["src", "{singleSettingVisualizer}.model.icon"]
                        },
                        "onCreate.setTitle": {
                            "this": "{that}.dom.title",
                            method: "append",
                            args: "{singleSettingVisualizer}.model.title"
                        }
                    }
                }
            }
        }
    });


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
                type: "gpii.app.settings.singleSettingVisualizer",
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

    // TODO make pretier --------------------------

    fluid.registerNamespace("gpii.app.settings.settingsVisualizer");

    gpii.app.settings.settingsVisualizer.getRowContainerClass = function (markups, containerIndex) {
        return "." + fluid.stringTemplate(markups.containerClassPrefix, { id: containerIndex });
    };

    gpii.app.settings.settingsVisualizer.getRowContainer = function (markups, containerIndex) {
        // Remove the "#" prefix
        var containerClass = gpii.app.settings.settingsVisualizer.getRowContainerClass(markups, containerIndex).substring(1);
        return fluid.stringTemplate(markups.container, { containerClass: containerClass });
    };

    /**
     * Returns the widget grade matching the given GPII setting scheme type.
     *
     * @param that {Object} A fluid component containing `widgets` option, e.g. `settingsVisualizer`
     * @param type {String} GPII setting scheme type
     * @returns {String} The widget to be used
     */
    gpii.app.settings.singleSettingVisualizer.getWidgetGrade = function (that, type) {
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

    fluid.defaults("gpii.app.settings.settingsVisualizer", {
        gradeNames: "fluid.viewComponent",
        model: {
            settings: null
        },
        // TODO comment
        widgets: {
            typesToGrades: {
                array: "",
                boolean: "",
                string: "dropDown",
                number: ""
            },
            gradePrefix: "gpii.app.settings.widgets"
        },
        markups: {
            container: "<div class=\"%containerClass\"></div>",
            containerClassPrefix: "flc-settingListRow-%id"
        },
        dynamicComponents: {
            settingVisulizer: {
                sources: "{settingsVisualizer}.model.settings",
                type: "gpii.app.settings.singleSettingVisualizer",
                options: {
                    containerIndex: "{sourcePath}",
                    source: "{source}",
                    widgetType: "@expand:gpii.app.settings.singleSettingVisualizer.getWidgetGrade({settingsVisualizer}, {that}.model.type)",
                    model: "{that}.options.source",
                    modelListeners: {
                        value: {
                            funcName: "gpii.app.settings.updateSetting",
                            args: ["{that}.model.path", "{change}.value"],
                            excludeSource: "init"
                        }
                    },
                    rowContainer: "@expand:gpii.app.settings.settingsVisualizer.getRowContainerClass({settingsVisualizer}.options.markups, {that}.options.containerIndex)",
                    listeners: {
                        "onCreate.createContainer": {
                            "this": "{settingsVisualizer}.container",
                            method: "append",
                            // TODO use sourcePath
                            args: "@expand:gpii.app.settings.settingsVisualizer.getRowContainer({settingsVisualizer}.options.markups, {that}.options.containerIndex)"
                        },
                        "onCreate.onContainerCreated": {
                            funcName: "{that}.events.onContainerCreated.fire",
                            //TODO send container name?
                            priority: "after:createContainer"
                        }
                    }
                }
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
            // TODO remove when dynamic component generation is postponed
            availableSettings: []
        },
        selectors: {
            keyOutBtn: ".flc-keyOutBtn"
        },
        components: {
            header: {
                type: "gpii.app.settings.header",
                container: "#flc-settingsHeader"
                // TODO send options
            },
            settingsVisualizer: {
                type: "gpii.app.settings.settingsVisualizer",
                container: "#flc-settingsList",
                createOnEvent: "onAvailableSettngsReceived",
                options: {
                    model: {
                        settings: "{mainWindow}.model.availableSettings"
                    }
                }
            }
        },
        modelListeners: {
            availableSettings: "{that}.events.onAvailableSettngsReceived"
        },
        listeners: {
            "onCreate.addCommunicationChannel": {
                listener: "gpii.app.settings.addCommunicationChannel",
                args: ["{that}"]
            },
            "onCreate.keyOut": {
                "this": "{that}.dom.keyOutBtn",
                method: "click",
                args: ["{that}.keyOut"]
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
            "keyOut": {
                funcName: "gpii.app.settings.keyOut"
            }
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
