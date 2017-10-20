"use strict";
(function () {
    var fluid = window.fluid,
        gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.pcp");


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
        schemaType: null,
        widgetOptions: {
            // proper model bindings and options
            model: null
        }
    });

    fluid.defaults("gpii.pcp.exemplar.settingsVisualizer", {
        gradeNames: "gpii.pcp.exemplar",

        template: "html/settingRow.html",
        grade: "gpii.pcp.settingsVisualizer"
    });

    fluid.defaults("gpii.pcp.exemplar.multipicker", {
        gradeNames: "gpii.pcp.exemplar",
        template: "html/multipicker.html",
        grade: "gpii.pcp.widgets.multipicker",
        schemaType: "array",
        widgetOptions: {
            model: {
                path: "{settingPresenter}.model.path",
                values: "{settingPresenter}.model.values",
                names: "{settingPresenter}.model.values",
                value: "{settingPresenter}.model.value"
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.switch", {
        gradeNames: "gpii.pcp.exemplar",
        template: "html/switch.html",
        grade: "gpii.pcp.widgets.switch",
        schemaType: "boolean",
        widgetOptions: {
            model: {
                path: "{settingPresenter}.model.path",
                name: "{settingPresenter}.model.path",
                title: "{settingPresenter}.model.title",
                enabled: "{settingPresenter}.model.value"
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.dropdown", {
        gradeNames: "gpii.pcp.exemplar",
        template: "html/dropdown.html",
        grade: "gpii.pcp.widgets.dropdown",
        schemaType: "string",
        widgetOptions: {
            model: {
                path: "{settingPresenter}.model.path",
                optionNames: "{settingPresenter}.model.values",
                optionList: "{settingPresenter}.model.values",
                selection: "{settingPresenter}.model.value"
            }
        }
    });

    fluid.defaults("gpii.pcp.exemplar.stepper", {
        gradeNames: "gpii.pcp.exemplar",
        template: "html/stepper.html",
        grade: "gpii.pcp.widgets.stepper",
        schemaType: "number",
        widgetOptions: {
            model: {
                path: "{settingPresenter}.model.path",
                number: "{settingPresenter}.model.value",
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
        template: "html/textfield.html",
        grade: "gpii.pcp.widgets.textfield",
        schemaType: "text",
        widgetOptions: {
            model: {
                path: "{settingPresenter}.model.path",
                value: "{settingPresenter}.model.value"
            }
        }
    });

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
            stepper: {
                type: "gpii.pcp.exemplar.stepper"
            },
            textfield: {
                type: "gpii.pcp.exemplar.textfield"
            }
        },
        invokers: {
            getExemplarBySchemaType: {
                funcName: "gpii.pcp.widgetExemplars.getExemplarBySchemaType",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });


    /**
     * Returns `gpii.pcp.exemplar` object for given schema (PCP channel type) type
     * @param widgetExemplars {Object} The `gpii.pcp.widgetExemplar` object
     * @param schemaType {String}
     * @returns {Object} The matching `gpii.pcp.exemplar` object
     */
    gpii.pcp.widgetExemplars.getExemplarBySchemaType = function (widgetExemplars, schemaType) {
        return fluid.values(widgetExemplars)
            .filter(fluid.isComponent)
            .find(function matchType(exemplar) { return exemplar.options.schemaType === schemaType; });
    };
})();
