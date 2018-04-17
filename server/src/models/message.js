export class Message {
  constructor (userId, text) {
    this.userId = userId
    this.text = text
    this.date = new Date()
  }
}
