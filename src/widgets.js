"use strict";
(function () {
    var fluid = window.fluid;

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
})();
