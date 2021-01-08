import delay from 'delay'
import mongoose from 'mongoose'

import { dbOptions } from './config'
import { closeConnection, createInstanceMongoMemoryServer } from './mongo-memory-server-factory'
import { techLogger } from './util'

mongoose.Promise = Promise

const isTest = process.env.NODE_ENV === 'test'
const dbName = dbOptions.db
const dbAdmin = dbOptions.user
const dbPassword = dbOptions.pass

const mongoURL =
  process.env.MONGO_URL ||
  `mongodb://${dbAdmin}:${dbPassword}@localhost:27017/${dbName}`

let reconnectTries = 30
const reconnectInterval = process.env.NODE_ENV === 'production' ? 2000 : 1000

const mongooseOpts = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
}

export const connect = async () => {
  let mongoUri
  let instanceMongoMemServer
  try {
    if (isTest) {
      const { instance, uri } = await createInstanceMongoMemoryServer()
      instanceMongoMemServer = instance
      mongoUri = uri
    } else {
      mongoUri = mongoURL
    }
    await mongoose.connect(mongoUri, mongooseOpts)
    techLogger.info('Connected to Mongo!')
    return instanceMongoMemServer
  } catch (err) {
    await instanceMongoMemServer?.stop()
    --reconnectTries
    if (reconnectTries > 0) {
      techLogger.warn(
        `Could not connect to Mongo at ${mongoUri}, ${reconnectTries} tries left`,
      )
      return delay(reconnectInterval).then(connect)
    } else {
      const errorMessage =
        'Could not connect to Mongo, make sure it is started and listening on the appropriate port'
      throw new Error(errorMessage)
    }
  }
}

export const disconnect = async (instanceMongoMemoryServer) => {
  try {
    await mongoose.disconnect()
    if (isTest) {
      await closeConnection(instanceMongoMemoryServer)
    }
  } catch (error) {
    techLogger.info('Disconnected from Mongo')
  }
}
