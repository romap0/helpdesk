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
    return this.collection.findOneAndUpdate({_id: ObjectId(id)}, {
      $push: {'messages': message}
    },
    {
      returnNewDocument: true
    })
  }

  async addComment (id, comment) {
    return this.collection.findOneAndUpdate({_id: ObjectId(id)}, {
      $push: {'comments': comment}
    },
    {
      returnNewDocument: true
    })
  }

  async setStatus (id, status) {
    return this.collection.findOneAndUpdate({_id: ObjectId(id)}, {
      $set: {status: status}},
    {
      returnNewDocument: true
    })
  }

  async setTags (id, tags) {
    return this.collection.findOneAndUpdate({_id: ObjectId(id)}, {
      $set: {tags: tags}},
    {
      returnNewDocument: true
    })
  }
}
