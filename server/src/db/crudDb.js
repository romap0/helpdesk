import { ObjectId } from 'mongodb'
import patchesToMongo from 'jsonpatch-to-mongodb'
import { MongoService } from '../services/mongoService'

export class CrudDb {
  /**
   * @param {TableType} storeName One of TableType enum
   */
  constructor (storeName) {
    this.storeName = storeName
    this.db = MongoService.db
  }

  /**
   * Get list of documents or one by Id
   * @param {string?} id Document id
   */
  async get (id = null) {
    let findObj = null
    if (id) {
      findObj = { _id: ObjectId(id) }
    }

    let result = await this.db
      .collection(this.storeName)
      .find(findObj)

    return id ? result : result.toArray()
  }

  /**
   * Insert document into collection
   * @param {any} data
   */
  async put (data) {
    let result = await this.db
      .collection(this.storeName)
      .insertOne(data)

    return result
  }

  /**
   * Patch document in collection
   * @param {string} id Id of entity to patch
   * @param {Object} patch List of json-patch operations
   */
  async patch (id, patch) {
    let mongoPatch = patchesToMongo(patch)

    let result = await this.db
      .collection(this.storeName)
      .findOneAndUpdate(
        { _id: ObjectId(id) },
        mongoPatch,
        { returnOriginal: false })

    return result
  }
}
