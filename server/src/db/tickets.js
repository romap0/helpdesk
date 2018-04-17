import { ObjectId } from 'mongodb'
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
    return this.collection.update({_id: ObjectId(id)}, {
      $push: {'messages': message}
    })
  }

  async addComment (id, comment) {
    return this.collection.update({_id: ObjectId(id)}, {
      $push: {'comments': comment}
    })
  }
}
