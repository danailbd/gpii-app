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
                values: "{singleSettingPresenter}.model.values",
                names: "{singleSettingPresenter}.model.values",
                value: "{singleSettingPresenter}.model.value"
            },
            attrs: {
                name: "{singleSettingPresenter}.model.path"
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
                enabled: "{singleSettingPresenter}.model.value"
            },
            attrs: {
                name: "{singleSettingPresenter}.model.path"
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
                optionNames: "{singleSettingPresenter}.model.values",
                optionList: "{singleSettingPresenter}.model.values",
                selection: "{singleSettingPresenter}.model.value"
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
                value: "{singleSettingPresenter}.model.value",
                step: "{singleSettingPresenter}.model.divisibleBy",
                range: {
                    min: "{singleSettingPresenter}.model.min",
                    max: "{singleSettingPresenter}.model.max"
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
                value: "{singleSettingPresenter}.model.value",
                step: "{singleSettingPresenter}.model.divisibleBy",
                range: {
                    min: "{singleSettingPresenter}.model.min",
                    max: "{singleSettingPresenter}.model.max"
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
                value: "{singleSettingPresenter}.model.value"
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
                enabled: "{singleSettingPresenter}.model.value"
            },
            attrs: {
                name: "{singleSettingPresenter}.model.path"
            }
        }
    });

    fluid.registerNamespace("gpii.pcp.widgetExemplars");

    // TODO change namespace?
    gpii.pcp.widgetExemplars.getExemplarsList = function (exemplars) {
        return fluid.values(exemplars)
            .filter(fluid.isComponent);
    };

    fluid.registerNamespace("gpii.pcp.settingsPanel.settingsVisualizer");

    gpii.pcp.settingsPanel.settingsVisualizer.getWidgetConfig = function (exemplarsList, schemeType) {
        // TODO see if inline is possible (fluid api)
        return exemplarsList.find(function matchType(exemplar) { return exemplar.options.schemeType === schemeType; });
    };

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


    fluid.registerNamespace("gpii.pcp.settingsVisualizer");

    /*
     * TODO FIX NAMESPACE
     */
    // TODO deprecate?
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


    fluid.defaults("gpii.pcp.settingsPanel.settingsVisualizer.singleSettingPresenter", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            icon: ".flc-icon",
            title: ".flc-title",
            widget: ".flc-widget"
        },
        model: {
            // Setting properties: values, value,...
        },
        widgetConfig: {},

        components: {
            widget: {
                type: "{that}.options.widgetConfig.options.widgetGrade",
                container: "{that}.dom.widget",
                options: "{singleSettingPresenter}.options.widgetConfig.options.widgetOptions"
            }
        },
        listeners: {
            "onCreate.setIcon": {
                this: "{that}.dom.icon",
                method: "attr",
                args: ["src", "{that}.model.icon"]
            },
            "onCreate.setTitle": {
                this: "{that}.dom.title",
                method: "append",
                args: "{that}.model.title"
            }
        }
    });

    gpii.pcp.getContainerLastChild = function (container) {
        return container.children().last();
    };

    fluid.defaults("gpii.pcp.settingsPanel.settingsVisualizer.singleSettingRenderer", {
        gradeNames: "fluid.viewComponent",

        model: {
            settingContainer: null
        },

        markup: {
            container: null,
            setting: null,
            widget: null
        },
        events: {
            onSettingContainerRendered: null,
            onSettingMarkupRendered: null,
            onWidgetMarkupRendered: null
        },
        components: {
            renderSettingContainer: {
                type: "fluid.viewComponent",
                container: "{that}.container",
                options: {
                    // TODO extract as component -> container renderer?
                    listeners: {
                        // TODO check with funcName
                        "onCreate.render": {
                            this: "{that}.container",
                            method: "append",
                            args: ["{singleSettingRenderer}.options.markup.container"]
                        },
                        "onCreate.updateContainer": {
                            funcName: "{singleSettingRenderer}.setContainer",
                            // TODO test
                            args: "@expand:gpii.pcp.getContainerLastChild({that}.container)",
                            priority: "after:render"
                        },
                        "onCreate.notify": {
                            funcName: "{singleSettingRenderer}.events.onSettingContainerRendered.fire",
                            // Get the newly created container
                            priority: "after:updateContainer"
                        }
                    }
                }
            },
            /**
             * Renders the setting markup inside the dedicated container
             */
            renderSettingMarkup: {
                type: "fluid.viewComponent",
                container: "{that}.model.settingContainer",
                createOnEvent: "onSettingContainerRendered",
                options: {
                    widgetContainerClass: ".flc-widget",
                    listeners: {
                        "onCreate.render": {
                            this: "{that}.container",
                            method: "append",
                            args: "{singleSettingRenderer}.options.markup.setting"
                        },
                        "onCreate.notify": {
                            funcName: "{singleSettingRenderer}.events.onSettingMarkupRendered.fire",
                            // XXX get the widget container
                            // Should match single element
                            args: "@expand:$({that}.options.widgetContainerClass, {that}.container)",
                            priority: "after:render"
                        }
                    }
                }
            },
            renderWidgetMarkup: {
                type: "fluid.viewComponent",
                // the widget container
                container: "{arguments}.0",
                createOnEvent: "onSettingMarkupRendered",
                options: {
                    listeners: {
                        "onCreate.render": {
                            this: "{that}.container",
                            method: "append",
                            args: "{singleSettingRenderer}.options.markup.widget"
                        },
                        "onCreate.notify": {
                            funcName: "{singleSettingRenderer}.events.onWidgetMarkupRendered.fire",
                            priority: "after:render"
                        }
                    }
                }
            }
        },
        invokers: {
            setContainer: {
                changePath: "settingContainer",
                value: "{arguments}.0"
            }
        }
    });


    // TODO
    // * get created container
    // * extract to grade - rendered
    // * rename functions
    // * remove unneeded - getClass ?
    // * doc
    fluid.defaults("gpii.pcp.settingsPanel.settingsVisualizer", {
        gradeNames: "fluid.viewComponent",
        exemplarsList: [],
        resources: null,
        // TODO {M} it should contain all needed markup (squash with resources)
        // general settings markup
        // Contains general template for settings
        markup: {
            container: "<div class=\"%containerClass\"></div>",
            containerClassPrefix: "flc-settingListRow-%id"
        },
        model: {
            settings: null
        },
        dynamicComponents: {
            // TODO extract to a grade?
            singleSettingVisualizer: {
                sources: "{settingsVisualizer}.model.settings",
                type: "fluid.viewComponent",
                container: "{that}.container",
                options: {
                    setting: "{source}",

                    widgetConfig: "@expand:gpii.pcp.settingsPanel.settingsVisualizer.getWidgetConfig({settingsVisualizer}.options.exemplarsList, {that}.options.setting.type)",

                    containerIndex: "{sourcePath}",
                    // used only by the render
                    // contains template related for the current setting row
                    markup: {
                        container: "@expand:gpii.pcp.settingsVisualizer.getRowContainerMarkup({settingsVisualizer}.options.markup, {that}.options.containerIndex)",
                        // TODO {M}
                        setting: "{settingsVisualizer}.options.resources.setting.resourceText", // markup.setting",
                        widget: "@expand:gpii.pcp.settingsVisualizer.getWidgetMarkup({settingsVisualizer}.options.resources, {that}.options.widgetConfig.options.widgetGrade)"
                    },

                    events: {
                        // XXX not quite valid as the widget component also renders
                        onSingleSettingRendered: null
                    },

                    components: {
                        singleSettingRenderer: {
                            type: "gpii.pcp.settingsPanel.settingsVisualizer.singleSettingRenderer",
                            container: "{that}.container",

                            options: {
                                markup: "{singleSettingVisualizer}.options.markup",
                                listeners: {
                                    "onWidgetMarkupRendered.notify": {
                                        funcName: "{singleSettingVisualizer}.events.onSingleSettingRendered.fire",
                                        // pass the created container
                                        args: "{that}.model.settingContainer"
                                    }
                                }
                            }
                        },
                        singleSettingPresenter: {
                            type: "gpii.pcp.settingsPanel.settingsVisualizer.singleSettingPresenter",
                            createOnEvent: "onSingleSettingRendered",
                            container: "{arguments}.0",
                            options: {
                                widgetConfig: "{singleSettingVisualizer}.options.widgetConfig",
                                model: "{singleSettingVisualizer}.options.setting",

                                modelListeners: {
                                    value: {
                                        funcName: "gpii.pcp.updateSetting",
                                        args: ["{that}.model.path", "{change}.value"],
                                        excludeSource: "init"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });


    fluid.registerNamespace("gpii.pcp.settingsPanel");


    // TODO simplify - probably do this sort of mapping somewhere up the chain?
    gpii.pcp.settingsPanel.getRequiredResources = function (rowTemplate, exemplars) {
        function appendWidgetResources(resources, exemplars) {
            exemplars.forEach(function (exemplar) {
                resources[exemplar.options.widgetGrade] = exemplar.options.template;
            });
        }

        // TODO remove this ugliness
        var resources = {
            setting:  rowTemplate
        };

        appendWidgetResources(resources, exemplars);

        return resources;
    };


    /**
     * TODO check
     * Responsible for visualizing the list of user settings.
     * Behaviour:
     *  - Loads templates for the setting row and widget that is to be used
     *  - Once templates are loaded, dynamically creates and supplies container for a `settingRow` element, for every user setting
     * Expects: list of settings
     */
    fluid.defaults("gpii.pcp.settingsPanel", {
        gradeNames: "fluid.viewComponent",
        model: {
            //  pcp specific data (widgets)
            settings: []
        },
        members: {
            exemplarsList: "@expand:gpii.pcp.widgetExemplars.getExemplarsList({that}.options.exemplars)"
        },
        // TODO find better place/ name
        rowTemplate: "settingRow.html",

        components: {
            resourcesLoader: {
                type: "fluid.resourceLoader",
                options: {
                    // TODO settingRow component
                    resources: "@expand:gpii.pcp.settingsPanel.getRequiredResources({settingsPanel}.options.rowTemplate, {settingsPanel}.exemplarsList)",
                    listeners: {
                        onResourcesLoaded: "{settingsPanel}.events.onTemplatesLoaded"
                    }
                }
            },
            // TODO extract as grade
            // Represents the list of the settings component
            settingsVisualizer: {
                type: "gpii.pcp.settingsPanel.settingsVisualizer",
                createOnEvent: "onTemplatesLoaded",
                container: "{that}.container",
                options: {
                    exemplarsList: "{settingsPanel}.exemplarsList",
                    resources: "{resourcesLoader}.resources",
                    model: {
                        settings: "{settingsPanel}.model.settings"
                    }
                    
                    //TODO markup: "@expand: getLoadedMarkup"
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
//      components: {
//            preferenceSets: {
//                type: "gpii.pcp.settingRow",
//                container: "{header}.dom.preferenceSet",
//                options: {
//                    model: {
//                        option: "{header}.model.preferenceSets",
//                        //TODO TEST ONLY - include in the option
//                        icon: "{header}.model.icon"
//                    }
//                }
//            }
//        },
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
            settingsPanel: {
                type: "gpii.pcp.settingsPanel",
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
        console.log(main.settingsPanel);
        console.log(main.settingsPanel.settingsVisualizer);
        //var renderer = gpii.pcp.settingsPanel.settingsVisualizer.singleSettingRenderer("#flc-body");
        //console.log(renderer);
        //var renderer = gpii.pcp.settingsPanel.settingsVisualizer.singleSettingPresenter("#flc-body");
        //        var x = gpii.pcp.settingsPanel("#flc-settingsPanel");
        //console.log(x);
        // XXX Debuging
        //
        // .last
        // .getElementsByClass
    });
})();
