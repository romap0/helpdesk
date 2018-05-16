import { TicketStatus, TicketPriority, TicketSource } from '../enums'

export class Ticket {
  constructor (userId, subject) {
    this.requester_id = userId
    this.subject = subject
    this.source = TicketSource.Chat
    this.priority = TicketPriority.Medium
    this.status = TicketStatus.Open
    this.description = subject
  }
}
