
const debug = require('debug')('voilab-mailer');

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
const VoilabSend = function (config) {
    Object.assign(this, {
        /**
         * The mail adapter
         * @var {Adapter}
         */
        adapter: null,

        /**
         * The configuration object
         * @var {Object}
         */
        config: Object.assign({}, config || {}),
    });

    if (this.config.adapter) {
        const Adapter = require('./adapters/' + this.config.adapter)(this.config.adapterConfig);
        this.setAdapter(new Adapter());
    }
};

Object.assign(VoilabSend.prototype, {

    /**
     * Set an adapter, used to mainpulate and send email
     *
     * @param {Adapter} [adapter]
     * @return {VoilabSend}
     */
    setAdapter(adapter) {
        this.adapter = adapter;
        return this;
    },

    /**
     * Returns the configured adapter
     *
     * @return {Adapter}
     */
    getAdapter() {
        return this.adapter;
    },

    /**
     * Return configuration object
     *
     * @return {Object}
     */
    getConfig() {
        return this.config;
    },

    /**
     * Check if in debug mode. Debug mode simply remove all recipients (to, cc
     * and bcc) and replace them with one custom email for tests
     *
     * @return {Boolean}
     */
    isDebug() {
        return this.config.debug;
    },

    /**
     * Send a mail
     *
     * @return {Promise}
     */
    send() {
        if (this.isDebug()) {
            this.adapter.resetRecipients();
            if (!this.config.debugEmail) {
                const str = 'Debug mode! You need to provide a custom email';
                debug(str);
                // no custom email is configurated. Throw an exception
                throw new Error(str);
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
    sendTemplate(templateId) {
        this.adapter.setTemplate(templateId);
        return this.send();
    }
});

module.exports = VoilabSend;
