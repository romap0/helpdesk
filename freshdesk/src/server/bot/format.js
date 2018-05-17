const moment = require('moment')
const { TicketStatus, TicketPriority } = require('../enums')

function getRussianStatus (status) {
  switch (status) {
    case TicketStatus.Open: return 'Открыто'
    case TicketStatus.Pending: return 'В ожидании'
    case TicketStatus.Resolved: return 'Решено'
    case TicketStatus.Closed: return 'Закрыто'
    default: return 'Неизвестно'
  }
}

function getRussianPriority (priority) {
  switch (priority) {
    case TicketPriority.Low: return 'Низкий'
    case TicketPriority.Medium: return 'Средний'
    case TicketPriority.High: return 'Высокий'
    case TicketPriority.Urgent: return 'Срочно'
    default: return 'Неизвестно'
  }
}

function formatTicket (ticket) {
  let date = moment(ticket.created_at).format('DD MMM HH:mm')

  return `*Тикет #${ticket.id}*\n` + `🕓 ${date}\n` + `✔️ ${getRussianStatus(ticket.status)}\n` + `${ticket.subject}`
}

exports.getRussianStatus = getRussianStatus
exports.getRussianPriority = getRussianPriority
exports.formatTicket = formatTicket
