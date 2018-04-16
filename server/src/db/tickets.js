import { CrudDb } from './crudDb'
import { StoreName } from '../enums'

export class TicketsDb extends CrudDb {
  constructor () {
    super(StoreName.Tickets)
  }
}
