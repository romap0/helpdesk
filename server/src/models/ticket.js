import { ObjectId } from 'mongodb'
import { TicketStatus } from '../enums'

export class Ticket {
  constructor (userId, title) {
    this.userId = ObjectId(userId)
    this.title = title
    this.date = new Date()
    this.status = TicketStatus.New
  }
}
