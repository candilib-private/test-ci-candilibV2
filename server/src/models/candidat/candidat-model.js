/**
 * Model candidat
 * @module
 */
import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'

import {
  email as emailRegex,
  phone as phoneRegex,
  neph as nephRegex,
} from '../../util'
import { placeCommonFields } from '../place/place.model'
import { ECHEC } from './objetDernierNonReussite.values'

const { Schema } = mongoose

const ArchivedPlaceFields = {
  ...placeCommonFields,
  archivedAt: {
    type: Date,
    default: undefined,
  },
  archiveReason: {
    type: String,
    default: undefined,
  },
  isCandilib: {
    type: Boolean,
    default: undefined,
  },
  byUser: {
    type: String,
    default: undefined,
  },
  candidatStatus: {
    type: String,
    default: undefined,
  },
}

const ArchivedPlaceSchema = new Schema(ArchivedPlaceFields)

const noReussiteFields = {
  date: {
    type: Date,
    default: undefined,
    required: false,
  },
  reason: {
    type: String,
    trim: true,
    required: false,
  },
}

export const candidatFields = {
  nomNaissance: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  prenom: {
    type: String,
    required: false,
    trim: true,
  },
  codeNeph: {
    type: String,
    required: true,
    match: nephRegex,
    trim: true,
  },
  departement: {
    type: String,
    trim: true,
  },
  homeDepartement: {
    type: String,
    trim: true,
  },
  dateReussiteETG: {
    type: Date,
    required: false,
  },
  reussitePratique: {
    type: Date,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: emailRegex,
  },
  portable: {
    type: String,
    required: true,
    trim: true,
    match: phoneRegex,
  },
  adresse: {
    type: String,
    trim: true,
  },
  // retourAurige
  isValidatedByAurige: {
    type: Boolean,
    default: null,
  },
  presignedUpAt: {
    type: Date,
    default: undefined,
  },
  isValidatedEmail: {
    type: Boolean,
    default: false,
  },
  emailValidationHash: {
    type: String,
    default: undefined,
  },
  emailValidatedAt: {
    type: Date,
    default: undefined,
  },
  aurigeValidatedAt: {
    type: Date,
    default: undefined,
  },
  canBookFrom: {
    type: Date,
    default: undefined,
  },
  isEvaluationDone: {
    type: Boolean,
  },
  places: {
    type: [ArchivedPlaceSchema],
    default: undefined,
  },
  resaCanceledByAdmin: {
    type: Date,
    default: undefined,
  },
  nbEchecsPratiques: {
    type: Number,
    default: 0,
    required: false,
  },
  noReussites: [noReussiteFields],
  firstConnection: {
    type: Date,
    required: false,
  },
  canAccessAt: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    required: false,
  },

  token: {
    type: String,
    default: undefined,
  },
}

const CandidatSchema = new Schema(candidatFields, { timestamps: true })

CandidatSchema.index({
  nomNaissance: 'text',
  prenom: 'text',
  email: 'text',
  codeNeph: 'text',
})

CandidatSchema.index({ codeNeph: 1, nomNaissance: 1 }, { unique: true })
CandidatSchema.index({ email: 1 }, { unique: true })
CandidatSchema.index({ departement: 1, canAccessAt: 1 })
CandidatSchema.index({ createdAt: 1 })
CandidatSchema.index({ isValidatedByAurige: 1, canAccessAt: 1, canBookFrom: 1 })

CandidatSchema.pre('save', async function preSave () {
  const candidat = this

  Object.keys(candidatFields).map(key => {
    const value = candidat[key]
    if (value && typeof value === 'string') {
      candidat[key] = sanitizeHtml(value)
    }
  })

  candidat.email = candidat.email.toLowerCase()

  candidat.prenom =
    candidat.prenom &&
    candidat.prenom.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  candidat.nomNaissance =
    candidat.nomNaissance &&
    candidat.nomNaissance.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
})

const theLast = noReussite => {
  if (!noReussite || noReussite.length === 0) {
    return undefined
  }
  return noReussite[noReussite.length - 1]
}

CandidatSchema.virtual('dateDernierNonReussite').get(function () {
  const lastNoReussite = theLast(this.noReussites)
  return lastNoReussite && lastNoReussite.date
})

CandidatSchema.virtual('objetDernierNonReussite').get(function () {
  const lastNoReussite = theLast(this.noReussites)
  return lastNoReussite && lastNoReussite.reason
})

CandidatSchema.virtual('dateDernierEchecPratique')
  .get(function () {
    const lastNoReussite = theLast(this.noReussites)
    return lastNoReussite && lastNoReussite.date
  })
  .set(function (value) {
    if (value) {
      this.noReussites.push({
        date: value,
        reason: ECHEC,
      })
      this.nbEchecsPratiques++
    }
  })

CandidatSchema.virtual('lastNoReussite')
  .get(function () {
    return theLast(this.noReussites)
  })
  .set(function (value) {
    const { date, reason } = value
    if (date && reason) {
      this.noReussites.push({
        date,
        reason,
      })
    }
  })

CandidatSchema.virtual('homeDeptDocument', {
  ref: 'departement',
  localField: 'homeDepartement',
  foreignField: '_id',
  justOne: true,
})

async function getIsInRecentlyDept () {
  if (!this.populated('homeDeptDocument')) {
    await this.populate('homeDeptDocument').execPopulate()
  }

  return this.homeDeptDocument?.isAddedRecently || false
}

/**
 * @async
 *
 * Propriété virtuel pour indiquer que le candidat est dans un département virtuel
 * @property {boolean} isInRecentlyDept
 */
CandidatSchema.virtual('isInRecentlyDept').get(getIsInRecentlyDept)

/**
 * Modèle de données des candidats
 * @typedef {Object} CandidatModel
 * @property {string}                 nomNaissance              Nom de naisssance
 * @property {string}                 prenom                    Prénom
 * @property {string}                 codeNeph                  Code NEPH
 * @property {string}                 departement               Département administratif
 * @property {string}                 homeDepartement           Département de residence
 * @property {Date}                   dateReussiteETG           Date d'obtention du code
 * @property {Date}                   reussitePratique          Date de réussite à l'axamen pratique
 * @property {string}                 email                     Adresse courriel
 * @property {string}                 portable                  Numéro de portable
 * @property {string}                 adresse                   Adresse postale
 * @property {boolean}                isValidatedByAurige       Validation d'aurige
 * @property {Date}                   presignedUpAt             Date d'enregistrement
 * @property {boolean}                isValidatedEmail          Validation de l'adresse mail
 * @property {ArchivedPlaceFields}    places                    Historique des actiosn sur les places du candidat
 * @property {Date}                   resaCanceledByAdmin       Date de la dernier annulation fait un administrateur
 * @property {Number}                 nbEchecsPratiques         Nombre d'échec à l'examen pratique
 * @property {noReussiteFields}       noReussites               Historique des échecs à l'examen pratique
 * @property {Date}                   firstConnection           Date de la premier connection à candilib
 * @property {Date}                   canAccessAt               Date de début dont le candidat à droit de se connecter
 * @property {string}                 status                    Niveau de visibilité de places
 * @property {string}                 token                     Jeton de connexion
 * @property {Date}                   dateDernierEchecPratique  Propriété virtuel mongoose pour récupérer la date d'echec la plus récente
 * @property {string}                 objetDernierNonReussite   Propriété virtuel mongoose pour récupérer la date d'echec la Raison du non réussite la plus récente
 * @property {Date}                   dateDernierNonReussite    Propriété virtuel mongoose pour récupérer la date d'echec la Date du non réussite la plus récente
 * @property {noReussiteFields}       lastNoReussite            Propriété virtuel mongoose pour récupérer la date d'echec la Donnée du non réussite la plus récente
 * @property {Promise.<boolean>}      isInRecentlyDept          Propriété virtuel mongoose pour indiquer que le candidat est dans un département récent
 *
*/

/**
 * Modéle de données de noReussiteFields.
 * Information sur la non réussite (echec, absent, ...) du passage à l'examen
 *
 * @typedef {Object} noReussiteFields
 * @property {Date}     date    Date de non réussite
 * @property {string}   reason  raison du non réussite
 */

/**
 * Modéle de données de l'archive de places d'un candidat
 * @typedef {Object} ArchivedPlaceFields
 *
 * @property {placeCommonFields}  placeCommonFields Champs de la donnée des places
 * @property {Date}               archivedAt        Date de l'archivage
 * @property {string}             archiveReason     Raison de l'archivage
 * @property {boolean}            isCandilib        Indicateur pris de rendez-vous avec candilib
 * @property {string}             byUser            Nom de l'administrateur qui a fait la demande d'archivage
 * @property {string}             candidatStatus    Niveau de visibilité de la place pour le candidat
 */
export default mongoose.model('Candidat', CandidatSchema)
