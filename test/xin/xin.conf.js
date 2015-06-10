/**
 * Created by XinLuo on 6/9/2015.
 */
exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'xin_e2e.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:8000/app/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
