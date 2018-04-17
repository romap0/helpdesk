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
      ctx.state.user = await new UsersDb().getByTelegramId(ctx.from.id)
      next()
    })

    // Register middleware
    this.bot.use(async (ctx, next) => {
      if (ctx.message.contact) {
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

      if (ctx.state.user) {
        await new UsersDb().put(ctx.state.user.user_id, contact)
      } else {
        await new UsersDb().post(contact)
      }

      ctx.reply(
        'Спасибо. Теперь вы можете создать новый тикет',
        Markup.keyboard([[Actions.NewTicket, Actions.MyTickets]])
          .resize()
          .extra()
      )
    })

    this.bot.hears(Actions.MyTickets, async ctx => {
      let tickets = await new TicketsDb().getByUserId(ctx.state.user._id)

      tickets.forEach(ticket => {
        ctx.replyWithMarkdown(ticket.title)
      })
    })

    this.bot.hears(Actions.NewTicket, async ctx => {
      ctx.session.state = States.WaitForTitle
      ctx.reply('Введите краткое описание')
    })

    this.bot.hears(/.*/, async ctx => {
      if (ctx.session.state === States.WaitForTitle) {
        let ticket = new Ticket(ctx.state.user._id, ctx.message.text)
        let {insertedId} = await new TicketsDb().post(ticket)

        ctx.session.state = States.WaitForMessage
        ctx.session.selectedTicket = insertedId
        ctx.reply('Тикет создан. Введите подробности')
        return
      }

      if (ctx.session.state === States.WaitForMessage && ctx.session.selectedTicket) {
        new TicketsDb().addMessage(ctx.session.selectedTicket,
          new Message(ctx.state.user._id, ctx.message.text))
        ctx.reply('Сообщение добавлено')
      }
    })

    this.bot.startPolling()
  }

  static async sendMessage (userId, text) {
    let user = await new UsersDb().get(userId)
    let chatId = user.user_id

    await this.bot.telegram.sendMessage(chatId, text, Extra.markdown())
  }
}
