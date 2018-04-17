export class Ticket {
  constructor (userId, title) {
    this.userId = userId
    this.title = title
    this.date = new Date()
  }
}
