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
    };

    gpii.app.settings.hasPreferenceSets = function (preferenceSets) {
        // TODO use in preferenceSetsDropDown
        return preferenceSets && preferenceSets.names && preferenceSets.names.length > 0;
    };

    gpii.app.settings.keyOut = function () {
        ipcRenderer.send("keyOut");
    };

    fluid.defaults("gpii.app.settings.preferenceSetsDropDown", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            options: {names: [], icons: []},
            activeOption: null,
            icon: null
        },
        events: {
            onTemplateLoaded: null,
            onTemplateRendered: null
        },
        components: {
            loadResource: {
                type: "fluid.resourceLoader",
                options: {
                    resources: {
                        template: "./preferenceSetsDropDown.html"
                    },
                    listeners: {
                        "onResourcesLoaded.createNext": "{preferenceSetsDropDown}.events.onTemplateLoaded"
                    }
                }
            },
            renderTemplate: {
                type: "fluid.viewComponent",
                container: "{preferenceSetsDropDown}.container",
                createOnEvent: "onTemplateLoaded",
                options: {
                    listeners: {
                        "onCreate.append": {
                            "this": "{that}.container",
                            method: "append",
                            args: "{resourceLoader}.resources.template.resourceText"
                        },
                        "onCreate.createNext": "{preferenceSetsDropDown}.events.onTemplateRendered"
                    }
                }
            },
            dropDown: {
                type: "fluid.rendererComponent",
                container: "{preferenceSetsDropDown}.container",
                createOnEvent: "onTemplateRendered",
                options: {
                    model: {
                        options: "{preferenceSetsDropDown}.model.options",
                        activeOption: null,
                        icon: null
                    },
                    selectors: {
                        icon: ".flc-icon",
                        options: ".flc-options"
                    },
                    protoTree: {
                        options: {
                            selection: "${activeOption}",
                            optionlist: "${options.names}",
                            optionnames: "${options.names}"
                        },
                        icon: {
                            decorators: [{
                                type: "attrs",
                                attributes: {src: "{that}.model.icon"}
                            }]
                        }
                    },
                    modelListeners: {
                        "icon": {
                            func: "{that}.refreshView"
                        },
                        "options": {
                            func: "{that}.refreshView"
                        }
                    },
                    modelRelay: {
                        target: "icon",
                        singleTransform: {
                            type: "fluid.transforms.free",
                            // TODO
                            func: "gpii.app.settings.getIcon",
                            args: ["{that}.model.options", "{that}.model.activeOption"]
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
                type: "gpii.app.settings.preferenceSetsDropDown",
                container: "{header}.dom.preferenceSet",
                options: {
                    model: {
                        options: "{header}.model.preferenceSets"
                    }
                }
            }
        },
        protoTree: {
            closeBtn: {
                decorators: [{
                    type: "$",
                    func: "on",
                    args: ["click", function () {
                        ipcRenderer.send("closeSettingsWindow");
                    }]
                }]
            }
        },
        renderOnInit: true
    });

    fluid.defaults("gpii.app.settings.settingsList", {
        gradeNames: "fluid.viewComponent",
        model: {
            preferenceSets: "{mainWindow}.model.preferenceSets"
        },
        components: {
            preferenceSets: {
                type: "gpii.app.settings.preferenceSetsDropDown",
                container: "{settingsList}.container",
                options: {
                    model: {
                        options: "{settingsList}.model.preferenceSets"
                    }
                }
            }
        }
    });

    fluid.defaults("gpii.app.settings.mainWindow", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            preferenceSets: null
        },
        selectors: {
            keyOutBtn: ".flc-keyOutBtn"
        },
        components: {
            header: {
                type: "gpii.app.settings.header",
                container: "#flc-settingsHeader"
            },
            settingsList: {
                type: "gpii.app.settings.settingsList",
                container: "#flc-settingsList"
            }
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
            "keyOut": {
                funcName: "gpii.app.settings.keyOut"
            }
        }
    });

    $(function () {
        var main = gpii.app.settings.mainWindow("#flc-body");
        // XXX Debuging
        console.log(main.header);
    });
})();
