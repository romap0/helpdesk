import { ObjectId } from 'mongodb'

export class Ticket {
  constructor (userId, title) {
    this.userId = ObjectId(userId)
    this.title = title
    this.date = new Date()
  }
}