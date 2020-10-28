import { routesApi } from '@/router'
import { Module } from 'vuex'
import { sendReq } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/documentTypesD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary;

type Record = DocumentTypes.Record
type ModuleState = DocumentTypes.State
const sortRecords = (records: Record[]) =>
  (records || []).sort((a, b) => {
    const nameA = a.title.toLocaleLowerCase()
    const nameB = b.title.toLocaleLowerCase()
    return nameA.localeCompare(nameB)
  })

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const documentTypesStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,
  state: { records: [] },
  getters: {
    // return new array of records
    [Getters.records](state): Record[] {
      return [...state.records]
    }
  },
  mutations: {
    // Init document types
    [Mutations.set](state, payload = []) {
      state.records = sortRecords(payload)
    },

    // Add document type
    [Mutations.create](state, record: Record) {
      const idx = state.records.findIndex((r) => r.title === record.title) //! Title as id?
      if (idx < 0) {
        state.records = sortRecords([...state.records, record])
      }
    },

    // Delete document type by given id from the store
    [Mutations.delete](state, { _id }: Record) {
      const findById = (p: Record) => p._id === _id
      const index = state.records.findIndex(findById)
      if (index < 0) return //? Exn
      state.records.splice(index, 1)
    }
  },

  actions: {
    //* Fetch all document types
    async [Actions.fetch]({ commit, dispatch }, spaceId: string) {
      const url = routesApi.documenttypes.index(spaceId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    //* Creating new document type
    async [Actions.create]({ commit, dispatch }, data) {
      const url = routesApi.documenttypes.create(data.spaceId)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.create, res)
      return Promise.resolve(res)
    },

    async [Actions.delete]({ commit, dispatch }, { spaceId, _id }: Record) {
      const url = routesApi.documenttypes.delete(spaceId, _id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.delete, res)
      return Promise.resolve(res)
    }
  }
}
