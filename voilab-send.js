/*jslint node: true, unparam: true, nomen: true */
(function () {
    'use strict';

    /**
     * Public service
     *
     * @param {Object} [mailerConfig] A configuration object looking like this one:
     *                  {
     *                      apiKey: "'18459483509283750293852", // Usually, transactional email services requires an API KEY
     *                      adapter: "sendgrid",                // Which service do you use ?
     *                      emailConfig: { ... }                // Some email configuration, according to the chosen adapter
     *                  }
     */
    var mailer = function (mailerConfig) {
        var lodash = require('lodash'),
            q = require('q'),

            /**
             * Some private stuffs
             */
            config = lodash.merge({
                adapter: 'sendgrid',
                emailConfig: {
                    to: 'you@yourdomain.org',
                    from: 'me@mydomain.org',
                    fromname: 'Me',
                    subject: 'Dummy Test Email',
                    html: "<p>Hi there, it's me !</p>"
                }
            }, (mailerConfig || {})),
            adapter = require('adapters/' + config.adapter)(config);

        var service = {

            send: function (emailConfig) {
                var email = adapter.getEmailObject(emailConfig);

                return q.npost(adapter, adapter.getSendMethod(), [email])
                    .catch(function (e) {
                        console.log('Email not sent to ' + user.getEmail());
                        throw e;
                    });
            }
        };

        return service;
    };

    module.exports = mailer;
}());