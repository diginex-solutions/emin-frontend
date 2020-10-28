import { routesApi } from '@/router'
import { SettingsS } from '@/types'
import { RootA } from '@/types/'
import uuid from 'uuid'
import { Module } from 'vuex'
import { sendReq, RTX } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/widgetsD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary;

type Record = Widgets.Record
type ModuleState = Widgets.State

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const widgetsStore: Module<ModuleState, RootStore.State> = {
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
    // Process records before storing to local state - handle folder structure
    [Mutations.set](state, payload = []) {
      state.records = payload
    },

    [Mutations.create](state, payload) {
      state.records = [...state.records, payload]
    },

    [Mutations.delete](state, id) {
      const finderById = (p: Record) => p.id === id
      const index = state.records.findIndex(finderById)
      if (index < 0) return
      state.records.splice(index, 1)
    },

    [Mutations.update](state, record) {
      const index = state.records.findIndex((p: Record) => p.id === record.id)
      if (index < 0) return

      // hack to force widget element rerender
      state.records.splice(index, 1)
      setTimeout(() => {
        state.records.splice(index, 0, record)
      }, 100)
    }
  },

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  actions: {
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.widgets.index()
      dispatch(RootA.updateLoading, true, RTX)
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX)
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    async [Actions.create]({ state, commit, dispatch }, data) {
      data.id = uuid.v4()
      data.data = {} // ? what is this
      const url = routesApi.widgets.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      const widgets = [res, ...state.records]
      commit(Mutations.set, widgets)
      dispatch(SettingsS.extSyncLayouts, null, RTX) // add row to layouts
      return Promise.resolve(res)
    },

    async [Actions.update]({ commit, dispatch }, data) {
      const url = routesApi.widgets.update(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
    },

    async [Actions.delete]({ commit, dispatch, state }, data) {
      const url = routesApi.widgets.delete(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.delete, data.id)
      dispatch(SettingsS.extSyncLayouts, state.records, RTX)
      return Promise.resolve(res)
    },

    [Actions.reset]({ commit }) {
      commit(Mutations.set)
      return Promise.resolve()
    }
  }
}
