/*jslint node: true */
'use strict';

var lodash = require('lodash'),

    /**
     * Create a new mail sender. The configuration object has these properties:
     *
     * - {String} [adapter] the adapter file name (like `sendgrid-v4`)
     * - {Object} [adapterConfig] adapter configuration
     * - {Boolean] [debug] true to set debug mode
     * - {String} [debugEmail] the email used in debug mode
     *
     * @param {Object} [config]
     */
    VoilabSend = function (config) {
        lodash.assign(this, {
            /**
             * The mail adapter
             * @var {Adapter}
             */
            adapter: null,

            /**
             * The configuration object
             * @var {Object}
             */
            config: lodash.assign({}, config || {}),
        });

        if (this.config.adapter) {
            var Adapter = require('./adapters/' + this.config.adapter)(this.config.adapterConfig);
            this.setAdapter(new Adapter());
        }
    };

lodash.assign(VoilabSend.prototype, {

    /**
     * Set an adapter, used to mainpulate and send email
     *
     * @param {Adapter} [adapter]
     * @return {VoilabSend}
     */
    setAdapter: function (adapter) {
        this.adapter = adapter;
        return this;
    },

    /**
     * Returns the configured adapter
     *
     * @return {Adapter}
     */
    getAdapter: function () {
        return this.adapter;
    },

    /**
     * Return configuration object
     *
     * @return {Object}
     */
    getConfig: function () {
        return this.config;
    },

    /**
     * Check if in debug mode. Debug mode simply remove all recipients (to, cc
     * and bcc) and replace them with one custom email for tests
     *
     * @return {Boolean}
     */
    isDebug: function () {
        return this.config.debug;
    },

    /**
     * Send a mail
     *
     * @return {Promise}
     */
    send: function () {
        if (this.isDebug()) {
            this.adapter.resetRecipients();
            if (!this.config.debugEmail) {
                // no custom email is configurated. Throw an exception
                throw new Error("Debug mode! You need to provide a custom email");
            }
            this.adapter.addTo(this.config.debugEmail);
        }
        return this.adapter.send();
    },

    /**
     * Send a mail based on a provider template
     *
     * @param {String} [templateId] provider's template id
     * @return {Promise}
     */
    sendTemplate: function (templateId) {
        this.adapter.setTemplate(templateId);
        return this.send();
    }
});

module.exports = VoilabSend;
