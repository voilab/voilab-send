/*jslint node: true, unparam: true, nomen: true */
(function () {
    'use strict';

    /**
     * Sendgrid adapter
     */
    var adapter = function (config) {
        var lodash = require('lodash'),
            sendgrid = require('sendgrid')(config.apiKey);

        var service = {

            getEmailObject: function (emailConfig) {
                return new sendgrid.Email(lodash.merge(config.emailConfig, emailConfig));
            },

            getSendMethod: function () {
                return 'send';
            }
        };

        return service;
    };

    module.exports = adapter;
}());