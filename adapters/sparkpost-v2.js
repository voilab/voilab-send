/*jslint node: true */
'use strict';

/**
 * Sparkpost V2 adapter. Configuration are:
 *
 * - {String} [apikey] the sparkpost api key
 *
 * You will need to install some dependencies to make this adapter work
 * - sparkpost: 2.*
 *
 * @param {Object} [config]
 * @return {Adapter}
 */
let adapter = function (config) {
    const lodash = require('lodash');
    const SparkPost = require('sparkpost');
    let spark = new SparkPost(config.apikey);

    let Adapter = function () {
        lodash.assign(this, {
            /**
             * main message object
             * @var {Object}
             */
            message: {
                recipients: [],
                cc: [],
                bcc: [],
                content: {},
                options: {}
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
        addTo(email, name) {
            if (name) {
                this.message.recipients.push({
                    address: {
                        email: email,
                        name: name
                    }
                });
            } else {
                var self = this;
                email.split(',').forEach((e) => {
                    e = lodash.trim(e);
                    if (e) {
                        this.message.recipients.push({
                            address: e
                        });
                    }
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
        addCc(email, name) {
            if (name) {
                this.message.cc.push({
                    address: {
                        email: email,
                        name: name
                    },
                    substitution_data: {
                        recipient_type: 'CC'
                    }
                });
            } else {
                var self = this;
                email.split(',').forEach((e) => {
                    e = lodash.trim(e);
                    if (e) {
                        this.message.cc.push({
                            address: e,
                            substitution_data: {
                                recipient_type: 'CC'
                            }
                        });
                    }
                });
            }
        },

        /**
         * Add a recipient Bcc
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        addBcc(email, name) {
            if (name) {
                this.message.bcc.push({
                    address: {
                        email: email,
                        name: name
                    },
                    substitution_data: {
                        recipient_type: 'BCC'
                    }
                });
            } else {
                var self = this;
                email.split(',').forEach((e) => {
                    e = lodash.trim(e);
                    if (e) {
                        this.message.bcc.push({
                            address: e,
                            substitution_data: {
                                recipient_type: 'BCC'
                            }
                        });
                    }
                });
            }
            return this;
        },

        /**
         * Set from
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        setFrom(email, name) {
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
        setSubject(subject) {
            this.message.content.subject = subject || '';
            return this;
        },

        /**
         * Set HTML content
         *
         * @param {String} [html]
         * @return {Adapter}
         */
        setHtml(html) {
            this.message.content.html = html || '';
            return this;
        },

        /**
         * Set text content
         *
         * @param {String} [text]
         * @return {Adapter}
         */
        setText(text) {
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
        addAttachment(content, name, type, disposition) {
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
        addBufferAttachment(buffer, name, type, disposition) {
            return this.addAttachment(buffer.toString('base64'), name, type, disposition);
        },

        /**
         * Set all substitions variables in one shot
         *
         * @see addGlobalData
         * @param {Object} [data] key-value pairs
         * @return {Adapter}
         */
        setGlobalData(data) {
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
        addGlobalData(key, value) {
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
        setTemplate(templateId) {
            this.message.content.template_id = templateId;
            return this;
        },

        /**
         * Remove all To, Cc et Bcc
         *
         * @return {Adapter}
         */
        resetRecipients() {
            this.message.recipients = [];
            this.message.cc = [];
            this.message.bcc = [];
            return this;
        },

        /**
         * Send the email. Do not use it directely. Use the VoilabSend wrapper
         * instead.
         *
         * @return {Promise}
         */
        send() {
            return spark.transmissions.send(this.message);
        }
    });

    return Adapter;
};

module.exports = adapter;
