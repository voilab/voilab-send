/*jslint node: true, unparam: true, nomen: true */
(function () {
    'use strict';

    /**
     * Public service
     *
     * @param {Object} [mailerConfig] A configuration object looking like this one:
     *                  {
         *                      typefield: "type",                 // fieldname in database documents that holds the document type
         *                      versionfield: "version",           // fieldname in database documents that holds the version number
         *                      filenameSeparator: "::",           // usually in a noSQL database, you name your documents using some separator
         *                      migrations_path: "../migrations/", // path to migrations files from that library
         *                      parallelLimit: 8,                  // number of parallel upgrades in batch mode
         *                      versions: {                        // optional: define here the up-to-date version number for each
         *                          article: 1,                    //           document type. You can also omit this config and
         *                          comment: 3                     //           manage your version numbers directly in the database
         *                      }                                  //           in files named like [typefield][filenameSeparator][versionfield] and
         *                  }                                      //           containing this kind of object: {"current": 3}
     *
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