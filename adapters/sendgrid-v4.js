/*jslint node: true */
'use strict';

/**
 * Sendgrid V4 adapter. Configuration are:
 *
 * - {String} [apikey] the sendgrid api key
 * - {String} [globalDataSurround] the string that surround global data key
 *
 * You will need to install some dependencies to make this adapter work
 * - sendgrid: 4.*
 *
 * @param {Object} [config]
 * @return {Adapter}
 */
var adapter = function (config) {
    var lodash = require('lodash'),
        sendgrid = require('sendgrid')(config.apikey),
        helpers = require('sendgrid').mail,

        Adapter = function () {
            lodash.assign(this, {
                /**
                 * The string that surround global data key
                 * @var {String}
                 */
                globalDataSurround: config.globalDataSurround || '%',

                /**
                 * Sendgrid helper Mail
                 * @var {Mail}
                 */
                message: new helpers.Mail(),

                /**
                 * Personalization helper (contains to, cc, bcc)
                 * @var {Personalization}
                 */
                personalization: new helpers.Personalization()
            });

            this.message.addPersonalization(this.personalization);
        };

    lodash.assign(Adapter.prototype, {

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
         * Add a recipient Cc
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        addCc: function (email, name) {
            var recipient = new helpers.Email(email, name);
            this.personalization.addCc(recipient);
            return this;
        },

        /**
         * Add a recipient Bcc
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        addBcc: function (email, name) {
            var recipient = new helpers.Email(email, name);
            this.personalization.addBcc(recipient);
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
         * Add an attachment to the mail
         *
         * @param {String} content Base64 string representation of content
         * @param {String} name file name
         * @param {String} type file type
         * @param {String} disposition attachment disposition
         * @return {helpers.Attachment}
         */
        addAttachment: function (content, name, type, disposition) {
            var attachment = new helpers.Attachment();
            attachment.setContent(content);
            attachment.setType(type);
            attachment.setFilename(name);
            attachment.setDisposition(disposition || 'attachment');

            this.message.addAttachment(attachment);

            return attachment;
        },

        /**
         * Add a buffer as attachment to the mail
         *
         * @param {Buffer} buffer content
         * @param {String} name file name
         * @param {String} type file type
         * @param {String} disposition attachment disposition
         * @return {helpers.Attachment}
         */
        addBufferAttachment: function (buffer, name, type, disposition) {
            return this.addAttachment(buffer.toString('base64'), name, type, disposition);
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
            var s = this.globalDataSurround,
                substitution = new helpers.Substitution(s + key + s, value);

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
            var request = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: this.message
            });

            return sendgrid.API(request)
                .catch(function (err) {
                    console.log(err);
                    console.dir(request, {depth: 5});
                    throw err;
                });
        }
    });

    return Adapter;
};

module.exports = adapter;
