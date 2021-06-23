import chunk from 'lodash-es/chunk.js'
import { findCandidatsSignIn, updateBulkCandidatDateToken } from '../models/candidat'
import { appLogger, getTokenDateCreated } from '../util'

export const setDateConnexion = async () => {
  const candidatsFound = await findCandidatsSignIn({ token: { $exists: true }, tokenAddedAt: { $exists: false } }, '_id token')
  if (!candidatsFound || !candidatsFound.length) {
    return false
  }

  await chunk(candidatsFound, 100).reduce(async (promise, candidatsToUpdate) => {
    return promise.then(async result => {
      try {
        const updated = await updateBulkCandidatDateToken(candidatsToUpdate.map(({ _id, token }) => ({ _id, tokenAddedAt: getTokenDateCreated(token) })))
        result.modifiedCount += updated.modifiedCount
      } catch (error) {
        appLogger.error({
          section: 'initDB-setDateConnexion',
          description: error.message,
          error,
        })
      }
      return result
    },
    )
  }, Promise.resolve({ modifiedCount: [] }))

  return true
}
