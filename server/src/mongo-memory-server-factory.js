// import { MongoMemoryServer } from 'mongodb-memory-server'

export const mongodbMemServers = {}

export const createInstanceMongoMemoryServer = async () => {
  let { default: MongoMemoryServer } = await import('mongodb-memory-server')
  if (typeof MongoMemoryServer !== 'function') { // This depends on whether ESM are transpiled (for jest) or not
    MongoMemoryServer = MongoMemoryServer.MongoMemoryServer
  }
  const instance = new MongoMemoryServer()
  const uri = await instance.getUri()
  mongodbMemServers[uri] = instance
  return { instance, uri }
}

export const closeConnection = async (instanceMongoMemoryServer) => {
  if (instanceMongoMemoryServer) {
    return await instanceMongoMemoryServer.stop()
  }
  for (const [mongoUri, server] of Object.entries(mongodbMemServers)) {
    await server?.stop()
    delete mongodbMemServers[mongoUri]
  }
}
