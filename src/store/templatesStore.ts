import { routesApi } from '@/router'
import { RootA } from '@/types/'
import { finderById } from '@/utils/helpers'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq, RTX } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/templatesD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Templates.Record
type ModuleState = Templates.State

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const templatesStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,
  state: { records: [] },

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters
  getters: {
    //* Return new array of records
    [Getters.records](state): Record[] {
      return [...state.records]
    }
  },

  //*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations
  mutations: {
    //* Set records state
    [Mutations.set](state, payload = []) {
      state.records = payload
    },

    // * Push to array
    [Mutations.create](state, record) {
      state.records = [...state.records, record]
    },

    // * Splice from array record with given id
    [Mutations.delete](state, { id }) {
      const findById = finderById(id)
      const index = state.records.findIndex(findById)
      if (index < 0) return
      state.records.splice(index, 1)
    },

    // * Update state record to provided record
    [Mutations.update](state, record) {
      const findById = finderById(record.id)
      const index = state.records.findIndex(findById)
      Vue.set(state.records, index, record)
    }
  },

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions
  actions: {
    // * Fetch all templates
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.templates.index()
      dispatch(RootA.updateLoading, true, RTX)
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX)
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    // * Create new template
    async [Actions.create]({ commit, dispatch }, data) {
      const url = routesApi.templates.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.create, res)
      return Promise.resolve(res)
    },

    // * Update template
    async [Actions.update]({ commit, dispatch }, data) {
      const url = routesApi.templates.update(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
      return Promise.resolve(res)
    },

    // * Delete template by id
    async [Actions.delete]({ commit, dispatch }, { id }) {
      const url = routesApi.templates.delete(id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.delete, { id })
      return Promise.resolve(res)
    },

    // * Reset state
    [Actions.reset]({ commit }) {
      commit(Mutations.set)
      return Promise.resolve()
    }
  }
}
