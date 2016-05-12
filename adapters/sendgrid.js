/*jslint node: true, unparam: true, nomen: true */
(function () {
    'use strict';

    /**
     * Sendgrid adapter
     */
    var adapter = function (config) {
        var lodash = require('lodash'),
            q = require('q'),
            sendgrid = require('sendgrid')(config.apiKey);

        var service = {

            getEmailObject: function (emailConfig) {
                var email = new sendgrid.Email(lodash.merge(config.emailConfig, emailConfig));
                if (emailConfig.substitutions) {
                    email.setSubstitutions(emailConfig.substitutions);
                }
                if (emailConfig.filters) {
                    email.setFilters(emailConfig.filters);
                }

                return email;
            },

            send: function (emailObject) {
                return q.npost(sendgrid, 'send', [emailObject]);
            }
        };

        return service;
    };

    module.exports = adapter;
}());