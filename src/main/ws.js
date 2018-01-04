/*!
GPII Application
Copyright 2016 Steven Githens
Copyright 2016-2017 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.
The research leading to these results has received funding from the European Union's
Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
*/
"use strict";

var fluid = require("infusion"),
    gpii = fluid.registerNamespace("gpii"),
    WebSocket = require("ws");

fluid.defaults("gpii.app.ws", {
    gradeNames: ["fluid.component"],

    config: {
        hostname: null,
        port: null,
        path: "" // optional
    },

    members: {
        ws: null // will be assigned when connect is called
    },

    events: {
        onConnected: null,
        onError: null,
        onMessageReceived: null
    },

    listeners: {
        onDestroy: "{that}.disconnect"
    },

    invokers: {
        connect: {
            funcName: "gpii.app.ws.connect",
            args: ["{that}", "{that}.options.config"]
        },
        send: {
            funcName: "gpii.app.ws.send",
            args: ["{that}.ws", "{arguments}.0"]
        },
        disconnect: {
            funcName: "gpii.app.ws.disconnect",
            args: ["{that}.ws"]
        }
    }
});

gpii.app.ws.connect = function (that, config) {
    var url = fluid.stringTemplate("ws://%hostname:%port%path", config);
    that.ws = new WebSocket(url);

    that.ws.on("open", function () {
        that.events.onConnected.fire();
    });

    that.ws.on("message", function (data) {
        that.events.onMessageReceived.fire(JSON.parse(data));
    });

    that.ws.on("error", function (error) {
        that.events.onError.fire(error);
    });

    that.ws.on("unexpected-response", function () {
        that.events.onError.fire("Unexpected HTTP response where WebSocket response was expected");
    });
};

gpii.app.ws.send = function (ws, data) {
    if (ws) {
        ws.send(JSON.stringify(data));
    }
};

gpii.app.ws.disconnect = function (ws) {
    if (ws) {
        // for ref https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
        ws.close(1000);
    }
};
