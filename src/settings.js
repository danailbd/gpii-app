"use strict";
(function () {
    var fluid = window.fluid,
        gpii = fluid.registerNamespace("gpii"),
        ipcRenderer = require("electron").ipcRenderer;

    fluid.registerNamespace("gpii.pcp");

    ipcRenderer.on("message", function (event, message) {
        console.log("Browser window received message:", message);
    });

    gpii.pcp.addCommunicationChannel = function (that) {
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

    gpii.pcp.updateSetting = function (path, value) {
        ipcRenderer.send("updateSetting", {
            path: path,
            value: value
        });
    };

    gpii.pcp.keyOut = function () {
        ipcRenderer.send("keyOut");
    };

    gpii.pcp.closeSettingsWindow = function () {
        ipcRenderer.send("closeSettingsWindow");
    };

    fluid.registerNamespace("gpii.pcp.settingRow");

    /**
     * Handles a signle row of the visualized list of settings.
     * Responsible for injecting the markup required for the row itself,
     * and the widget that is to be used (based on the setting type).
     * Expects to be supplied: widget grade, model data
     */
    fluid.defaults("gpii.pcp.settingRow", {
        // TODO make viewComponent to use container
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
                            args: "{settingRow}.options.markup.row"
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
                            args: "{settingRow}.options.markup.widget"
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
                            options: "{settingRow}.options.widgetOptions"
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

    fluid.registerNamespace("gpii.pcp.settingsVisualizer");

    gpii.pcp.settingsVisualizer.getRowContainerClass = function (markup, containerIndex) {
        return "." + fluid.stringTemplate(markup.containerClassPrefix, { id: containerIndex });
    };

    gpii.pcp.settingsVisualizer.getRowContainerMarkup = function (markup, containerIndex) {
        // Remove the "." prefix
        var containerClass = gpii.pcp.settingsVisualizer.getRowContainerClass(markup, containerIndex).substring(1);
        return fluid.stringTemplate(markup.container, { containerClass: containerClass });
    };

    gpii.pcp.settingsVisualizer.getWidgetMarkup = function (resources, widgetGrade) {
        //TODO improve; use markup if any
        return resources[widgetGrade] && resources[widgetGrade].resourceText;
    };

    // TODO simplify - probably do this sort of mapping somewhere up the chain?
    gpii.pcp.settingsVisualizer.getRequiredResources = function (rowTemplate, exemplars) {

        function appendWidgetResources(resources, exemplars) {
            exemplars.forEach(function (exemplar) {
                resources[exemplar.options.widgetGrade] = exemplar.options.template;
            });
        }

        // TODO remove this ugliness
        var resources = {
            rowTemplate:  rowTemplate
        };

        appendWidgetResources(resources, exemplars);

        return resources;
    };


    /**
     * TODO
     */
    fluid.defaults("gpii.pcp.exemplar", {
        gradeNames: "fluid.component",
        mergePolicy: {
            widgetOptions: "noexpand"
        },
        template: null,
        widgetGrade: null,
        schemeType: null,
        widgetOptions: {
            // TODO doc
        }
    });
    // TODO add options

    fluid.defaults("gpii.pcp.multipicker", {
        gradeNames: "gpii.pcp.exemplar",
        // TODO ?make members?
        template: "multipicker.html",
        widgetGrade: "gpii.pcp.widgets.multipicker",
        schemeType: "array",
        widgetOptions: {
            // TODO extract to invoker in exemplar? - accepts the model holder
            model: {
                values: "{settingRow}.model.values",
                names: "{settingRow}.model.values",
                value: "{settingRow}.model.value"
            },
            attrs: {
                name: "{settingRow}.model.path"
            }
        }
    });

    fluid.defaults("gpii.pcp.switch", {
        gradeNames: "gpii.pcp.exemplar",
        template: "switch.html",
        widgetGrade: "gpii.pcp.widgets.switch",
        schemeType: "boolean",
        widgetOptions: {
            model: {
                enabled: "{settingRow}.model.value"
            },
            attrs: {
                name: "{settingRow}.model.path"
            }
        }
    });

    fluid.defaults("gpii.pcp.dropdown", {
        gradeNames: "gpii.pcp.exemplar",
        template: "dropdown.html",
        widgetGrade: "gpii.pcp.widgets.dropdown",
        schemeType: "string",
        widgetOptions: {
            model: {
                optionNames: "{settingRow}.model.values",
                optionList: "{settingRow}.model.values",
                selection: "{settingRow}.model.value"
            }
        }
    });

    fluid.defaults("gpii.pcp.slider", {
        gradeNames: "gpii.pcp.exemplar",
        template: "slider.html",
        widgetGrade: "gpii.pcp.widgets.slider",
        schemeType: "number",
        widgetOptions: {
            model: {
                value: "{settingRow}.model.value",
                step: "{settingRow}.model.divisibleBy",
                range: {
                    min: "{settingRow}.model.min",
                    max: "{settingRow}.model.max"
                }
            }
        }
    });

    fluid.defaults("gpii.pcp.stepper", {
        gradeNames: "gpii.pcp.exemplar",
        template: "stepper.html",
        widgetGrade: "gpii.pcp.widgets.stepper",
        schemeType: "numberStep",
        widgetOptions: {
            model: {
                value: "{settingRow}.model.value",
                step: "{settingRow}.model.divisibleBy",
                range: {
                    min: "{settingRow}.model.min",
                    max: "{settingRow}.model.max"
                }
            }
        }
    });

    fluid.defaults("gpii.pcp.textfield", {
        gradeNames: "gpii.pcp.exemplar",
        template: "textfield.html",
        widgetGrade: "gpii.pcp.widgets.textfield",
        schemeType: "text",
        widgetOptions: {
            model: {
                value: "{settingRow}.model.value"
            }
        }
    });

    fluid.defaults("gpii.pcp.radioToggle", {
        gradeNames: "gpii.pcp.exemplar",
        template: "radioToggle.html",
        widgetGrade: "gpii.pcp.widgets.radioToggle",
        schemeType: "radio",
        widgetOptions: {
            model: {
                enabled: "{settingRow}.model.value"
            },
            attrs: {
                name: "{settingRow}.model.path"
            }
        }
    });

    /**
     * Represents an container for all exemplars for widgets
     * Should be used as immutable objects
     */
    fluid.defaults("gpii.pcp.widgetExemplars", {
        gradeNames: "fluid.component",
        components: {
            multipicker: {
                type: "gpii.pcp.multipicker"
            },
            switch: {
                type: "gpii.pcp.switch"
            },
            dropdown: {
                type: "gpii.pcp.dropdown"
            },
            slider: {
                type: "gpii.pcp.slider"
            },
            stepper: {
                type: "gpii.pcp.stepper"
            },
            textfield: {
                type: "gpii.pcp.textfield"
            },
            radioToggle: {
                type: "gpii.pcp.radioToggle"
            }
        }
    });

    gpii.pcp.widgetExemplars.getExemplarsList = function (exemplars) {
        return fluid.values(exemplars)
            .filter(fluid.isComponent);
    };

    gpii.pcp.widgetExemplars.getMatchingExemplar = function (exemplarsList, schemeType) {
        // TODO see if inline is possible (fluid api)
        return exemplarsList.find(function matchType(exemplar) { return exemplar.options.schemeType === schemeType; });
    };

    /**
     * Responsible for visualizing the list of user settings.
     * Behaviour:
     *  - Loads templates for the setting row and widget that is to be used
     *  - Once templates are loaded, dynamically creates and supplies container for a `settingRow` element, for every user setting
     * Expects: list of settings
     */
    fluid.defaults("gpii.pcp.settingsVisualizer", {
        gradeNames: "fluid.viewComponent",
        model: {
            //  pcp specific data (widgets)
            settings: []
        },
        members: {
            // TODO move elsewhere
            // TODO
            // keyToExemplar: "@expand:gpii.pcp.indexExemplars({that > exemplar}.components)",
            exemplarsList: "@expand:gpii.pcp.widgetExemplars.getExemplarsList({that}.options.exemplars)"
        },
        rowTemplate: "settingRow.html",
        markup: {
            container: "<div class=\"%containerClass\"></div>",
            containerClassPrefix: "flc-settingListRow-%id"
        },
        components: {
            resourcesLoader: {
                type: "fluid.resourceLoader",
                options: {
                    // TODO settingRow component
                    resources: "@expand:gpii.pcp.settingsVisualizer.getRequiredResources({settingsVisualizer}.options.rowTemplate, {settingsVisualizer}.exemplarsList)",
                    listeners: {
                        onResourcesLoaded: {
                            func: "{settingsVisualizer}.events.onTemplatesLoaded.fire"
                        }
                    }
                }
            },
            // TODO extract as grade
            // Represents the list of the settings component
            settingsLoader: {
                type: "fluid.component",
                createOnEvent: "onTemplatesLoaded",
                options: {
                    dynamicComponents: {
                        // TODO better name
                        settingRow: {
                            sources: "{settingsVisualizer}.model.settings",
                            type: "gpii.pcp.settingRow",
                            // TODO extract to a function?
                            options: {
                                containerIndex: "{sourcePath}",
                                setting: "{source}",
                                exemplar: "@expand:gpii.pcp.widgetExemplars.getMatchingExemplar({settingsVisualizer}.exemplarsList, {that}.options.setting.type)",
                                widgetGrade: "{that}.options.exemplar.options.widgetGrade",
                                widgetOptions: "{that}.options.exemplar.options.widgetOptions",
                                markup: {
                                    row: "{resourcesLoader}.resources.rowTemplate.resourceText",
                                    widget: {
                                        expander: {
                                            // TODO have some widget to template relation
                                            funcName: "gpii.pcp.settingsVisualizer.getWidgetMarkup",
                                            args: ["{resourcesLoader}.resources", "{that}.options.widgetGrade"]
                                        }
                                    }
                                },
                                model: "{that}.options.setting",
                                modelListeners: {
                                    value: {
                                        funcName: "gpii.pcp.updateSetting",
                                        args: ["{that}.model.path", "{change}.value"],
                                        excludeSource: "init"
                                    }
                                },
                                // TODO return container instead of string?
                                rowContainer: "@expand:gpii.pcp.settingsVisualizer.getRowContainerClass({settingsVisualizer}.options.markup, {that}.options.containerIndex)",
                                listeners: {
                                    "onCreate.createContainer": {
                                        "this": "{settingsVisualizer}.container",
                                        method: "append",
                                        args: "@expand:gpii.pcp.settingsVisualizer.getRowContainerMarkup({settingsVisualizer}.options.markup, {that}.options.containerIndex)"
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
    fluid.defaults("gpii.pcp.header", {
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
                type: "gpii.pcp.settingRow",
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
    fluid.defaults("gpii.pcp.mainWindow", {
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
                type: "gpii.pcp.header",
                container: "{that}.dom.header"
                // TODO send options
            },
            exemplars: {
                type: "gpii.pcp.widgetExemplars"
            },
            settingsVisualizer: {
                type: "gpii.pcp.settingsVisualizer",
                container: "{that}.dom.settingsList",
                createOnEvent: "onAvailableSettngsReceived",
                options: {
                    exemplars: "{exemplars}",
                    model: {
                        settings: "{mainWindow}.model.availableSettings"
                    }
                }
            },
            keyOutBtn: {
                type: "gpii.pcp.widgets.button",
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
                funcName: "gpii.pcp.addCommunicationChannel",
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
            "close": "gpii.pcp.closeSettingsWindow()",
            "keyOut": "gpii.pcp.keyOut()"
        },
        events: {
            onAvailableSettngsReceived: null
        }

    });

    $(function () {
        var main = gpii.pcp.mainWindow("#flc-body");
        //        var x = gpii.pcp.settingsVisualizer("#flc-settingsVisualizer");
        //console.log(x);
        // XXX Debuging
        console.log(main);
    });
})();
