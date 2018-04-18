import moment from 'moment'

export function formatTicket (ticket) {
  let shortId = ticket._id.toString().substr(0, 5)
  let date = moment(ticket.date).format('DD MMM HH:mm')

  return `*Тикет #${shortId}*\n` + `🕓 ${date}\n` + `✔️ ${ticket.status}\n` + `${ticket.title}`
}
