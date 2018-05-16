const moment = require('moment')

exports = function formatTicket (ticket) {
  let date = moment(ticket.created_at).format('DD MMM HH:mm')

  return `*Тикет #${ticket.id}*\n` + `🕓 ${date}\n` + `✔️ ${ticket.status}\n` + `${ticket.subject}`
}
