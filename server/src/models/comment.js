import { ObjectId } from 'mongodb'

export class Comment {
  constructor (userId, text) {
    this.userId = ObjectId(userId)
    this.text = text
    this.date = new Date()
  }
}
