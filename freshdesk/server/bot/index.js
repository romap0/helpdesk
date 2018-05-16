const Telegraf = require('telegraf')
const { Extra } = require('telegraf')
const Actions = require('./actions')
// const Ticket = require('../models/ticket')
// const States = require('./states')
const formatTicket = require('./format')
const { TicketStatus } = require('../enums')

exports = class Bot {
  constructor (token, freshdesk) {
    if (!token) {
      throw Error('Token required')
    }

    this.bot = new Telegraf(token)
    this.freshdesk = freshdesk

    // this.bot.use(session())

    // Authorize middleware
    this.bot.use((ctx, next) => {
      freshdesk.listAllContactsAsync({ mobile: 'tg:' + ctx.from.id })
        .then(contacts => {
          ctx.state.user = contacts[0]
          next()
        })
        .catch(err => {
          console.error(err)
          next()
        })
    })

    // Register middleware
    this.bot.use((ctx, next) => {
      if (ctx.message && ctx.message.contact) {
        next()
        return
      }

      if (!ctx.state.user) {
        return ctx.reply(
          'Отправьте мне свои контактные данные, пожалуйста',
          Extra.markup(markup => {
            return markup
              .resize()
              .oneTime()
              .keyboard([markup.contactRequestButton('Отправить свой контакт')])
          })
        )
      } else {
        next()
      }
    })

    // When user sends his contact
    // this.bot.on('contact', ctx => {
    //   let contact = ctx.message.contact
    //   if (contact.user_id !== ctx.from.id) {
    //     ctx.reply('Вы отправили чужие данные!')
    //     return
    //   }

    //   let phone = contact.phone_number.replace(/[^0-9]/, '')

    //   try {
    //     if (ctx.state.user) {
    //       await freshdesk.updateContactAsync(ctx.state.user.id, { phone: phone })
    //     } else {
    //       await freshdesk.createContactAsync({ name: `${contact.first_name} ${contact.last_name}`, phone: phone, mobile: `tg:${contact.user_id}` })
    //     }

    //     ctx.reply(
    //       'Спасибо. Теперь вы можете создать новый тикет',
    //       Markup.keyboard([[Actions.NewTicket, Actions.MyTickets]])
    //         .resize()
    //         .extra()
    //     )
    //   } catch (ex) {
    //     console.error(ex)
    //     ctx.reply('⚠️ Не удалось авторизоваться. Попробуйте ещё раз.')
    //   }
    // })

    this.bot.hears(Actions.MyTickets, ctx => {
      freshdesk.listAllTicketsAsync({ requester_id: ctx.state.user.id })
        .then(tickets => {
          tickets.forEach(ticket => {
            ctx.replyWithMarkdown(formatTicket(ticket), Extra.markup(m =>
              m.inlineKeyboard([
                m.callbackButton('Сообщение', '_message_' + ticket.id),
                m.callbackButton('Решено', '_resolved_' + ticket.id, ticket.status === TicketStatus.Resolved)
              ])
            ))
          })

          if (!tickets.length) {
            ctx.reply('Открытых заявок нет')
          }
        })
        .catch(err => {
          console.error(err)
          ctx.reply('⚠️ Не удалось получить список заявок.')
        })
    })

    // this.bot.hears(Actions.NewTicket, async ctx => {
    //   ctx.session.state = States.WaitForTitle
    //   ctx.reply('Введите краткое описание')
    // })

    this.bot.hears(/.*/, ctx => {
      console.log(3)
      if (ctx.session.state === States.WaitForTitle) {
        let ticket = new Ticket(ctx.state.user.id, ctx.message.text)
        freshdesk.createTicketAsync(ticket)
          .then(({ id }) => {
            ctx.session.state = States.WaitForMessage

            ctx.replyWithMarkdown(formatTicket(ticket), Extra.markup(m =>
              m.inlineKeyboard([
                m.callbackButton('Сообщение', '_message_' + ticket.id),
                m.callbackButton('Решено', '_resolved_' + ticket.id)
              ])
            ))
            ctx.reply('Тикет создан. Введите подробности')
          })
          .catch(err => {
            console.error(err)
            ctx.reply('⚠️ Не удалось создать заявку.')
          })
        // return
      }

      // if (ctx.session.state === States.WaitForMessage && ctx.session.selectedTicket) {
      //   new TicketsDb().addMessage(ctx.session.selectedTicket,
      //     new Message(ctx.state.user._id, ctx.message.text))
      //   ctx.reply('Сообщение добавлено')
      // }
    })

    // this.bot.action(/_message_(.*)/, async ctx => {
    //   let id = ctx.match[1]
    //   ctx.session.state = States.WaitForMessage
    //   ctx.session.selectedTicket = id
    //   ctx.reply('Введите сообщение')
    //   ctx.answerCbQuery()
    // })

    this.bot.action(/_resolved_(.*)/, ctx => {
      // let id = ctx.match[1]
      // let ticket = (await new TicketsDb().setStatus(id, TicketStatus.Resolved)).value
      // console.log(ticket)

      // ctx.editMessageText(formatTicket(ticket), Extra.markup(m =>
      //   m.inlineKeyboard([
      //     m.callbackButton('Сообщение', '_message_' + id)
      //   ])
      // ).markdown())
      // ctx.answerCbQuery()
    })
  }

  sendMessage (userId, text) {
    return new Promise((resolve, reject) => {
      this.bot.telegram.sendMessage(userId, text, Telegraf.Extra.markdown())
        .then(() => resolve())
        .catch(err => reject(err))
    })
  }

  setWebhook (url) {
    return new Promise((resolve, reject) => {
      this.bot.telegram.setWebhook(url)
        .then(() => resolve())
        .catch(err => reject(err))
    })
  }

  deleteWebhook (url) {
    return new Promise((resolve, reject) => {
      this.bot.telegram.deleteWebhook()
        .then(() => resolve())
        .catch(err => reject(err))
    })
  }

  handleWebhook () {
    return new Promise((resolve, reject) => {
      return this.bot.webhookCallback('/')
        .then(() => resolve())
        .catch(err => reject(err))
    })
  }
}
