const Telegraf = require('telegraf')
const { Extra, Markup } = require('telegraf')
const Actions = require('./actions')
const Ticket = require('../models/ticket')
const Note = require('../models/note')
const States = require('./states')
const { formatTicket } = require('./format')
const { TicketStatus } = require('../enums')
const DbSession = require('./dbSession')

exports = class Bot {
  constructor (token, freshdesk, db) {
    if (!token) {
      throw Error('Token required')
    }

    this.bot = new Telegraf(token)
    this.freshdesk = freshdesk
    this.db = db

    // Authorize middleware
    this.bot.use((ctx, next) => {
      console.info('get contact middleware:', 'start')
      freshdesk.listAllContactsAsync({ mobile: 'tg:' + ctx.from.id })
        .then(contacts => {
          ctx.state.user = contacts[0]
          console.info('get contact middleware:', ctx.state.user)
          return next()
        })
        .catch(err => {
          console.error('get contact middleware:', err)
          return next()
        })
    })

    // Register middleware
    this.bot.use((ctx, next) => {
      console.info('check contact middleware: start')
      if (ctx.message && ctx.message.contact) {
        console.info('check contact middleware: contact passed')
        return next()
      }

      if (!ctx.state.user) {
        console.info('check contact middleware: no contact')
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
        console.info('check contact middleware: contact ok')
        return next()
      }
    })

    this.bot.use(new DbSession(this.db).middleware())

    this.bot.on('contact', ctx =>
      new Promise((resolve, reject) => {
        console.info('contact: start')
        let contact = ctx.message.contact
        if (contact.user_id !== ctx.from.id) {
          ctx.reply('Вы отправили чужие данные!')
          return
        }

        let phone = contact.phone_number.replace(/[^0-9]/, '')
        console.info('contact:', phone)

        try {
          if (ctx.state.user) {
            freshdesk.updateContactAsync(ctx.state.user.id, { phone: phone })
              .then(() => onSuccess())
              .catch(err => onError(err))
          } else {
            freshdesk.createContactAsync({ name: `${contact.first_name} ${contact.last_name}`, phone: phone, mobile: `tg:${contact.user_id}` })
              .then(() => onSuccess())
              .catch(err => onError(err))
          }
        } catch (err) {
          console.error('contact:', err)
        }

        function onSuccess () {
          console.info('contact: register success')
          ctx.reply(
            'Спасибо. Теперь вы можете создать новую заявку',
            Markup.keyboard([[Actions.NewTicket, Actions.MyTickets]])
              .resize()
              .extra()
          )
        }

        function onError (err) {
          console.error('contact', err)
          ctx.reply('⚠️ Не удалось авторизоваться. Попробуйте ещё раз.')
        }
      }))

    this.bot.hears(Actions.MyTickets, ctx => {
      freshdesk.listAllTicketsAsync({ requester_id: ctx.state.user.id })
        .then(tickets => {
          tickets.forEach(ticket => {
            ctx.replyWithMarkdown(formatTicket(ticket), Extra.markup(m =>
              m.inlineKeyboard([
                m.callbackButton('Комментарий', '_message_' + ticket.id),
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

    this.bot.hears(Actions.NewTicket, ctx => {
      ctx.session.state = States.WaitForTitle
      ctx.reply('Введите краткое описание')
    })

    this.bot.hears(() => true, ctx =>
      new Promise((resolve, reject) => {
        if (ctx.session.state === States.WaitForTitle) {
          let ticket = new Ticket(ctx.state.user.id, ctx.message.text)
          freshdesk.createTicketAsync(ticket)
            .then(({ id }) => {
              ctx.session.state = States.WaitForMessage
              ctx.session.selectedTicket = id
              ticket.id = id

              ctx.replyWithMarkdown(formatTicket(ticket), Extra.markup(m =>
                m.inlineKeyboard([
                  m.callbackButton('Комментарий', '_message_' + ticket.id),
                  m.callbackButton('Решено', '_resolved_' + ticket.id)
                ])
              ))
              ctx.reply('Заявка создана. Введите подробности')

              resolve()
            })
            .catch(err => {
              console.error(err)
              ctx.reply('⚠️ Не удалось создать заявку.')
              resolve()
            })
        }

        if (ctx.session.state === States.WaitForMessage && ctx.session.selectedTicket) {
          freshdesk.createNoteAsync(ctx.session.selectedTicket, new Note(`<b>Комментарий от клиента:</b><br/><i>${ctx.message.text}</i>`))
            .then(() => {
              ctx.reply('✔️ Комментарий добавлен')
            })
        }
      }))

    this.bot.action(
      action => {
        return /_message_(\d+)/.test(action)
      },
      ctx => {
        let id = ctx.match[1]
        ctx.session.state = States.WaitForMessage
        ctx.session.selectedTicket = id

        ctx.reply('Введите комментарий')
          .catch(err => console.error(err))

        ctx.answerCbQuery('Введите комментарий')
          .catch(err => console.error(err))
      })

    this.bot.action(
      action => {
        return /_resolved_(\d+)/.test(action)
      },
      ctx => {
        console.info('resolved:', 'start')
        let id = RegExp.$1
        console.info('resolved:', id)

        let ticket = freshdesk.updateTicketAsync(id, { status: TicketStatus.Resolved })
          .then(() => {
            console.info('resolved:', 'success')

            ctx.editMessageText(formatTicket(ticket), Extra.markup(m =>
              m.inlineKeyboard([
                m.callbackButton('Комментарий', '_message_' + id)
              ])
            ).markdown())
              .catch(err => console.error(err))

            ctx.answerCbQuery('Заявка решена')
              .catch(err => console.error(err))
          })
          .catch(err => {
            console.error(err)
            ctx.reply('⚠️ Ошибка.')
          })
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
