import { routesApi } from '@/router'
import { RootA } from '@/types/'
import { finderById } from '@/utils/helpers'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq, RTX } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/formsD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Forms.Record
interface State {
  records: Record[]
}
type ModuleState = State

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

export enum InputTypes {
  text = 'text',
  number = 'number',
  checkbox = 'checkbox',
  select = 'select',
  multiselect = 'multiselect',
  country = 'country',
  date = 'date',
  time = 'time'
}

export const FormStatuses = {
  pending: 'pending',
  received: 'received',
  accepted: 'accepted',
  rejected: 'rejected'
}

export enum FormTypes {
  form = 'form',
  verification = 'verification'
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const formsStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,
  state: { records: [] },
  getters: {
    // return new array of records
    [Getters.records](state): Record[] {
      return [...state.records]
    }
  },
  mutations: {
    // Process records before storing to local state - handle folder structure
    [Mutations.set](state, payload = []) {
      state.records = payload
    },

    [Mutations.addRecords](state, records: Record[]) {
      state.records = [...state.records, ...records]
    },

    // Updates record - accepts the record that needs to be updated, `id` field is required
    [Mutations.update](state, record) {
      const findById = finderById(record.id)
      const index = state.records.findIndex(findById)
      if (index === -1) return
      Vue.set(state.records, index, record)
    }
  },

  actions: {
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.forms.index()
      dispatch(RootA.updateLoading, true, RTX) // Enable loader
      const [err, res] = await sendReq(dispatch, { url }) // Dispatch to be
      dispatch(RootA.updateLoading, false, RTX) // Disable loader
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    [Actions.addRecords]({ commit }, forms: Record[]) {
      commit(Mutations.addRecords, forms)
      return Promise.resolve()
    },

    [Actions.update]({ commit }, form: Record) {
      commit(Mutations.update, form)
      return Promise.resolve()
    },

    async [Actions.fetchHistory]({ dispatch }, { id }: Forms.Record) {
      const url = routesApi.forms.fetchHistory(id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    [Actions.reset]({ commit }) {
      commit(Mutations.set)
      return Promise.resolve()
    }
  }
}
