"use strict";

var processArgs = process.argv.slice(2);
var fluid = require("infusion");
var fs = require("fs");
var path = require("path");
var os = require("os");

// support json5 files
require("json5/lib/register");

var gpii = fluid.registerNamespace("gpii");
require("../messageBundlesCompiler.js");


if (!processArgs.length) {
    fluid.fail("No file provided.");
    return;
}

var columns = ["Key", "Message"];
var csvDelimitor = ",";
var subKeyDelimiter = "|";
var bundlesPath = processArgs[0];
var baseBundle = "en";


function generateCsvBundle(bundlePath) {
    // load the json file
    var bundle = require(bundlePath);
    var bundleName = path.basename(bundlePath).split(".")[0];

    // csv key format - <top-key>|<sub-key>|<sub-key>|...
    // [ [key, value], ... ]
    function getCsvEntries(topKey, obj, csvEntries) {
        fluid.each(obj, function (value, key) {
            key = topKey ? subKeyDelimiter + key : key;
            var subKey = topKey + key;

            if (!value) {
                // skip element as it is empty
                return;
            } else if (fluid.isPrimitive(value)) {
                value = "\"" + value + "\""; // ensure new lines are handled
                csvEntries.push([ subKey, value ]);
            } else {
                getCsvEntries(subKey, value, csvEntries);
            }
        });

        return csvEntries;
    }

    var csvEntries = getCsvEntries("", bundle, []);

    // add column headers
    csvEntries.unshift(columns);

    var csvBundle = csvEntries.reduce(function (acc, csvEntry) {
        acc += csvEntry.join(csvDelimitor);
        acc += os.EOL;

        return acc;
    }, "");

    // make it a stream
    fs.writeFileSync(bundleName + ".csv", csvBundle);
}

var bundles = gpii.app.messageBundlesCompiler.collectFilesByType(bundlesPath, ["json", "json5"]);
bundles = bundles.filter(function (bundlePath) {
    return bundlePath.indexOf("_" + baseBundle) > -1;
});

// Generate all csv files
fluid.each(bundles, generateCsvBundle);
