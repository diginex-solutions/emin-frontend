import { routesApi } from '@/router'
import { finderById } from '@/utils/helpers'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/notificationsD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Notifications.Record
type ModuleState = Notifications.State

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const notificationsStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,

  state: { records: [] },

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

  getters: {
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

    // Records: update record
    [Mutations.markRead](state, { id }: Record) {
      const findById = finderById(id)
      const index = state.records.findIndex(findById)
      if (index === -1) {
        return
      }
      const record = state.records[index]
      record.isRead = true
      Vue.set(state.records, index, record)
    }
  },

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  actions: {
    [Actions.reset]({ commit }) {
      commit(Mutations.set)
      return Promise.resolve()
    },

    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.notifications.index()
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    // * Mark the notification as read
    async [Actions.markRead]({ commit, dispatch }, { id }: Record) {
      const url = routesApi.notifications.markRead(id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.markRead, res)
      return Promise.resolve(res)
    }
  }
}
