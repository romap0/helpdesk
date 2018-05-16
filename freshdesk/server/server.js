'use strict'

// require('dotenv-expand')(require('dotenv').config())
// const moment = require('moment')
// moment.locale('ru')

const Bot = require('./bot/index')

exports = {

  events: [
    { event: 'onAppInstall', callback: 'onAppInstall' },
    { event: 'onAppUninstall', callback: 'onAppUninstall' },
    { event: 'onExternalEvent', callback: 'onExternalEvent' }
  ],

  /**
   * Webhook url is created through generateTargetUrl function
   * The generated url is registered in Telegram nd is triggered when new message received.
   */
  onAppInstall: function (args) {
    this.generateTargetUrl()
      .done(targetUrl => {
        new Bot(args.iparams.telegram_token).setWebhook(targetUrl)
          .then(() => this.renderData())
          .catch(err => this.renderData({ message: err.message }))
      })
      .fail(function () {
        this.renderData({ message: 'Error while setting webhook' })
      })
  },

  /**
   * Deregister the webhook from Telegram
   */
  onAppUninstall: function (args) {
    new Bot(args.iparams.telegram_token).deleteWebhook()
      .then(() => this.renderData())
      .catch(err => this.renderData({ message: err.message }))
  },

  /**
   * Check if the received issue is of type 'Bug'
   * Create a ticket in freshdesk with bug creators email and summary
   */
  onExternalEvent: function (args) {
    let freshdesk = require('./freshdesk')(args.iparams.freshdesk_domain, args.iparams.freshdesk_key)
    new Bot(args.iparams.telegram_token, freshdesk).bot.handleUpdate(JSON.parse(args.data))
  },

  sendMessage: args => {
    new Bot(args.iparams.telegram_token).sendMessage(args.userId, args.message)
      .then(() => this.renderData())
      .catch(err => this.renderData({ message: err.message }))
  }
}
