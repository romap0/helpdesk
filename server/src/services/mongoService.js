import { MongoClient } from 'mongodb'

export class MongoService {
  static connection
  static db

  static async connect() {
    this.connection = await MongoClient.connect(process.env.DB_CONN)
    this.db = this.connection.db()
    console.log('Connected to MongoDB')
  }

  static disconnect() {
    this.connection.close()
    console.log('MongoDB connection closed')
  }
}
