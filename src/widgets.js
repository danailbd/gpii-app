"use strict";
(function () {
    var fluid = window.fluid,
        gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.pcp.widgets");

    gpii.pcp.widgets.noop = function () {
        // A function that does nothing.
    };

    // TODO handle empty array (add expander)
    fluid.defaults("gpii.pcp.widgets.dropdown", {
        gradeNames: "fluid.rendererComponent",
        model: {
            optionNames: [],
            optionList: [],
            selection: null
        },
        selectors: {
            // from the injested html
            options: ".flc-dropdown-options"
        },
        protoTree: {
            options: {
                optionnames: "${optionNames}",
                optionlist: "${optionList}",
                selection: "${selection}"
            }
        },
        renderOnInit: true
    });

    fluid.defaults("gpii.pcp.widgets.button", {
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
                funcName: "gpii.pcp.noop"
            }
        }
    });

    gpii.pcp.widgets.onRadioToggleChanged = function (that, onInput, offInput) {
        var input = that.model.enabled ? onInput : offInput;
        input.attr("checked", true);
    };

    gpii.pcp.widgets.toggleRadioModel = function (that) {
        that.applier.change("enabled", !that.model.enabled);
    };

    fluid.defaults("gpii.pcp.widgets.radioToggle", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            enabled: false
        },
        attrs: {
            // it is mandatory to specify "name" here!
        },
        strings: {
            on: "On",
            off: "Off"
        },
        modelListeners: {
            enabled: {
                funcName: "gpii.pcp.widgets.onRadioToggleChanged",
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
                funcName: "gpii.pcp.widgets.toggleRadioModel",
                args: ["{that}"]
            }
        }
    });

    fluid.defaults("gpii.pcp.widgets.textfield", {
        gradeNames: ["fluid.textfield"]
    });

    fluid.defaults("gpii.pcp.widgets.switch", {
        gradeNames: ["fluid.switchUI"]
    });

    fluid.defaults("gpii.pcp.widgets.slider", {
        gradeNames: ["fluid.textfieldSlider"],
        components: {
            slider: {
                options: {
                    listeners: {
                        // XXX: This is needed in order not to update the model too frequently.
                        // However, the value of the textfield is not updated until the slider
                        // is released which may not be desired. Need to create a wrapper which
                        // will update the textfield as the slider is moved and to propagate
                        // model changes only when the slider is released.
                        "onCreate.bindSlideEvt": {
                            funcName: "gpii.pcp.widgets.noop"
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("gpii.pcp.widgets.stepper", {
        gradeNames: ["fluid.textfieldStepper"]
    });

    fluid.defaults("gpii.pcp.widgets.multipicker", {
        gradeNames: ["fluid.rendererComponent"],
        model: {
            values: [],
            names: [],
            value: null
        },
        attrs: {
            // it is mandatory to specify "name" here!
        },
        selectors: {
            item: ".flc-multipickerItem",
            input: ".flc-multipickerInput",
            label: ".flc-multipickerLabel"
        },
        repeatingSelectors: ["item"],
        protoTree: {
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "item",
                inputID: "input",
                labelID: "label",
                selectID: "{that}.options.attrs.name",
                tree: {
                    optionnames: "${names}",
                    optionlist: "${values}",
                    selection: "${value}"
                }
            }
        },
        renderOnInit: true
    });
})();
