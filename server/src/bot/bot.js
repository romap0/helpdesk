import Telegraf from 'telegraf'
// import HttpsProxyAgent from 'https-proxy-agent'
import Extra from 'telegraf/extra'
import Markup from 'telegraf/markup'
import session from 'telegraf/session'
import { UsersDb, TicketsDb } from '../db'
import { Actions } from './actions'
import { Ticket } from '../models/ticket'
import { States } from './states'
import { Message } from '../models/message'
import { formatTicket } from './format'
import { TicketStatus } from '../enums'
import freshdesk from '../services/freshdesk'

export class Bot {
  static start () {
    this.bot = new Telegraf(process.env.BOT_TOKEN, {
      telegram: {
        // agent: new HttpsProxyAgent('https://89.236.17.106:3128')
      }
    })
    this.bot.use(session())

    // Authorize middleware
    this.bot.use(async (ctx, next) => {
      try {
        let contactsByTelegramId = await freshdesk.listAllContactsAsync({mobile: 'tg:' + ctx.from.id})
        ctx.state.user = contactsByTelegramId[0]
      } catch (ex) {
        console.error(ex)
      }

      next()
    })

    // Register middleware
    this.bot.use(async (ctx, next) => {
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
    this.bot.on('contact', async ctx => {
      let contact = ctx.message.contact
      if (contact.user_id !== ctx.from.id) {
        ctx.reply('Вы отправили чужие данные!')
        return
      }

      let phone = contact.phone_number.replace(/[^0-9]/, '')

      try {
        if (ctx.state.user) {
          await freshdesk.updateContactAsync(ctx.state.user.id, {phone: phone})
        } else {
          await freshdesk.createContactAsync({name: `${contact.first_name} ${contact.last_name}`, phone: phone, mobile: `tg:${contact.user_id}`})
        }

        ctx.reply(
          'Спасибо. Теперь вы можете создать новый тикет',
          Markup.keyboard([[Actions.NewTicket, Actions.MyTickets]])
            .resize()
            .extra()
        )
      } catch (ex) {
        console.error(ex)
        ctx.reply('⚠️ Не удалось авторизоваться. Попробуйте ещё раз.')
      }
    })

    this.bot.hears(Actions.MyTickets, async ctx => {
      try {
        let tickets = await freshdesk.listAllTicketsAsync({requester_id: ctx.state.user.id})

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
      } catch (ex) {
        console.error(ex)
        ctx.reply('⚠️ Не удалось получить список заявок.')
      }
    })

    this.bot.hears(Actions.NewTicket, async ctx => {
      ctx.session.state = States.WaitForTitle
      ctx.reply('Введите краткое описание')
    })

    this.bot.hears(/.*/, async ctx => {
      if (ctx.session.state === States.WaitForTitle) {
        try {
          let ticket = new Ticket(ctx.state.user.id, ctx.message.text)
          let {id} = await freshdesk.createTicketAsync(ticket)

          ctx.session.state = States.WaitForMessage
          ctx.session.selectedTicket = id
          ctx.replyWithMarkdown(formatTicket(ticket), Extra.markup(m =>
            m.inlineKeyboard([
              m.callbackButton('Сообщение', '_message_' + id),
              m.callbackButton('Решено', '_resolved_' + id)
            ])
          ))
          ctx.reply('Тикет создан. Введите подробности')
        } catch (ex) {
          console.error(ex)
          ctx.reply('⚠️ Не удалось создать заявку.')
        }
        return
      }

      if (ctx.session.state === States.WaitForMessage && ctx.session.selectedTicket) {
        new TicketsDb().addMessage(ctx.session.selectedTicket,
          new Message(ctx.state.user._id, ctx.message.text))
        ctx.reply('Сообщение добавлено')
      }
    })

    this.bot.action(/_message_(.*)/, async ctx => {
      let id = ctx.match[1]
      ctx.session.state = States.WaitForMessage
      ctx.session.selectedTicket = id
      ctx.reply('Введите сообщение')
      ctx.answerCbQuery()
    })

    this.bot.action(/_resolved_(.*)/, async ctx => {
      let id = ctx.match[1]
      let ticket = (await new TicketsDb().setStatus(id, TicketStatus.Resolved)).value
      console.log(ticket)

      ctx.editMessageText(formatTicket(ticket), Extra.markup(m =>
        m.inlineKeyboard([
          m.callbackButton('Сообщение', '_message_' + id)
        ])
      ).markdown())
      ctx.answerCbQuery()
    })

    this.bot.startPolling()
  }

  static async sendMessage (userId, text) {
    let user = await new UsersDb().get(userId)
    let chatId = user.user_id

    await this.bot.telegram.sendMessage(chatId, text, Extra.markdown())
  }
}
