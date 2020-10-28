import { routesApi } from '@/router'
import { RootA } from '@/types/'
import _ from 'lodash'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq, RTX } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/connectionsD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Connections.Record
type ModuleState = Connections.State

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const connectionsStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,

  state: { records: [] },

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

  getters: {
    // return new array of records
    [Getters.records](state): Record[] {
      return [...state.records]
    }
  },

  //*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

  mutations: {
    // Records: save array
    [Mutations.set](state, payload: Record[] = []) {
      state.records = payload
    },

    // Records: push to array
    [Mutations.create](state, record: Record) {
      state.records = _.uniqBy([...state.records, record], (r) => r.email)
    },

    // Records: update record
    [Mutations.update](state, record: Record) {
      const index = state.records.findIndex((p: Record) => p.id === record.id)
      Vue.set(state.records, index, record)
    },

    // Records: delete
    [Mutations.delete](state, { id }: Record) {
      const finderById = (p: Record) => p.id === id
      const index = state.records.findIndex(finderById)
      if (index < 0) return
      state.records.splice(index, 1)
    }
  },

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  actions: {
    //* Fetch all connections
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.connections.index()
      dispatch(RootA.updateLoading, true, RTX) //* Enable spinner
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX) //* Disable spinner
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    //* Req to create new connection
    async [Actions.create]({ commit, dispatch }, data) {
      const url = routesApi.connections.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.create, res)
      return Promise.resolve(res)
    },

    //* Req to delete given connection
    async [Actions.delete]({ commit, dispatch }, user: Record) {
      const url = routesApi.connections.delete(user.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.delete, user)
      return Promise.resolve(res)
    },

    [Actions.reset]({ commit }) {
      commit(Mutations.set)
    }
  }
}
