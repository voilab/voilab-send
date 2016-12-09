/*jslint node: true */
'use strict';

/**
 * Sparkpost V1 adapter. Configuration are:
 *
 * - {String} [apikey] the sparkpost api key
 *
 * You will need to install some dependencies to make this adapter work
 * - sparkpost: 1.*
 * - q: 1.*
 *
 * @param {Object} [config]
 * @return {Adapter}
 */
var adapter = function (config) {
    var lodash = require('lodash'),
        SparkPost = require('sparkpost'),
        spark = new SparkPost(config.apikey),

        Adapter = function () {
            lodash.assign(this, {
                /**
                 * main message object
                 * @var {Object}
                 */
                message: {
                    recipients: [],
                    content: {}
                }
            });

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
            if (name) {
                this.message.recipients.push({
                    address: {
                        email: email,
                        name: name
                    }
                });
            } else {
                this.message.recipients.push({
                    address: email
                });
            }
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
            if (name) {
                this.message.content.from = {
                    email: email,
                    name: name
                };
            } else {
                this.message.content.from = email;
            }
            return this;
        },

        /**
         * Set subject
         *
         * @param {String} sub[ject
         * @return {Adapter}
         */
        setSubject: function (subject) {
            this.message.content.subject = subject || '';
            return this;
        },

        /**
         * Set HTML content
         *
         * @param {String} [html]
         * @return {Adapter}
         */
        setHtml: function (html) {
            this.message.content.html = html || '';
            return this;
        },

        /**
         * Set text content
         *
         * @param {String} [text]
         * @return {Adapter}
         */
        setText: function (text) {
            this.message.content.text = text || '';
            return this;
        },

        /**
         * Add an attachment to the mail
         *
         * @param {String} content Base64 string representation of content
         * @param {String} name file name
         * @param {String} type file type
         * @param {String} disposition attachment disposition
         * @return {mixed}
         */
        addAttachment: function (content, name, type, disposition) {
            return;
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
            this.message.substitution_data = data || {};
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
            if (!this.message.substitution_data) {
                this.message.substitution_data = {};
            }
            this.message.substitution_data[key] = value;
            return this;
        },

        /**
         * Set template id
         *
         * @param {String} [templateId]
         * @return {Adapter}
         */
        setTemplate: function (templateId) {
            this.message.content.template_id = templateId;
            return this;
        },

        /**
         * Remove all To, Cc et Bcc
         *
         * @return {Adapter}
         */
        resetRecipients: function () {
            this.message.recipients = [];
            return this;
        },

        /**
         * Send the email. Do not use it directely. Use the VoilabSend wrapper
         * instead.
         *
         * @return {Promise}
         */
        send: function () {
            var defer = require('q').defer();

            spark.transmissions.send({
                transmissionBody: this.message
            }, function (err, res) {
                if (err) {
                    return defer.reject(err);
                }
                defer.resolve(res);
            });
            return defer.promise;
        }
    });

    return Adapter;
};

module.exports = adapter;
