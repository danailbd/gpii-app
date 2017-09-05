"use strict";
(function () {
    var fluid = window.fluid,
        gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.app.settings.widgets");

    gpii.app.settings.widgets.noop = function () {
        // A function that does nothing.
    };

    // TODO handle empty array (add expander)
    fluid.defaults("gpii.app.settings.widgets.dropDown", {
        gradeNames: "fluid.viewComponent",
        model: {
            optionNames: [],
            optionList: [],
            selection: null
        },
        components: {
            renderDropDownTemplate: {
                type:  "fluid.viewComponent",
                container: "{dropDown}.container",
                options: {
                    gradeNames: "fluid.resourceLoader",
                    resources: {
                        template: "./dropDown.html"
                    },
                    listeners: {
                        "onResourcesLoaded.append": {
                            "this": "{that}.container",
                            method: "append",
                            args: "{resourceLoader}.resources.template.resourceText"
                        },
                        "onResourcesLoaded.render": "{dropDown}.events.onTemplateRendered"
                    }
                }
            },
            dropDownHolder: {
                type: "fluid.rendererComponent",
                container: "{dropDown}.container",
                createOnEvent: "onTemplateRendered",
                options: {
                    selectors: {
                        // from the injested html
                        options: ".flc-dropDown-options"
                    },
                    model: {
                        optionnames: "{dropDown}.model.optionNames",
                        optionlist: "{dropDown}.model.optionList",
                        selection: "{dropDown}.model.selection"
                    },
                    protoTree: {
                        options: {
                            optionnames: "${optionnames}",
                            optionlist: "${optionlist}",
                            selection: "${selection}"
                        }
                    },
                    modelListeners: {
                        selection: "{dropDown}.events.onOptionChanged"
                    },
                    renderOnInit: true
                }
            }
        },
        events: {
            onOptionChanged: null,
            onTemplateLoaded: null,
            onTemplateRendered: null
        }
    });

    fluid.defaults("gpii.app.settings.widgets.button", {
        gradeNames: ["fluid.viewComponent"],
        label: null,
        listeners: {
            "onCreate.bindClickEvt": {
                "this": "{that}.container",
                method: "click",
                args: ["{that}.onClick"]
            },
            "onCreate.initText": {
                "this": "{that}.container",
                method: "text",
                args: ["{that}.options.label"]
            }
        },
        invokers: {
            onClick: {
                funcName: "gpii.app.settings.noop"
            }
        }
    });

    gpii.app.settings.widgets.onRadioToggleChanged = function (that, onInput, offInput) {
        var input = that.model.enabled ? onInput : offInput;
        input.attr("checked", true);
    };

    gpii.app.settings.widgets.toggleRadioModel = function (that) {
        that.applier.change("enabled", !that.model.enabled);
    };

    fluid.defaults("gpii.app.settings.widgets.radioToggle", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            enabled: false
        },
        template: "./radioToggle.html",
        attrs: {
            // it is mandatory to specify "name" here!
        },
        strings: {
            on: "On",
            off: "Off"
        },
        modelListeners: {
            enabled: {
                funcName: "gpii.app.settings.widgets.onRadioToggleChanged",
                args: ["{that}", "{that}.dom.onInput", "{that}.dom.offInput"]
            }
        },
        selectors: {
            inputs: ".flc-radioToggleInput",
            onLabel: ".flc-radioToggleLabel-on",
            offLabel: ".flc-radioToggleLabel-off",
            onInput: ".flc-radioToggleInput-on",
            offInput: ".flc-radioToggleInput-off"
        },
        listeners: {
            "onCreate.addAttrs": {
                "this": "{that}.dom.inputs",
                method: "attr",
                args: ["{that}.options.attrs"]
            },
            "onCreate.addOnText": {
                "this": "{that}.dom.onLabel",
                method: "text",
                args: ["{that}.options.strings.on"]
            },
            "onCreate.addOffText": {
                "this": "{that}.dom.offLabel",
                method: "text",
                args: ["{that}.options.strings.off"]
            },
            "onCreate.bindChange": {
                "this": "{that}.dom.inputs",
                method: "on",
                "args": ["change", "{that}.toggleRadioModel"]
            }
        },
        invokers: {
            toggleRadioModel: {
                funcName: "gpii.app.settings.widgets.toggleRadioModel",
                args: ["{that}"]
            }
        }
    });
})();
