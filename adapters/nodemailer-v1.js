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
const adapter = config => {
    const lodash = require('lodash');
    const nodemailer = require('nodemailer');

    const emailExists = (message, email) => {
        const emails = (message.to)
            .concat(message.cc)
            .concat(message.bcc);

        return emails
            .map(e => e.email.toLowerCase())
            .indexOf(email.toLowerCase()) !== -1;
    };

    const Adapter = function () {
        Object.assign(this, {
            /**
             * main message object
             * @var {Object}
             */
            message: {
                to: [],
                cc: [],
                bcc: [],
                attachments: [],
                data: {}
            }
        });
    };

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure, // true for 465, false for other ports
        auth: {
            user: config.user,
            pass: config.pass
        }
    });

    Object.assign(Adapter.prototype, {

        /**
         * Add a recipient
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        addTo(email, name) {
            name = lodash.trim(name) || '';
            email.split(',').forEach(e => {
                if (emailExists(this.message, e)) {
                    return;
                }
                this.message.to.push({
                    email: e,
                    name: name,
                    full: name ? `"${name}" <${e}>` : e
                });
            });
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
            name = lodash.trim(name) || '';
            email.split(',').forEach(e => {
                if (emailExists(this.message, e)) {
                    return;
                }
                this.message.cc.push({
                    email: e,
                    name: name,
                    full: name ? `"${name}" <${e}>` : e
                });
            });
            return this;
        },

        /**
         * Add a recipient Bcc
         *
         * @param {String} [email]
         * @param {String} [name]
         * @return {Adapter}
         */
        addBcc(email, name) {
            name = lodash.trim(name) || '';
            email.split(',').forEach(e => {
                if (emailExists(this.message, e)) {
                    return;
                }
                this.message.bcc.push({
                    email: e,
                    name: name,
                    full: name ? `"${name}" <${e}>` : e
                });
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
        setFrom(email, name) {
            name = lodash.trim(name) || '';
            this.message.from = {
                email: email,
                name: name,
                full: name ? `"${name}" <${email}>` : email
            };
            return this;
        },

        /**
         * Set subject
         *
         * @param {String} sub[ject
         * @return {Adapter}
         */
        setSubject(subject) {
            this.message.subject = subject || '';
            return this;
        },

        /**
         * Set HTML content
         *
         * @param {String} [html]
         * @return {Adapter}
         */
        setHtml(html) {
            this.message.html = html || '';
            return this;
        },

        /**
         * Set text content
         *
         * @param {String} [text]
         * @return {Adapter}
         */
        setText(text) {
            this.message.text = text || '';
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
            this.message.attachments.push({
                filename: name,
                contentType: type,
                content: content,
                encoding: 'base64'
            });
            return this;
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
            this.message.attachments.push({
                filename: name,
                contentType: type,
                content: buffer
            });
            return this;
        },

        /**
         * Set all substitions variables in one shot
         *
         * @see addGlobalData
         * @param {Object} [data] key-value pairs
         * @return {Adapter}
         */
        setGlobalData(data) {
            this.message.data = data || {};
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
            this.message.data[key] = value;
            return this;
        },

        /**
         * Set template id
         *
         * @param {String} [templateId]
         * @return {Adapter}
         */
        setTemplate(templateId) {
            return this;
        },

        setCustom(key, value) {
            this.message[key] = value;
            return this;
        },

        /**
         * Remove all To, Cc et Bcc
         *
         * @return {Adapter}
         */
        resetRecipients() {
            this.message.to = [];
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
            return transporter.sendMail({
                from: this.message.from.full,
                to: this.message.to.map(to => to.full),
                cc: this.message.cc.map(cc => cc.full),
                bcc: this.message.bcc.map(bcc => bcc.full),
                subject: lodash.template(this.message.subject)(this.message.data),
                text: lodash.template(this.message.text)(this.message.data),
                html: lodash.template(this.message.html)(this.message.data),
                attachments: this.message.attachments
            });
        }
    });

    return Adapter;
};

module.exports = adapter;
