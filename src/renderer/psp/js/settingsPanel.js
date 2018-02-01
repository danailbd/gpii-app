/**
 * The settings panel component for visualizing user settings.
 *
 * Contains all necessary components in order for the user settings to be visualized (i.e.
 * means for drawing the corresponding widgets, handling user input and removing the DOM
 * elements when they are no longer needed).
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

    fluid.registerNamespace("gpii.psp");
    fluid.registerNamespace("gpii.psp.utils");


    /**
     * Utility function for retrieving the last sub-element of a container
     * @param container {jQuery} The jQuery container object
     * @return {jQuery} A jQuery container object
     */
    gpii.psp.utils.getContainerLastChild = function (container) {
        return container.children().last();
    };

    /**
     * A simple wrapper for the remove function
     * @param container {jQuery} A jQuery object
     */
    gpii.psp.utils.removeContainer = function (container) {
        if (container) {
            container.remove();
        }
    };



    fluid.defaults("gpii.psp.repeater.renderer", {
        gradeNames: "fluid.viewComponent",

        markup: {
            container: null,
            element:   null
        },

        model: {
            // Save the container created
            renderedContainer: null
        },
        events: {
            onElementRendered: {
                events: {
                    onContainerRendered: "onContainerRendered",
                    onMarkupRendered:    "onMarkupRendered"
                },
                args: ["{that}.model.renderedContainer"]
            },

            onContainerRendered: null,
            onMarkupRendered:    null
        },
        listeners: {
            "onDestroy.clearInjectedMarkup": {
                funcName: "gpii.psp.utils.removeContainer",
                args: "{that}.model.renderedContainer"
            }
        },
        components: {
            /*
             * Render the outer most container for the element
             */
            renderElementContainer: {
                type: "fluid.viewComponent",
                container: "{that}.container",
                options: {
                    // TODO DOCS what magic is done here
                    listeners: {
                        "onCreate.render": {
                            this: "{that}.container",
                            method: "append",
                            args: ["{renderer}.options.markup.container"]
                        },
                        "onCreate.updateContainer": {
                            funcName: "{renderer}.setContainer",
                            args: "@expand:gpii.psp.utils.getContainerLastChild({that}.container)",
                            priority: "after:render"
                        },
                        "onCreate.notify": {
                            funcName: "{renderer}.events.onContainerRendered.fire",
                            // Get the newly created container
                            priority: "after:updateContainer"
                        }
                    }
                }
            },
            /**
             * Renders the markup inside the dedicated container
             */
            renderElementMarkup: {
                type: "fluid.viewComponent",
                container: "{that}.model.renderedContainer",
                createOnEvent: "onContainerRendered",
                options: {
                    listeners: {
                        "onCreate.render": {
                            this: "{that}.container",
                            method: "append",
                            args: "{renderer}.options.markup.element"
                        },
                        "onCreate.notify": {
                            funcName: "{renderer}.events.onMarkupRendered.fire",
                            args: ["{that}.model.renderedContainer"],
                            priority: "after:render"
                        }
                    }
                }
            }
        },
        invokers: {
            setContainer: {
                changePath: "renderedContainer",
                value: "{arguments}.0"
            }
        }
    });

    /*

        Generates something similar to:
      <div class="flc-element-1">
            // markup
      </div>

     */
    fluid.defaults("gpii.psp.repeater.element", {
        gradeNames: "fluid.viewComponent",

        item:           null, // XXX I really wished this was in the model
        index:          null,
        handlerOptions: null,

        markup: {
            container: null,
            element:   null
        },

        events: {
            onElementRendered: null // thrown once all rendering is completed
        },

        components: {
            renderer: { // injects the markup to the DOM; container + markup
                type: "gpii.psp.repeater.renderer",
                container: "{that}.container",
                options: {
                    markup: "{element}.options.markup",

                    listeners: {
                        // Avoid injection as we want to use a boiled event
                        onElementRendered: "{element}.events.onElementRendered.fire"
                    }
                }
            },
            handler: {
                type: "{that}.options.handlerOptions.type",
                createOnEvent: "onElementRendered",
                container: "{arguments}.0",
                options: {
                    model: {
                        item: "{element}.options.item"
                    },
                    parent: "{element}.options.handlerOptions.parent"
                }
            }
        }
    });


    /*
        Expects:
            handlerType: "gpii.psp.groupElement" | "gpii.psp.settingElement"
            getMarkup
            items
            container class
     */
    fluid.defaults("gpii.psp.repeater", {
        gradeNames: "fluid.viewComponent",

        model: {
            items: [] // the items to be repeated
        },
        handlerOptions: {
            type:   null,
            parent: "{that}"
        },

        invokers: {
            // TODO docs
            getMarkup: { // expected from parent
                funcName: "fluid.notImplemented",
                args: ["{arguments}.0"] // item
            }
        },

        dynamicContainerMarkup: {
            container:            "<div class=\"%containerClass\"></div>",
            containerClassPrefix: "flc-dynamicElement-%id"      // preferably altered by the parent
        },

        dynamicComponents: {
            element: {
                type: "gpii.psp.repeater.element",
                container: "{that}.container",
                sources: "{repeater}.model.items",
                options: {
                    // repeat by array
                    index: "{sourcePath}",
                    item:  "{source}",
                    handlerOptions: "{repeater}.options.handlerOptions",

                    markup: {
                        // TODO think about moving inside
                        container: "@expand:gpii.psp.repeater.getIndexedContainerMarkup({repeater}.options.dynamicContainerMarkup, {that}.options.index)",
                        // generated dynamicaly using the current item
                        element: "@expand:{repeater}.getMarkup({that}.options.item, {that}.options.index)"
                    },

                    listeners: {
                        onCreate: {
                            this: "console",
                            method: "log",
                            args: [
                                "Element Created",
                                "{that}.options.item"
                            ]
                        }
                    }
                }
            }
        }
    });

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
    gpii.psp.repeater.getIndexedContainerMarkup = function (markup, containerIndex) {
        // Remove the "." prefix
        var containerClass = fluid.stringTemplate(markup.containerClassPrefix, { id: containerIndex });
        return fluid.stringTemplate(markup.container, { containerClass: containerClass });
    };



    /**
     * Creates the binding with the already rendered DOM elements.
     * Expects: widget configuration and model
     */
    fluid.defaults("gpii.psp.settingPresenter", {
        // TODO repreater handler base component
        gradeNames: "fluid.viewComponent",
        selectors: {
            solutionName: ".flc-solutionName",
            title: ".flc-title:eq(0)",
            titleLabel: ".flc-titleLabel",
            memoryIcon: ".flc-memoryIcon:eq(0)",
            restartIcon: ".flc-restartIcon",
            widget: ".flc-widget",
            subsettings: ".flc-subsettings"
        },
        styles: {
            osRestartIcon: "fl-icon-osRestart",
            appRestartIcon: "fl-icon-appRestart",
            valueChanged: "fl-icon-filled"
        },
        labels: {
            osRestart: "To change this setting,\nWindows requires a restart.",
            osRestartRequired: "You changed this setting, which\nrequires Windows to restart.",
            appRestart: "%solutionName - To change this setting,\nthe app requires a restart.",
            appRestartRequired: "%solutionName - You changed this setting,\nwhich requires the app to restart."
        },
        model: {
            item: {}, // passed by repeater
            // TODO DEV
            path:         "{that}.model.item.path",
            solutionName: "{that}.model.item.solutionName",
            value:        "{that}.model.item.value",
            schema:       "{that}.model.item.schema",
            liveness:     "{that}.model.item.liveness", // "live", "liveRestart", "manualRestart", "OSRestart"
            memory:       "{that}.model.item.memory"
        },
        members: {
            // Keep a reference to the parent component
            // This way the parent (options provider) can be dynamically decided
            parent: "{{that}.options.parent}"
        },
        // TODO tried with "gpii.psp.settingsVisualizer" but it won't work
        // looks like this is not used
        widgetConfig: "@expand:{that}.parent.options.widgetExemplars.getExemplarBySchemaType({that}.model.item.schema.type)",

        events: {
            onSettingUpdated: "{settingsPanel}.events.onSettingUpdated",
            onSettingAltered: "{settingsPanel}.events.onSettingAltered",
            onRestartRequired: "{settingsPanel}.events.onRestartRequired"
        },

        components: {
            widget: {
                type: "{that}.options.widgetConfig.options.grade",
                container: "{that}.dom.widget",
                // XXX currently, we exploit a misbehavior of expanding the `model` options, even if there's been expansion
                options: "{settingPresenter}.options.widgetConfig.options.widgetOptions"
            },
            subsettings: {
                type: "gpii.psp.settingsVisualizer",
                container: "{that}.dom.subsettings",
                options: {
                    markup:          "{settingGroupsVisualizer}.options.markup",
                    widgetExemplars: "{settingGroupsVisualizer}.options.widgetExemplars",

                    model: {
                        items: "{settingPresenter}.model.item.subsettings"
                    }
                }
            }
        },
        modelListeners: {
            value: {
                funcName: "{that}.events.onSettingAltered.fire",
                args: ["{that}.model", "{change}.oldValue"],
                excludeSource: ["init", "psp.mainWindow"]
            }
        },
        listeners: {
            "onCreate.setSolutionName": {
                this: "{that}.dom.solutionName",
                method: "text",
                args: "{that}.model.solutionName"
            },
            "onCreate.setTitle": {
                this: "{that}.dom.title",
                method: "text",
                args: "{that}.model.schema.title"
            },
            "onCreate.setLabelId": {
                this: "{that}.dom.titleLabel",
                method: "attr",
                args: ["id", "{that}.model.path"]
            },
            "onCreate.showMemoryIcon": {
                funcName: "gpii.psp.settingPresenter.showMemoryIcon",
                args: ["{that}", "{that}.dom.memoryIcon"]
            },
            "onCreate.showRestartIcon": {
                funcName: "gpii.psp.settingPresenter.showRestartIcon",
                args: ["{that}", "{that}.dom.restartIcon"]
            },
            // Update value locally in order for the corresponding
            //   DOM elements to be notifier, and thus updated
            "onSettingUpdated": {
                funcName: "gpii.psp.settingPresenter.updateModelIfNeeded",
                args: [
                    "{that}",
                    "{arguments}.0", // path
                    "{arguments}.1"  // newValue
                ]
            },
            "onRestartRequired": {
                funcName: "gpii.psp.settingPresenter.updateRestartIcon",
                args: [
                    "{that}",
                    "{arguments}.0", // pendingChanges
                    "{that}.dom.restartIcon"
                ]
            }
        }
    });

    /**
     * Notifies the corresponding widget components about an update on the setting
     * in case the update is reffering current setting
     */
    gpii.psp.settingPresenter.updateModelIfNeeded = function (that, path, newValue) {
        if (path === that.model.path) {
            that.applier.change("value", newValue, null, "psp.mainWindow");
        }
    };

    /**
     * Returns the appropriate tooltip label for the restart icon depending on whether the
     * setting has has a "manualRestart" or an "OSRestart" liveness, and on whether the
     * user has modified the setting's value.
     * @param setting {Object} An object representing the setting.
     * @param hasPendingChange {Boolean} Whether the user has modified the setting for which
     * the restart icon tooltip label is to be calculated.
     * @param labels {Object} A set of labels to choose from when calculating the restart icon
     * tooltip label.
     * @return The tooltip label for the restart icon.
     */
    gpii.psp.settingPresenter.getRestartIconLabel = function (setting, hasPendingChange, labels) {
        if (setting.liveness === "manualRestart") {
            var label = hasPendingChange ? labels.appRestartRequired : labels.appRestart;
            return fluid.stringTemplate(label, {
                solutionName: fluid.isValue(setting.solutionName) ? setting.solutionName : setting.schema.title
            });
        }

        if (setting.liveness === "OSRestart") {
            return hasPendingChange ? labels.osRestartRequired : labels.osRestart;
        }
    };

    /**
     * A function responsible for showing, styling and adding the appropriate tooltip to
     * the restart icon if the setting has a "manualRestart" or an "OSRestart" liveness.
     * @param that {Component} An instance of `gpii.psp.settingPresenter`.
     * @param restartIcon {jQuery} A jQuery object representing the restart icon.
     */
    gpii.psp.settingPresenter.showRestartIcon = function (that, restartIcon) {
        var liveness = that.model.liveness,
            styles = that.options.styles,
            labels = that.options.labels;

        if (liveness === "manualRestart" || liveness === "OSRestart") {
            var iconClass = liveness === "manualRestart" ? styles.appRestartIcon : styles.osRestartIcon,
                label = gpii.psp.settingPresenter.getRestartIconLabel(that.model, false, labels);
            restartIcon
                .addClass(iconClass)
                .attr("title", label)
                .show();
        } else {
            restartIcon.hide();
        }
    };

    /**
     * A function responsible for restyling the restart icon and changing its tooltip when
     * the user modifies the corresponding setting.
     * @param that {Component} An instance of `gpii.psp.settingPresenter`.
     * @param pendingChanges {Array} An array of all pending setting changes that the user
     * has made.
     * @param restartIcon {jQuery} A jQuery object representing the restart icon.
     */
    gpii.psp.settingPresenter.updateRestartIcon = function (that, pendingChanges, restartIcon) {
        var liveness = that.model.liveness,
            path = that.model.path,
            styles = that.options.styles,
            labels = that.options.labels;

        if (liveness === "manualRestart" || liveness === "OSRestart") {
            var pendingChange = fluid.find_if(pendingChanges, function (change) {
                return change.path === path;
            });

            if (pendingChange) {
                restartIcon.addClass(styles.valueChanged);
            } else {
                restartIcon.removeClass(styles.valueChanged);
            }

            var label = gpii.psp.settingPresenter.getRestartIconLabel(that.model, pendingChange, labels);
            restartIcon.attr("title", label);
        }
    };

    /**
     * A function responsible for showing a memory icon if the setting will be
     * persisted after a user has changed it.
     * @param that {Component} An instance of `gpii.psp.settingPresenter`.
     * @param memoryIcon {jQuery} A jQuery object representing the memory icon.
     */
    gpii.psp.settingPresenter.showMemoryIcon = function (that, memoryIcon) {
        if (that.model.memory) {
            memoryIcon.show();
        } else {
            memoryIcon.hide();
        }
    };


    fluid.defaults("gpii.psp.settingGroupPresenter", {
        gradeNames: "fluid.viewComponent",

        selectors: {
            label: ".flc-label",
            settings: ".flc-settings" // the settings container
        },

        model: {
            item:     {}, // from the repeater
            label:    "{that}.model.item.label",
            settings: "{that}.model.item.settings"
        },

        components: {
            settings: {
                type: "gpii.psp.settingsVisualizer",
                container: "{that}.dom.settings",
                options: {
                    // TODO
                    markup:          "{settingGroupsVisualizer}.options.markup",
                    widgetExemplars: "{settingGroupsVisualizer}.options.widgetExemplars",

                    model: {
                        items: "{settingGroupPresenter}.model.settings"
                    }
                }
            }
        },

        listeners: {
            "onCreate.setLabel": {
                this: "{that}.dom.label",
                method: "text",
                args: "{that}.model.label"
            }
        }
    });


    fluid.defaults("gpii.psp.settingGroupsVisualizer", {
        gradeNames: "gpii.psp.repeater",

        /// Expected from parent
        model: {
            items: null // settingGroups
        },

        widgetExemplars: null, // passed from parent
        markup: { // from parent
            group: "<div class=\"flc-label\"></div><div class=\"flc-settings\"></div>"
        },

        handlerOptions: {
            type:   "gpii.psp.settingGroupPresenter",
            parent: "{that}"
        },

        dynamicContainerMarkup: {
            containerClassPrefix: "flc-settingGroup-%id"
        },

        invokers: {
            getMarkup: {
                funcName: "gpii.psp.settingGroupsVisualizer.getMarkup",
                args: [
                    "{that}.options.markup",
                    "{arguments}.0",
                    "{arguments}.1"
                ]
            }
        }
    });

    gpii.psp.settingGroupsVisualizer.getMarkup = function (markup/*, group */) {
        return fluid.stringTemplate(markup.group);
    };

    /*
     * TODO
     * With markup given, visualizes the list of settings passed - rendering and binding of each.
     * Expects:
     *   - settings list;
     *   - widgetExemplars containing widget related options;
     *   - markup
     */
    fluid.defaults("gpii.psp.settingsVisualizer", {
        gradeNames: "gpii.psp.repeater",

        model: {
            items: null // settings
        },

        handlerOptions: {
            type:   "gpii.psp.settingPresenter",
            parent: "{that}"
        },

        widgetExemplars: null, // passed from parent
        markup: {
            setting: null
            // per widget exemplar property
        },
        dynamicContainerMarkup: {
            containerClassPrefix: "flc-settingListRow-%id"
        },

        invokers: {
            getMarkup: {
                funcName: "gpii.psp.settingsVisualizer.getMarkup",
                args: [
                    "{that}.options.markup",
                    "{that}.options.widgetExemplars",
                    "{arguments}.0",
                    "{arguments}.1"
                ]
            }
        }
    });

    gpii.psp.settingsVisualizer.getMarkup = function (markup, widgetExemplars, setting) {
        var widgetConfig = widgetExemplars.getExemplarBySchemaType(setting.schema.type);
        var widgetMarkup = markup[widgetConfig.options.grade];

        return fluid.stringTemplate(markup.setting, {widgetMarkup: widgetMarkup});
    };


    /**
     * The top most component for representation of list of settings.
     * Responsible for fetching all related templates, and visualization of settings
     * Expects: list of settings
     */
    fluid.defaults("gpii.psp.settingsPanel", {
        gradeNames: "fluid.viewComponent",
        model: {
            settingGroups: []
        },
        components: {
            settingsExemplars: {
                type: "fluid.component",
                options: {
                    members: {
                        widgetExemplarsList: "@expand:gpii.psp.settingsPanel.getExemplarsList({that}.widgetExemplars)"
                    },
                    components: {
                        widgetExemplars: {
                            type: "gpii.psp.widgetExemplars"
                        },
                        settingsVisualizerExemplar: {
                            type: "gpii.psp.exemplar.settingsVisualizer"
                        }
                    }
                }
            },
            resourcesLoader: {
                type: "fluid.resourceLoader",
                options: {
                    resources: "@expand:gpii.psp.settingsPanel.getResourcesToFetch({settingsExemplars}.settingsVisualizerExemplar, {settingsExemplars}.widgetExemplarsList)",
                    listeners: {
                        onResourcesLoaded: "{settingsPanel}.events.onTemplatesLoaded"
                    }
                }
            },
            // Represents the list of the settings component
            settingsVisualizer: {
                type: "gpii.psp.settingGroupsVisualizer",
                createOnEvent: "onTemplatesLoaded",
                container: "{that}.container",
                options: {
                    widgetExemplars: "{settingsExemplars}.widgetExemplars",
                    markup: "@expand:gpii.psp.settingsPanel.flattenResources({resourcesLoader}.resources)",
                    model: {
                        items: "{settingsPanel}.model.settingGroups"
                    }
                }
            }
        },
        events: {
            onTemplatesLoaded: null,
            onSettingAltered: null,
            onSettingUpdated: null, // passed from outside
            onRestartRequired: null
        }
    });

    /**
     * Returns list of exemplars.
     * @param exemplars {Object} The `gpii.psp.widgetExemplars` object
     * @return {Object[]} A list of `gpii.psp.exemplar` objects
     */
    gpii.psp.settingsPanel.getExemplarsList = function (exemplars) {
        return fluid.values(exemplars)
            .filter(fluid.isComponent);
    };

    /**
     * Simplifies the `fluid.resourcesLoader`'s resource object, to supply only the fetched data.
     *
     * @param resources {Object} The `fluid.resourceLoader`'s `resource` object after fetch.
     * @return {Object} Object with properties like: `{resourceKey}: {resourceText}`
     */
    gpii.psp.settingsPanel.flattenResources = function (resources) {
        return fluid.keys(resources)
            .reduce(function (markupMap, resourceKey) {
                markupMap[resourceKey] = resources[resourceKey].resourceText;
                return markupMap;
            }, {});
    };

    /**
     * Resources that are to be fetched - settings inner container and widgets'.
     *
     * @param settingExemplar {Object} A 'gpii.psp.exemplar.settingsVisualizer' object.
     *   Note: it has a fixed key.
     * @param widgetExemplarsList {Object[]} The list of `gpii.psp.exemplar`-s
     */
    gpii.psp.settingsPanel.getResourcesToFetch = function (settingExemplar, widgetExemplarsList) {
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
})(fluid);
