/*
Copyright 2013-2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid */

"use strict";
(function (fluid) {
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.pcp");

    fluid.defaults("gpii.pcp", {
        gradeNames: ["fluid.component"],
        components: {
            clientChannel: {
                type: "gpii.pcp.clientChannel",
                options: {
                    listeners: {
                        onPreferencesUpdated: {
                            funcName: "{mainWindow}.updatePreferences"
                        },
                        onAccentColorChanged: {
                            funcName: "{mainWindow}.updateTheme"
                        },
                        onSettingUpdated: {
                            funcName: "{mainWindow}.updateSetting"
                        }
                    }
                }
            },

            mainWindow: {
                type: "gpii.pcp.mainWindow",
                container: "#flc-body",
                options: {
                    listeners: {
                        onCloseClicked: "{clientChannel}.close",
                        onKeyOutClicked: "{clientChannel}.keyOut",
                        onSettingAltered: "{clientChannel}.alterSetting",
                        onActivePreferenceSetAltered: "{clientChannel}.alterActivePreferenceSet",
                        onContentHeightChanged: "{clientChannel}.changeContentHeight"
                    }
                }
            }
        }
    });

    $(function () {
        gpii.pcp();
    });
})(fluid);
