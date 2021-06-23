
import { connect, disconnect } from '../mongo-connection'
import { findCandidatsSignIn } from '../models/candidat'
import { deleteCandidats } from '../models/__tests__/candidats'
import { createCandidatsForTestToDateConnect } from '../models/__tests__/candidatsToTestConnect'
import { setDateConnexion } from './update-candidats'

describe('fix data of candidat ', () => {
  beforeAll(async () => {
    await connect()
    await createCandidatsForTestToDateConnect()
  })

  afterAll(async () => {
    await deleteCandidats()
    await disconnect()
  })

  it('should update candidat', async () => {
    const results = await setDateConnexion()
    expect(results).toBe(true)
    const candidatsFound = await findCandidatsSignIn({ token: { $exists: true }, tokenAddedAt: { $exists: false } }, '_id codeNeph')
    expect(candidatsFound).toHaveLength(0)
  })
})
