'use strict'

/* global generateTargetUrl, renderData, $db */

const moment = require('moment')
moment.locale('ru')

var Bot = require('./bot/index')

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
    generateTargetUrl()
      .done(targetUrl => {
        console.log(targetUrl)
        new Bot(args.iparams.telegram_token).setWebhook(targetUrl)
          .then(() => renderData())
          .catch(err => renderData({ message: err.message }))
      })
      .fail(function () {
        renderData({ message: 'Error while setting webhook' })
      })
  },

  /**
   * Deregister the webhook from Telegram
   */
  onAppUninstall: function (args) {
    new Bot(args.iparams.telegram_token).deleteWebhook()
      .then(() => renderData())
      .catch(err => renderData({ message: err.message }))
  },

  /**
   * Check if the received issue is of type 'Bug'
   * Create a ticket in freshdesk with bug creators email and summary
   */
  onExternalEvent: function (args) {
    let freshdesk = require('./freshdesk')(args.iparams.freshdesk_domain, args.iparams.freshdesk_key)
    new Bot(args.iparams.telegram_token, freshdesk, $db).bot.handleUpdate(JSON.parse(args.data))
  },

  sendMessage: args => {
    new Bot(args.iparams.telegram_token)
      .sendMessage(args.userId, `*Ответ на обращение*\n_${args.message}_`)
      .then(() => renderData())
      .catch(err => renderData({ message: err.message }))
  }
}
