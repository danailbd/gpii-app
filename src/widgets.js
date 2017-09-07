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
        gradeNames: "fluid.rendererComponent",
        template: "dropDown.html",
        model: {
            optionNames: [],
            optionList: [],
            selection: null
        },
        selectors: {
            // from the injested html
            options: ".flc-dropDown-options"
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
        template: "radioToggle.html",
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

    fluid.defaults("gpii.app.settings.widgets.textfield", {
        gradeNames: ["fluid.textfield"],
        template: "textfield.html"
    });

    fluid.defaults("gpii.app.settings.widgets.switch", {
        gradeNames: ["fluid.switchUI"],
        template: "switch.html"
    });

    fluid.defaults("gpii.app.settings.widgets.slider", {
        gradeNames: ["fluid.textfieldSlider"],
        template: "slider.html",
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
                            funcName: "gpii.app.settings.widgets.noop"
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("gpii.app.settings.widgets.stepper", {
        gradeNames: ["fluid.textfieldStepper"],
        template: "stepper.html"
    });

    fluid.defaults("gpii.app.settings.widgets.multipicker", {
        gradeNames: ["fluid.rendererComponent"],
        template: "multipicker.html",
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
