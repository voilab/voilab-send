/*jslint node: true */
'use strict';

/**
 * Sendgrid V4 adapter. Configuration are:
 *
 * - {String} [apikey] the sendgrid api key
 *
 * You will need to install some dependencies to make this adapter work
 * - q: 1.*
 * - sendgrid: 4.*
 *
 * @param {Object} [config]
 * @return {Adapter}
 */
var adapter = function (config) {
    var lodash = require('lodash'),
        q = require('q'),
        sendgrid = require('sendgrid')(config.apikey),
        helpers = require('sendgrid').mail,

        Adapter = function () {
            this.message = new helpers.Mail();
            this.personalization = new helpers.Personalization();
            this.message.addPersonalization(this.personalization);
        };

    lodash.assign(Adapter.prototype, {

        /**
         * Sendgrid helper Mail
         * @var Mail
         */
        message: null,

        /**
         * Personalization helper (contains to, cc, bcc)
         * @var Personalization
         */
        personalization: null,

        /**
         * Add a recipient
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        addTo: function (email, name) {
            var recipient = new helpers.Email(email, name);
            this.personalization.addTo(recipient);
            return this;
        },

        /**
         * Set from
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        setFrom: function (email, name) {
            var recipient = new helpers.Email(email, name);
            this.message.setFrom(recipient);
            return this;
        },

        /**
         * Set subject
         *
         * @param {String} sub[ject
         * @return {Adapter}
         */
        setSubject: function (subject) {
            this.message.setSubject(subject);
            return this;
        },

        /**
         * Set HTML content
         *
         * @param {String} [html]
         * @return {Adapter}
         */
        setHtml: function (html) {
            var content = new helpers.Content('text/html', html);
            this.message.addContent(content);
            return this;
        },

        /**
         * Set text content
         *
         * @param {String} [text]
         * @return {Adapter}
         */
        setText: function (text) {
            var content = new helpers.Content('text/plain', text);
            this.message.addContent(content);
            return this;
        },

        /**
         * Set all substitions variables in one shot
         *
         * @see addGlobalData
         * @param {Object} [data] key-value pairs
         * @return {Adapter}
         */
        setGlobalData: function (data) {
            var self = this;
            this.personalization.substitutions = {};
            lodash.forOwn(data, function (value, key) {
                self.addGlobalData(key, value);
            });
            return this;
        },

        /**
         * Add substitution variable. It will be wrapped in `-` (a key `name` will
         * become `-name-` and will be used like that in the tpl)
         *
         * @param {String} [key]
         * @param {String} [value]
         * @return {Adapter}
         */
        addGlobalData: function (key, value) {
            var substitution = new helpers.Substitution('-' + key + '-', value);
            this.personalization.addSubstitution(substitution);
            return this;
        },

        /**
         * Set template id
         *
         * @param {String} [templateId]
         * @return {Adapter}
         */
        setTemplate: function (templateId) {
            this.message.setTemplateId(templateId);
            return this;
        },

        /**
         * Remove all To, Cc et Bcc
         *
         * @return {Adapter}
         */
        resetRecipients: function () {
            this.personalization.tos = undefined;
            this.personalization.ccs = undefined;
            this.personalization.bccs = undefined;
            return this;
        },

        /**
         * Send the email. Do not use it directely. Use the VoilabSend wrapper
         * instead.
         *
         * @return {Promise}
         */
        send: function () {
            var deferred = q.defer(),
                request = sendgrid.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: this.message
                });

            sendgrid.API(request, function (err, response) {
                if (err) {
                    console.dir(request, {depth: 5});
                    console.log(response);
                    return deferred.reject(err);
                }
                deferred.resolve(response);
            });
            return deferred.promise;
        }
    });

    return Adapter;
};

module.exports = adapter;
