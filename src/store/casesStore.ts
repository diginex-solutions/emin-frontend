import _ from 'lodash'
import { routesApi } from '@/router'
import { RootA } from '@/types/'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq, RTX, sendReqProm } from '@/utils/helpers'
import { finderById } from '@/utils/helpers'
import { Getters, Mutations, Actions, StatusType } from '@/types/casesD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Cases.Record
type ModuleState = Cases.State
type CaseType = Cases.CaseType

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const casesStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,

  state: {
    records: [],
    selected: null,
    caseTypes: []
  },

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

  getters: {
    [Getters.records](state): Record[] {
      return [...state.records]
    },

    [Getters.getSelected](state): Record | null {
      return state.selected
    },

    [Getters.getCaseTypes](state): CaseType[] {
      return _.orderBy(state.caseTypes, ['value'], ['asc'])
    }
  },

  //*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

  mutations: {
    // Records: save array
    [Mutations.set](state, payload: Record[] = []) {
      state.records = payload
    },

    // Records: push to array
    [Mutations.create](state, payload: Record) {
      state.records = [...state.records, payload]
    },

    // Records: update record
    [Mutations.update](state, record: Record) {
      const index = state.records.findIndex((p: Record) => p.id === record.id)
      Vue.set(state.records, index, record)
      state.selected = record
    },

    // Update comment object
    [Mutations.commentUpdate](state, comment) {
      const theCase = state.selected
      const feed = theCase?.events
      if (!theCase || !feed) return
      const findById = finderById(comment.id)
      const index = feed.findIndex(findById)
      if (index === -1) return
      Vue.set(feed, index, comment) // Update comment + reactivity
    },

    // Delete comment
    [Mutations.commentDelete](state, comment) {
      const theCase = state.selected // Validate, get some helper functions
      const feed = theCase?.events
      if (!theCase || !feed) return //? Exn
      const findById = finderById(comment.id)
      const index = feed.findIndex(findById)
      if (index === -1) return //? Exn
      feed.splice(index, 1) // Removes comment + reactivity
    },

    [Mutations.feedAdd](state, feedEvent) {
      const theCase = state.selected
      const feed = theCase?.events
      if (!theCase || !feed) return //? Exn
      feed.push(feedEvent) // Add event to feed
      Vue.set(theCase, 'feed', feed) // Reactivity
    },

    // Records: delete
    [Mutations.delete](state, { id }: Record) {
      const findById = (p: Record) => p.id === id
      const index = state.records.findIndex(findById)
      if (index < 0) return
      state.records.splice(index, 1)
    },

    [Mutations.selectedSet](state, payload: Record | null = null) {
      state.selected = payload
    },

    [Mutations.usersAdd](state, users: Cases.User[]) {
      const theCase = state.selected
      const caseUsers = theCase?.users
      if (!theCase || !caseUsers) return //? Exn
      caseUsers.push(...users) // Add user to feed
      Vue.set(theCase, 'users', caseUsers) //* Trigger vue-update
    },

    [Mutations.setCaseTypes](state, caseTypes: CaseType[] = []) {
      state.caseTypes = [...caseTypes]
    },

    [Mutations.addCaseType](state, caseTypes: CaseType[]) {
      caseTypes.forEach((caseType) => {
        const findByCaseType = (c: CaseType) => c.value === caseType.value
        const idx = state.caseTypes.findIndex(findByCaseType)
        if (idx < 0) {
          state.caseTypes = [...state.caseTypes, caseType]
        }
      })
      state.caseTypes = _.orderBy(state.caseTypes, ['value'], ['asc'])
    },

    [Mutations.deleteCaseType](state, { caseTypeId, success }) {
      if (success) {
        const findbyCaseTypeId = (caseType: Cases.CaseType) =>
          caseType.id === caseTypeId
        const index = state.caseTypes.findIndex(findbyCaseTypeId)
        if (index >= 0) {
          state.caseTypes.splice(index, 1)
        }
      }
    }
  },

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  actions: {
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.cases.index()
      dispatch(RootA.updateLoading, true, RTX)
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX)
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    // * Case creation
    async [Actions.create]({ commit, dispatch }, data) {
      const url = routesApi.cases.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.create, res)
      return Promise.resolve(res)
    },

    // * Case update
    async [Actions.update]({ commit, dispatch }, updatedCase) {
      const data = {
        resolutionPlan: updatedCase.resolutionPlan,
        assignedTo: updatedCase.assignedTo,
        status: updatedCase.status
      }
      const url = routesApi.cases.update(updatedCase.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
      return Promise.resolve(res)
    },

    // TODO: case deleting is forbidden at v1
    [Actions.delete]({ commit }, { id }: Record) {
      commit(Mutations.delete, { id })
      return Promise.resolve()
    },

    [Actions.selectedSet]({ commit }, record) {
      commit(Mutations.selectedSet, record)
      return Promise.resolve()
    },

    // * Comment create
    async [Actions.commentCreate]({ state, commit, dispatch }, { message }) {
      //? Exn: Verify case is selected
      if (!state.selected || !state.selected.events) return Promise.reject()
      const url = routesApi.cases.commentCreate(state.selected.id)
      const data = { comment: message }
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.feedAdd, res)
      return Promise.resolve(res)
    },

    async [Actions.commentUpdate](
      { state, commit, dispatch },
      { id, message }
    ) {
      //? Exn: Verify case is selected
      if (!state.selected || !state.selected.events) return Promise.reject()

      const url = routesApi.cases.commentUpdate(id)
      const data = { comment: message }
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.commentUpdate, res)
      return Promise.resolve(res)
    },

    async [Actions.commentDelete]({ state, commit, dispatch }, { id }) {
      //? Exn: Verify case is selected
      if (!state.selected || !state.selected.events) return Promise.reject()

      const url = routesApi.cases.commentDelete(id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.commentDelete, { id })
      return Promise.resolve(res)
    },

    // User is being added to the case
    [Actions.feedAdd]({ commit }, item) {
      commit(Mutations.feedAdd, item)
      return Promise.resolve()
    },

    // User is being added to the case
    [Actions.usersAdd]({ state, commit, dispatch }, users) {
      //? Exn: Verify case is selected
      if (!state.selected) return Promise.reject()

      // ** For each user - dispatch to backend, on response add user to case
      const url = routesApi.cases.usersAdd(state.selected.id)
      const onSuccess = (data: {
        user: Cases.User
        event: Cases.CaseFeedItem
      }) => {
        const { user, event } = data
        commit(Mutations.usersAdd, [user])
        commit(Mutations.feedAdd, event)
      }

      const usersAdd: Array<Promise<void>> = [] // Store promises
      users.forEach((user: Cases.User) => {
        const data = { userId: user.id }
        const payload = { url, data, onSuccess }
        const userAddProm = sendReqProm(dispatch, payload)
        usersAdd.push(userAddProm)
      })

      // After each user has been handled - return
      return Promise.all(usersAdd)
    },

    [Actions.reset]({ commit }) {
      commit(Mutations.set)
      return Promise.resolve()
    },

    async [Actions.statusUpdate](
      { state, commit, dispatch },
      status: StatusType
    ) {
      //? Exn: Verify case is selected
      if (!state.selected) return Promise.reject()
      const url = routesApi.cases.update(state.selected.id)
      const data = { status }
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
      return Promise.resolve(res)
    },

    async [Actions.fetchCaseTypes]({ commit, dispatch }) {
      const url = routesApi.cases.fetchCaseTypes()
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.setCaseTypes, res)
      return Promise.resolve(res)
    },

    async [Actions.fileUploads]({ commit, dispatch }, data) {
      const formData = new FormData()
      formData.append('id', data.id) //* Append case's id to the payload
      if (!data.file) return Promise.reject() //? Exn - no files

      //* Process files - if array, append each to form
      if (Array.isArray(data.file)) {
        for (const f of data.file) {
          formData.append('file', f)
        }
      } else {
        formData.append('file', data.file)
      }

      //* Compose payload and send request
      const payload = {
        url: routesApi.cases.fileUploads(data.id),
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      }
      const [err, res] = await sendReq(dispatch, payload)
      if (err) return Promise.reject(err) //? Exn
      const saveItem = (feed: Cases.FeedItem) => commit(Mutations.feedAdd, feed)
      res.forEach(saveItem)
      return Promise.resolve(res)
    },

    [Actions.removeAssigned]({ commit }, record) {
      commit(Mutations.delete, record)
      return Promise.resolve()
    },

    async [Actions.createCaseTypes]({ commit, dispatch }, data) {
      const url = routesApi.cases.createCaseTypes()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.addCaseType, res)
      return Promise.resolve(res)
    },

    async [Actions.deleteCaseType]({ commit, dispatch }, caseTypeId: string) {
      const url = routesApi.cases.deleteCaseTypes(caseTypeId)
      const [err, res] = await sendReq(dispatch, { url, data: caseTypeId })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.deleteCaseType, { ...res, caseTypeId })
      return Promise.resolve(res)
    }
  }
}
