/**
 * Error dialog component
 *
 * An Electron BrowserWindow dialog that presents errors to the user.
 * Copyright 2018 Raising the Floor - US
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The R&D that led to this software was funded by the Rehabilitation Services Administration,
 * US Dept of Education under grant H421A150006 (APCP), by the National Institute on Disability,
 * Independent Living, and Rehabilitation Research (NIDILRR), US Administration for
 * Independent Living & US Dept of Education under Grants H133E080022 (RERC-IT) and H133E130028/90RE5003-01-00
 * (UIITA-RERC), by the European Union's Seventh Framework Programme (FP7/2007-2013) grant agreement n° 289016 (Cloud4all)
 * and 610510 (Prosperity4All), by the Flora Hewlett Foundation, the Ontario Ministry of Research and Innovation,
 * and the Canadian Foundation for Innovation, by Adobe Foundation and the Consumer Electronics Association Foundation.
 * The opinions and results herein are those of the authors and not necessarily those of the funding agencies.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid   = require("infusion");

require("./basic/dialogWrapper.js");
require("../common/utils.js");


/**
 * A component that represent an error dialog and is used to display error messages
 * to the user. In order for an error to be properly displayed it requires the
 * following attributes: title, subheader, details and error code.
 * These attributes are expected in the `params` section as they will be
 * directly passed to the renderer scope with dialog creation.
 */
fluid.defaults("gpii.app.errorDialog", {
    gradeNames: ["gpii.app.dialog"],

    config: {
        destroyOnClose: true,
        awaitWindowReadiness: true,

        attrs: {
            width: 400,
            height: 250
        },

        params: {
            title:   null,
            subhead: null,
            details: null,
            errCode: null,

            btnLabel1: null,
            btnLabel2: null,
            btnLabel3: null
        },
        fileSuffixPath: "errorDialog/index.html"
    },

    listeners: {
        "onDialogReady.show": {
            funcName: "{that}.show"
        }
    },

    components: {
        channelNotifier: {
            // simply notify i18n locale changes
            type: "gpii.app.channelNotifier"
        },
        channelListener: {
            type: "gpii.app.channelListener",
            options: {
                events: {
                    onErrorDialogContentHeightChanged: "{errorDialog}.events.onContentHeightChanged",
                    onErrorDialogButtonClicked: null,
                    onErrorDialogClosed: null
                },
                listeners: {
                    onErrorDialogButtonClicked: {
                        // Currently only single buttons are available, and
                        // will simply close the dialog
                        funcName: "{errorDialog}.hide"
                    },
                    onErrorDialogClosed: {
                        funcName: "{errorDialog}.hide"
                    }
                }
            }
        }
    }
});


/*
 * A wrapper for the creation of error dialogs. See the documentation of the
 * `gpii.app.dialogWrapper` grade for more information.
 */
fluid.defaults("gpii.app.error", {
    gradeNames: "gpii.app.dialogWrapper",

    components: {
        dialog: {
            type: "gpii.app.errorDialog",
            options: {
                config: {
                    params: "{arguments}.0"
                },
                model: {
                    scaleFactor: "{gpii.app.error}.model.scaleFactor"
                }
            }
        }
    }
});
