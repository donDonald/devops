'use strict';

const assert = require('assert');
const fs = require('fs');
const lineByLine = require('n-readlines');
const os = require("os");

module.exports = function (options) {
    assert(options.prefix)

    // Collect files hierarchy for writing metrics
    let hostName = 'somehost';
    try {
        const liner = new lineByLine('/etc/host_hostname');
        const line = liner.next();
        if (line) {
            hostName = line;
        }
        liner.close();
    } catch (err) {
        console.log(`err:${err}`);
    }
    const workerName = os.hostname();
    const dirName = `/var/${options.prefix}/http_requests/${hostName}`;
    const fileName = `/var/${options.prefix}/http_requests/${hostName}/${workerName}`;

    console.log(`hostName:${hostName}`);
    console.log(`workerName:${workerName}`);
    console.log(`dirName:${dirName}`);
    console.log(`fileName:${fileName}`);
    fs.mkdirSync(dirName, { recursive: true });

    // Try to read initial values if any
    let http_requests;
    try {
        http_requests = fs.readFileSync(fileName);
    } catch (err) {
        http_requests = 0;
    }

    let timer;
    const start = function() {
        if (!timer) {
            timer = setTimeout(write, 1000);
        }
    }

    const write = function() {
        fs.writeFile(fileName, `${http_requests}`, (err)=>{
            assert(!err, err);
            timer = undefined;
        });
    }

    // Write initial values
    write();

    return function (req, res, next) {
        ++http_requests;
        start();
        next();
    }
}

