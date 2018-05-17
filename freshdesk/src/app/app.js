'use strict'
/* global $, app */

$(document).ready(() => {
  app.initialized()
    .then(client => {
      let mobile

      function notifyUser (status, message) {
        client.interface.trigger('showNotify', {
          type: status,
          message: message
        })
      }

      client.data.get('contact')
        .then(data => {
          mobile = data.contact.mobile

          if (!mobile || !mobile.includes('tg:')) {
            $('#spinner').fadeOut()
            $('#noaccount').fadeIn()
          } else {
            $('#spinner').fadeOut()
            $('#form').fadeIn()
          }
        })
        .catch(e => {
          console.log('Exception - ', e)
        })

      $('#send').click(() => sendMessage())
      $('#message').keyup((args) => {
        if (args.key === 'Enter' && args.ctrlKey) {
          sendMessage()
        }
      })

      function sendMessage () {
        let message = $('#message').val()

        if (!message) {
          notifyUser('warning', 'Please enter message text')
          return
        }

        let [ messenger, userId ] = mobile.split(':')

        client.request.invoke('sendMessage', {
          messenger: messenger,
          userId: userId,
          message: message
        })
          .then(response => {
            notifyUser('success', 'Message sent successfully.')
            $('#message').val('')
          })
          .catch(error => {
            notifyUser('danger', error.message || 'Unexpected error.')
          })
      }
    })
})
