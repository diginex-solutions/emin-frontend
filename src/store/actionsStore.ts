/*
  Purpose of this state is to store selected documents list, and to keep state of open/closed dialogs
*/

import { finderById } from '@/utils/helpers'
import { Module } from 'vuex'
import { Getters, Mutations, Actions } from '@/types/actionsD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Actions.Record
type ModuleState = Actions.State

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const actionsStore: Module<ModuleState, RootStore.State> = {
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
    [Mutations.selectedSet](state, payload: Record[] = []) {
      state.records = [...payload]
    },

    // Records: push to array
    [Mutations.selectedAdd](state, record: Record) {
      state.records = [...state.records, record]
    },

    // Records: delete
    [Mutations.selectedDelete](state, { id }: Record) {
      const findById = finderById(id)
      const index = state.records.findIndex(findById)

      if (index < 0) return //? Exn

      state.records.splice(index, 1)
    },

    // Refresh selected records - in case if main list updated
    // ! Potentially would be better to store id's rather than obj ref, and introduce getter for docs?
    [Mutations.selectedRefresh](state, records: Record[] = []) {
      const selectedUpdated: Record[] = []

      state.records.forEach(({ id: existingId }: Record) => {
        const findById = finderById(existingId)
        const doc = records.find(findById)

        if (doc) {
          selectedUpdated.push(doc)
          return
        }
      })

      state.records = [...selectedUpdated]
    }
  },

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  actions: {
    [Actions.selectedSet]({ commit }, records) {
      commit(Mutations.selectedSet, records)
      return Promise.resolve()
    },

    [Actions.selectedAdd]({ commit }, record) {
      commit(Mutations.selectedAdd, record)
      return Promise.resolve()
    },

    [Actions.selectedDelete]({ commit }, { id }: Record) {
      commit(Mutations.selectedDelete, { id })
      return Promise.resolve()
    },

    // Items have been updated - refresh selected items array
    [Actions.selectedRefresh]({ commit }, records) {
      commit(Mutations.selectedRefresh, records)
      return Promise.resolve()
    },

    [Actions.reset]({ commit }) {
      commit(Mutations.selectedSet)
    }
  }
}
