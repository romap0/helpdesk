import { ObjectId } from 'mongodb'

export class Message {
  constructor (userId, text) {
    this.userId = ObjectId(userId)
    this.text = text
    this.date = new Date()
  }
}
