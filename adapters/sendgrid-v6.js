/*jslint node: true */
'use strict';

/**
 * Sendgrid V4 adapter. Configuration are:
 *
 * - {String} [apikey] the sendgrid api key
 * - {String} [globalDataSurround] the string that surround global data key
 *
 * You will need to install some dependencies to make this adapter work
 * - sendgrid: ^6.0.0
 *
 * @param {Object} [config]
 * @return {Adapter}
 */
var adapter = function (config) {
    var lodash = require('lodash'),
        sendgrid = require('@sendgrid/mail'),
        helpers = require('@sendgrid/helpers').classes,

        emailExists = function (personalization, email) {
            var emails = (personalization.to || [])
                .concat(personalization.cc || [])
                .concat(personalization.bcc || []);

            return lodash.map(emails, 'email').indexOf(email) !== -1;
        },

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

            this.personalization.setSubstitutionWrappers([this.globalDataSurround, this.globalDataSurround]);
            this.message.addPersonalization(this.personalization);
        };

    sendgrid.setApiKey(config.apikey);

    lodash.assign(Adapter.prototype, {

        /**
         * Add a recipient
         *
         * @param {String} email can be comma-separated emails
         * @param {String} [name]
         * @return {Adapter}
         */
        addTo: function (email, name) {
            email.split(',').forEach((e) => {
                e = lodash.trim(e);
                if (e && !emailExists(this.personalization, e)) {
                    var recipient = new helpers.EmailAddress(e, name);
                    this.personalization.addTo(recipient);
                }
            });
            return this;
        },

        /**
         * Add a recipient Cc
         *
         * @param {String} email can be comma-separated emails
         * @param {String} [name]
         * @return {Adapter}
         */
        addCc: function (email, name) {
            email.split(',').forEach((e) => {
                e = lodash.trim(e);
                if (e && !emailExists(this.personalization, e)) {
                    var recipient = new helpers.EmailAddress(e, name);
                    this.personalization.addCc(recipient);
                }
            });
            return this;
        },

        /**
         * Add a recipient Bcc
         *
         * @param {String} email can be comma-separated emails
         * @param {String} [name]
         * @return {Adapter}
         */
        addBcc: function (email, name) {
            email.split(',').forEach((e) => {
                e = lodash.trim(e);
                if (e && !emailExists(this.personalization, e)) {
                    var recipient = new helpers.EmailAddress(e, name);
                    this.personalization.addBcc(recipient);
                }
            });
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
            var recipient = new helpers.EmailAddress(email, name);
            this.message.setFrom(recipient);
            return this;
        },

        /**
         * Set subject
         *
         * @param {String} subject
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
            this.message.addHtmlContent(html);
            return this;
        },

        /**
         * Set text content
         *
         * @param {String} [text]
         * @return {Adapter}
         */
        setText: function (text) {
            this.message.addTextContent(text);
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
            this.personalization.addSubstitution(key, value);
            return this;
        },

        setCustom: function (key, value) {
            this.message[key] = value;
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
            var subs = Object.assign({}, this.personalization.substitutions);
            this.personalization = new helpers.Personalization();
            this.personalization.substitutions = subs;
            this.personalization.setSubstitutionWrappers([this.globalDataSurround, this.globalDataSurround]);
            this.message.setPersonalizations([this.personalization]);
            return this;
        },

        /**
         * Send the email. Do not use it directely. Use the VoilabSend wrapper
         * instead.
         *
         * @return {Promise}
         */
        send: function () {
            if (this.message.dynamicTemplateData) {
                this.message.applyDynamicTemplateData(this.personalization);
            }
            return sendgrid.send(this.message)
                .catch(function (err) {
                    console.log(err);
                    console.dir(err && err.response && err.response.body, { depth: 10 });
                    throw err;
                });
        }
    });

    return Adapter;
};

module.exports = adapter;
