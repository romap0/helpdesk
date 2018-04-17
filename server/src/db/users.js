import { CrudDb } from './crudDb'
import { StoreName } from '../enums'

export class UsersDb extends CrudDb {
  constructor () {
    super(StoreName.Users)
  }

  async getByTelegramId (id) {
    return this.collection.findOne({user_id: id})
  }
}
