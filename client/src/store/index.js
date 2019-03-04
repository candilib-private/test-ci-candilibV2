
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import message from './message'
import whitelist from './whitelist'
import candidats from './candidats'
import candidat from './candidat'
import aurige from './aurige'
import importPlaces from './import-places'
import center from './center'
import timeSlots from './time-slots'

export * from './auth'
export * from './message'
export * from './whitelist'
export * from './candidats'
export * from './candidat'
export * from './aurige'
export * from './import-places'
export * from './center'
export * from './time-slots'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },

  modules: {
    auth,
    timeSlots,
    message,
    whitelist,
    candidats,
    candidat,
    aurige,
    importPlaces,
    center,
  },
})
