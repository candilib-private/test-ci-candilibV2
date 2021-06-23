import jwt from 'jsonwebtoken'
import faker from 'faker/locale/fr'
import { getFrenchLuxon } from '../../util'
import { createCandidat } from '../candidat'

const generateCommonInfoCandidat = (id) => {
  return {
    codeNeph: `123${id}456789000`,
    nomNaissance: faker.name.lastName(),
    prenom: faker.name.firstName(),
    email: faker.internet.email(),
    portable: `06${faker.phone.phoneNumberFormat().slice(2)}`,
    departement: `${faker.address.zipCode()}`,
    homeDepartement: `${faker.address.zipCode()}`,
  }
}

export const createCandidatsForTestToDateConnect = async () => {
  const now = getFrenchLuxon()
  // Candidat dans aucune tranche
  let id = 0
  const candidatsTrancheNone = [
    {
      isValidatedByAurige: false,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
    },
    {
      isValidatedByAurige: true,
      canAccessAt: faker.date.future(),
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
    },
  ]
  // Candidat de la 1er tranche
  const candidatsTranche1 = [
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 20 }).toSeconds() }, 'secret'),
      tokenAddedAt: now.minus({ days: 20 }),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 30 }).toSeconds() }, 'secret'),
      tokenAddedAt: faker.date.past(),
      lastConnection: now.minus({ days: 30 }),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 59 }).toSeconds() }, 'secret'),
    },
  ]
  // Candidat de la 2er tranche
  const candidatsTranche2 = [
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 61 }).toSeconds() }, 'secret'),
      canAccessAt: faker.date.past(),
      tokenAddedAt: now.minus({ days: 61 }),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 80 }).toSeconds() }, 'secret'),
      tokenAddedAt: faker.date.past(),
      lastConnection: now.minus({ days: 80 }),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 89 }).toSeconds() }, 'secret'),
    },
  ]
  // Candidat de la 3er tranche
  const candidatsTranche3 = [
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      tokenAddedAt: now.minus({ days: 91 }),
      token: jwt.sign({ iat: now.minus({ days: 91 }).toSeconds() }, 'secret'),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      tokenAddedAt: faker.date.past(),
      lastConnection: now.minus({ days: 100 }),
      token: jwt.sign({ iat: now.minus({ days: 100 }).toSeconds() }, 'secret'),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 119 }).toSeconds() }, 'secret'),

    },
  ]

  const candidatsTranche4 = [
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      tokenAddedAt: now.minus({ days: 121 }),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      tokenAddedAt: faker.date.past(),
      lastConnection: now.minus({ days: 130 }),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
      canAccessAt: faker.date.past(),
      token: jwt.sign({ iat: now.minus({ days: 121 }).toSeconds() }, 'secret'),
    },
  ]

  const candidatsTranche5 = [
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      createdAt: faker.date.past(),
    },
    {
      isValidatedByAurige: true,
      ...generateCommonInfoCandidat(id++),
      canAccessAt: faker.date.past(),
      createdAt: faker.date.past(),
    },
  ]
  const candidats = {
    candidatsTrancheNone,
    candidatsTranche1,
    candidatsTranche2,
    candidatsTranche3,
    candidatsTranche4,
    candidatsTranche5,
  }

  await Promise.all([
    ...candidatsTrancheNone,
    ...candidatsTranche1,
    ...candidatsTranche2,
    ...candidatsTranche3,
    ...candidatsTranche4,
    ...candidatsTranche5,
  ].map(createCandidat))

  return candidats
}
