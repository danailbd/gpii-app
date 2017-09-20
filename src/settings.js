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
     * Utility function for retrieving the last sub-element of a container
     * @param container {Object} The jQuery container object
     * @returns {Object} A jQuery container object
     */
    gpii.pcp.getContainerLastChild = function (container) {
        return container.children().last();
    };


    /**
     * Represents an "exemplar" (configuration) for a component.
     * A good place to keep a *related template resource* path.
     */
    fluid.defaults("gpii.pcp.exemplar", {
        gradeNames: "fluid.component",
        mergePolicy: {
            widgetOptions: "noexpand"
        },
        template: null,
        grade: null,
        schemeType: null,
        widgetOptions: {
            // proper model bindings and options
            model: null,
            attrs: {}
        }
    });

    fluid.defaults("gpii.pcp.exemplar.settingsVisualizer", {
        gradeNames: "gpii.pcp.exemplar",

        template: "settingRow.html",
        grade: "gpii.pcp.settingsVisualizer"
    });

    fluid.defaults("gpii.pcp.exemplar.multipicker", {
        gradeNames: "gpii.pcp.exemplar",
        template: "multipicker.html",
        grade: "gpii.pcp.widgets.multipicker",
        schemeType: "array",
        widgetOptions: {
            model: {
                values: "{settingPresenter}.model.values",
                names: "{settingPresenter}.model.values",
                value: "{settingPresenter}.model.value"
            },
            attrs: {
                name: "{settingPresenter}.model.path"
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.switch", {
        gradeNames: "gpii.pcp.exemplar",
        template: "switch.html",
        grade: "gpii.pcp.widgets.switch",
        schemeType: "boolean",
        widgetOptions: {
            model: {
                enabled: "{settingPresenter}.model.value"
            },
            attrs: {
                name: "{settingPresenter}.model.path"
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.dropdown", {
        gradeNames: "gpii.pcp.exemplar",
        template: "dropdown.html",
        grade: "gpii.pcp.widgets.dropdown",
        schemeType: "string",
        widgetOptions: {
            model: {
                optionNames: "{settingPresenter}.model.values",
                optionList: "{settingPresenter}.model.values",
                selection: "{settingPresenter}.model.value"
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.slider", {
        gradeNames: "gpii.pcp.exemplar",
        template: "slider.html",
        grade: "gpii.pcp.widgets.slider",
        schemeType: "number",
        widgetOptions: {
            model: {
                value: "{settingPresenter}.model.value",
                step: "{settingPresenter}.model.divisibleBy",
                range: {
                    min: "{settingPresenter}.model.min",
                    max: "{settingPresenter}.model.max"
                }
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.stepper", {
        gradeNames: "gpii.pcp.exemplar",
        template: "stepper.html",
        grade: "gpii.pcp.widgets.stepper",
        schemeType: "numberStep",
        widgetOptions: {
            model: {
                value: "{settingPresenter}.model.value",
                step: "{settingPresenter}.model.divisibleBy",
                range: {
                    min: "{settingPresenter}.model.min",
                    max: "{settingPresenter}.model.max"
                }
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.textfield", {
        gradeNames: "gpii.pcp.exemplar",
        template: "textfield.html",
        grade: "gpii.pcp.widgets.textfield",
        schemeType: "text",
        widgetOptions: {
            model: {
                value: "{settingPresenter}.model.value"
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.radioToggle", {
        gradeNames: "gpii.pcp.exemplar",
        template: "radioToggle.html",
        grade: "gpii.pcp.widgets.radioToggle",
        schemeType: "radio",
        widgetOptions: {
            model: {
                enabled: "{settingPresenter}.model.value"
            },
            attrs: {
                name: "{settingPresenter}.model.path"
            }
        }
    });


    fluid.registerNamespace("gpii.pcp.widgetExemplars");

    gpii.pcp.widgetExemplars.getExemplarBySchemeType = function (widgetExemplars, schemeType) {
        return fluid.values(widgetExemplars)
            .filter(fluid.isComponent)
            .find(function matchType(exemplar) { return exemplar.options.schemeType === schemeType; });
    };

    /**
     * Represents an container for all exemplars for widgets
     * N.B. Sub components should be used as immutable objects!
     */
    fluid.defaults("gpii.pcp.widgetExemplars", {
        gradeNames: "fluid.component",
        components: {
            multipicker: {
                type: "gpii.pcp.exemplar.multipicker"
            },
            switch: {
                type: "gpii.pcp.exemplar.switch"
            },
            dropdown: {
                type: "gpii.pcp.exemplar.dropdown"
            },
            slider: {
                type: "gpii.pcp.exemplar.slider"
            },
            stepper: {
                type: "gpii.pcp.exemplar.stepper"
            },
            textfield: {
                type: "gpii.pcp.exemplar.textfield"
            },
            radioToggle: {
                type: "gpii.pcp.exemplar.radioToggle"
            }
        },
        invokers: {
            getExemplarBySchemeType: {
                funcName: "gpii.pcp.widgetExemplars.getExemplarBySchemeType",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });


    /**
     * Creates the binding with the already rendered DOM elements.
     * Expects: widget configuration and model
     */
    fluid.defaults("gpii.pcp.settingPresenter", {
        gradeNames: "fluid.viewComponent",
        selectors: {
            icon: ".flc-icon",
            title: ".flc-title",
            widget: ".flc-widget"
        },
        model: {
            icon: null,
            title: null,
            values: null,
            value: null
        },
        widgetConfig: {
            widgetOptions: null,
            grade: null
        },

        components: {
            widget: {
                type: "{that}.options.widgetConfig.options.grade",
                container: "{that}.dom.widget",
                options: "{settingPresenter}.options.widgetConfig.options.widgetOptions"
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

    /**
     * Renders all related markup for a setting:
     * - container;
     * - setting markup;
     * - widget markup
     * Expects: markup
     * Saves the newly created setting outer container internally
     */
    fluid.defaults("gpii.pcp.settingRenderer", {
        gradeNames: "fluid.viewComponent",

        markup: {
            container: null,
            setting: null,
            widget: null
        },

        model: {
            // Save the container created
            settingContainer: null
        },
        events: {
            onSettingContainerRendered: null,
            onSettingMarkupRendered: null,
            onWidgetMarkupRendered: null
        },
        components: {
            /*
             * Render the outer most container for the setting
             */
            renderSettingContainer: {
                type: "fluid.viewComponent",
                container: "{that}.container",
                options: {
                    // TODO extract as component -> container renderer?
                    listeners: {
                        "onCreate.render": {
                            this: "{that}.container",
                            method: "append",
                            args: ["{settingRenderer}.options.markup.container"]
                        },
                        "onCreate.updateContainer": {
                            funcName: "{settingRenderer}.setContainer",
                            args: "@expand:gpii.pcp.getContainerLastChild({that}.container)",
                            priority: "after:render"
                        },
                        "onCreate.notify": {
                            funcName: "{settingRenderer}.events.onSettingContainerRendered.fire",
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
                            args: "{settingRenderer}.options.markup.setting"
                        },
                        "onCreate.notify": {
                            funcName: "{settingRenderer}.events.onSettingMarkupRendered.fire",
                            /*
                             * Get the widget container.
                             * Should match single element (jquery returns an array of matches)
                             */
                            args: "@expand:$({that}.options.widgetContainerClass, {that}.container)",
                            priority: "after:render"
                        }
                    }
                }
            },
            /*
             * Render widget related markup
             */
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
                            args: "{settingRenderer}.options.markup.widget"
                        },
                        "onCreate.notify": {
                            funcName: "{settingRenderer}.events.onWidgetMarkupRendered.fire",
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


    /**
     * Handles visualization of single setting.
     * Expects: markup for the all containers and the widget; widgetConfig needed for the setting; the setting
     */
    fluid.defaults("gpii.pcp.settingVisualizer",  {
        gradeNames: "fluid.viewComponent",

        setting: null,
        widgetConfig: null,
        markup: {
            container: null,
            setting: null,
            widget: null
        },

        events: {
            // XXX not quite valid naming as the widget component (in settingPresenter) also renders
            onSettingRendered: null
        },
        components: {
            settingRenderer: {
                type: "gpii.pcp.settingRenderer",
                container: "{that}.container",

                options: {
                    markup: "{settingVisualizer}.options.markup",
                    listeners: {
                        "onWidgetMarkupRendered.notify": {
                            funcName: "{settingVisualizer}.events.onSettingRendered.fire",
                            // pass the created by the subcomponent container
                            args: "{that}.model.settingContainer"
                        }
                    }
                }
            },
            settingPresenter: {
                type: "gpii.pcp.settingPresenter",
                createOnEvent: "onSettingRendered",
                container: "{arguments}.0",
                options: {
                    widgetConfig: "{settingVisualizer}.options.widgetConfig",
                    model: "{settingVisualizer}.options.setting",

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
    });


    fluid.registerNamespace("gpii.pcp.settingsVisualizer");


    /**
     * Constructs the markup for the indexed container - sets proper index.
     *
     * @param markup {Object}
     * @param markup.containerClassPrefix {String} The class prefix for the indexed container.
     *   Should have a `id` interpolated expression.
     * @param markup.container {String} The markup which is to be interpolated with the container index.
     *   Should have a `containerClass` interpolated expression.
     * @param containerIndex {Number} The index for the container
     * @returns {String}
     */
    gpii.pcp.settingsVisualizer.getIndexedContainerMarkup = function (markup, containerIndex) {
        // Remove the "." prefix
        var containerClass = fluid.stringTemplate(markup.containerClassPrefix, { id: containerIndex });
        return fluid.stringTemplate(markup.container, { containerClass: containerClass });
    };

    /**
     * Simple getter for the property that supports complex keys containing '.' (dots).
     */
    gpii.pcp.getProperty = function (obj, property) {
        return obj && obj[property];
    };


    gpii.pcp.settingsVisualizer.updateSettingsPresentations = function (that, settings) {
        // TODO improve
        settings.forEach(function (setting, settingIndex) {
            that.events.onSettingCreated.fire(settingIndex, setting);
        });
    };

    /*
     * With markup given, visualizes the list of settings passed - rendering and binding of each.
     * Expects:
     *   - settings list;
     *   - widgetExemplars containing widget related options;
     *   - markup
     */
    fluid.defaults("gpii.pcp.settingsVisualizer", {
        gradeNames: "fluid.viewComponent",

        model: {
            settings: null
        },
        widgetExemplars: [],
        markup: {
            setting: null,
            // per widget exemplar property
        },
        dynamicContainerMarkup: {
            container: "<div class=\"%containerClass\"></div>",
            containerClassPrefix: "flc-settingListRow-%id"
        },
        events: {
            onSettingCreated: null
        },
        modelListeners: {
            settings: {
                func: "{that}.updateSettingsPresentations",
                args: ["{that}", "{that}.model.settings"]
            }
        },
        invokers: {
            updateSettingsPresentations: {
                funcName: "gpii.pcp.settingsVisualizer.updateSettingsPresentations"
            }
        },
        dynamicComponents: {
            settingVisualizer: {
                type: "gpii.pcp.settingVisualizer",
                container: "{that}.container",
                createOnEvent: "onSettingCreated",
                options: {
                    settingIndex: "{arguments}.0",
                    setting: "{arguments}.1",

                    widgetConfig: "@expand:{settingsVisualizer}.options.widgetExemplars.getExemplarBySchemeType({that}.options.setting.type)",
                    markup: {
                        container: "@expand:gpii.pcp.settingsVisualizer.getIndexedContainerMarkup({settingsVisualizer}.options.dynamicContainerMarkup, {that}.options.settingIndex)",
                        setting: "{settingsVisualizer}.options.markup.setting", // markup.setting",
                        widget: "@expand:gpii.pcp.getProperty({settingsVisualizer}.options.markup, {that}.options.widgetConfig.options.grade)"
                    }
                }
            }
        }
    });


    fluid.registerNamespace("gpii.pcp.settingsPanel");

    gpii.pcp.settingsPanel.getExemplarsList = function (exemplars) {
        return fluid.values(exemplars)
            .filter(fluid.isComponent);
    };

    /**
     * Simplifies the `fluid.resourcesLoader`'s resource object, to supply only the fetched data.
     *
     * @param resources {Object} The `fluid.resourceLoader`'s `resource` object after fetch.
     * @returns {Object} Object with properties like: `{resourceKey}: {resourceText}`
     */
    gpii.pcp.settingsPanel.flattenResources = function (resources) {
        return fluid.keys(resources)
            .reduce(function (markupMap, resourceKey) {
                markupMap[resourceKey] = resources[resourceKey].resourceText;
                return markupMap;
            }, {});
    };

    /**
     * Resources that are to be fetched - settings inner container and widgets'.
     *
     * @param settingExemplar {Object} A 'gpii.pcp.exemplar.settingsVisualizer' object.
     *   Note: it has a fixed key.
     * @param widgetExemplarsList {Object[]} The list of `gpii.pcp.exemplar`-s
     */
    gpii.pcp.settingsPanel.getResourcesToFetch = function (settingExemplar, widgetExemplarsList) {
        function getWidgetResources(exemplars) {
            return exemplars.reduce(function (markup, exemplar) {
                markup[exemplar.options.grade] = exemplar.options.template;
                return markup;
            }, {});
        }

        var settingsVisualizerMarkup = {
            setting:  settingExemplar.options.template
        };
        var widgetsMarkup = getWidgetResources(widgetExemplarsList);

        return Object.assign(settingsVisualizerMarkup, widgetsMarkup);
    };

    /**
     * The top most component for representation of list of settings.
     * Responsible for fetching all related templates, and visualization of settings
     * Expects: list of settings
     */
    fluid.defaults("gpii.pcp.settingsPanel", {
        gradeNames: "fluid.viewComponent",
        model: {
            settings: []
        },

        components: {
            settingsExemplars: {
                type: "fluid.component",
                options: {
                    members: {
                        widgetExemplarsList: "@expand:gpii.pcp.settingsPanel.getExemplarsList({that}.widgetExemplars)"
                    },
                    components: {
                        widgetExemplars: {
                            type: "gpii.pcp.widgetExemplars"
                        },
                        settingsVisualizerExemplar: {
                            type: "gpii.pcp.exemplar.settingsVisualizer"
                        }
                    }
                }
            },
            resourcesLoader: {
                type: "fluid.resourceLoader",
                options: {
                    resources: "@expand:gpii.pcp.settingsPanel.getResourcesToFetch({settingsExemplars}.settingsVisualizerExemplar, {settingsExemplars}.widgetExemplarsList)",
                    listeners: {
                        onResourcesLoaded: "{settingsPanel}.events.onTemplatesLoaded"
                    }
                }
            },
            // Represents the list of the settings component
            settingsVisualizer: {
                type: "gpii.pcp.settingsVisualizer",
                createOnEvent: "onTemplatesLoaded",
                container: "{that}.container",
                options: {
                    widgetExemplars: "{settingsExemplars}.widgetExemplars",
                    markup: "@expand:gpii.pcp.settingsPanel.flattenResources({resourcesLoader}.resources)",
                    model: {
                        settings: "{settingsPanel}.model.settings"
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
            settingsPanel: {
                type: "gpii.pcp.settingsPanel",
                container: "{that}.dom.settingsList",
                createOnEvent: "onAvailableSettngsReceived",
                options: {
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
        //var renderer = gpii.pcp.settingsPanel.settingsVisualizer.settingRenderer("#flc-body");
        //console.log(renderer);
        //var renderer = gpii.pcp.settingsPanel.settingsVisualizer.settingPresenter("#flc-body");
        //        var x = gpii.pcp.settingsPanel("#flc-settingsPanel");
        //console.log(x);
        // XXX Debuging
        //
        // .last
        // .getElementsByClass
    });
})();
