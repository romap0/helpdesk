import { CrudDb } from './crudDb'
import { StoreName } from '../enums'

export class TicketsDb extends CrudDb {
  constructor () {
    super(StoreName.Tickets)
  }

  async getByUserId (userId) {
    return this.collection.find({userId: userId}).toArray()
  }

  async addMessage (id, message) {
    this.collection.update({_id: id}, {
      $push: {'messages': message}
    })
  }
}
