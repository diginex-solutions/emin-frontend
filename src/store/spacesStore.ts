import r, { Routes, routesApi } from '@/router'
import { RootA, AuthS } from '@/types/'
import { Actions, Getters, Mutations, SpaceRoles } from '@/types/spacesD'
import { finderById } from '@/utils/helpers'
import Vue from 'vue'
import { Module } from 'vuex'
import { sendReq, RTX, sendReqProm } from '@/utils/helpers'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Constructor

const router: typeof r = r
type Record = Spaces.Record
type ModuleState = Spaces.State
type SpaceManager = Spaces.SpaceManager

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

export const spacesStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,
  state: {
    records: [],
    selectedId: '',
    managers: [],
    registeredUsers: [],
    caseManagers: []
  },
  getters: {
    // return new array of records
    [Getters.records](state): Record[] {
      return [...state.records]
    },

    [Getters.isUserDirectory](state, getters): boolean {
      const space = getters[Getters.getSelected]
      return space?.isUserDirectory
    },

    // Get currently selected space
    [Getters.getSelected](state): Record {
      const SpaceDefault = state.records[0]
      const findById = finderById(state.selectedId)
      const space = state.records.find(findById)
      if (space) return space //? If space is found - return tht
      // else, return personal space
      const findPrivate = (s: Record) => s.isPrivate
      console.log(
        ' -> state.records.find(findPrivate) || SpaceDefault:',
        state.records.find(findPrivate) || SpaceDefault
      )
      return state.records.find(findPrivate) || SpaceDefault
    },

    // Return private/personal state
    [Getters.getPersonal](state): Record {
      const SpaceDefault = state.records[0]
      const findPrivate = (s: Record) => s.isPrivate
      return state.records.find(findPrivate) || SpaceDefault
    },

    // * Is authed user admin
    [Getters.isSpaceAdmin](state, getters): boolean {
      const selected = getters[Getters.getSelected]
      return selected && selected.role === SpaceRoles.admin
    },

    // * Is authed user manager
    [Getters.isManager](state, getters, s, rootGetters): boolean {
      const managers = getters[Getters.getCaseManagers]

      const getUser = rootGetters[AuthS.extGetUser]
      const findById = finderById(getUser.id)
      return managers.find(findById)
    },

    //* Is global admin
    [Getters.isAdminGlobal](state): boolean {
      const findPrivate = (s: Record) => s.isPrivate
      const spacePrivate = state.records.find(findPrivate)
      return !!spacePrivate && spacePrivate.role === SpaceRoles.admin
    },

    [Getters.getManagers](state): SpaceManager[] {
      return state.managers.sort((a, b) => {
        const aName = `${a.name} ${a.surname}`.toLowerCase()
        const bName = `${b.name} ${b.surname}`.toLowerCase()
        return aName.localeCompare(bName)
      })
    },

    [Getters.getCaseManagers](state): SpaceManager[] {
      return state.caseManagers.sort((a, b) => {
        const aName = `${a.name} ${a.surname}`.toLowerCase()
        const bName = `${b.name} ${b.surname}`.toLowerCase()
        return aName.localeCompare(bName)
      })
    },

    [Getters.getRegisteredUsers](state): SpaceManager[] {
      return state.registeredUsers.sort((a, b) => {
        const aName = `${a.name} ${a.surname}`.toLowerCase()
        const bName = `${b.name} ${b.surname}`.toLowerCase()
        return aName.localeCompare(bName)
      })
    }
  },
  mutations: {
    //* Process records before storing to local state - handle folder structure
    [Mutations.set](state, payload = []) {
      state.records = payload
    },

    [Mutations.create](state, record: Record) {
      state.records = [...state.records, record]
    },

    //* Updates record - accepts the record that needs to be updated, `id` field is required
    [Mutations.update](state, record) {
      const findById = finderById(record.id)
      const index = state.records.findIndex(findById)
      if (index === -1) return
      Vue.set(state.records, index, record)
    },

    [Mutations.setSelected](state, { id }: Record) {
      state.selectedId = id
    },

    // Delete record by given id from the store
    [Mutations.delete](state, { id }: Record) {
      const findById = finderById(id)
      const index = state.records.findIndex(findById)
      if (index < 0) return
      state.records.splice(index, 1)
    },

    [Mutations.setManager](state, managers: SpaceManager[]) {
      state.managers = [...managers]
    },

    [Mutations.setCaseManager](state, managers: SpaceManager[]) {
      state.caseManagers = [...managers]
    },

    [Mutations.setRegisteredUsers](state, users: SpaceManager[]) {
      state.registeredUsers = [...users]
    },

    [Mutations.deleteManager](state, managerId: string) {
      const findById = finderById(managerId)
      const index = state.managers.findIndex(findById)
      if (index < 0) return
      state.managers.splice(index, 1)
    },

    [Mutations.addManager](state, manager: SpaceManager) {
      const findById = (p: SpaceManager) => p.id === manager.id
      const index = state.managers.findIndex(findById)

      if (index >= 0) {
        state.managers.splice(index, 1)
      }

      state.managers = [...state.managers, manager].sort((a, b) => {
        const aName = `${a.name} ${a.surname}`.toLowerCase()
        const bName = `${b.name} ${b.surname}`.toLowerCase()
        return aName.localeCompare(bName)
      })
    }
  },

  actions: {
    // * Fetch all user's spaces
    async [Actions.fetch]({ commit, dispatch }) {
      const url = routesApi.spaces.index()
      dispatch(RootA.updateLoading, true, RTX)
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX)
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res) //* On Success, save records to state
      return Promise.resolve(res)
    },

    // * Fetch all user's spaces, if admin
    async [Actions.fetchSpacesAdmin]({ dispatch }) {
      const url = routesApi.spaces.indexAdmin()
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    // * Creating new space
    async [Actions.create]({ commit, dispatch }, data) {
      const url = routesApi.spaces.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.create, res)
      return Promise.resolve(res)
    },

    async [Actions.update]({ commit, dispatch }, updatedSpace: Record) {
      const data = {
        name: updatedSpace.name,
        description: updatedSpace.description,
        icon: updatedSpace.icon,
        allowInviteAll: !!updatedSpace.allowInviteAll,
        isUserDirectory: !!updatedSpace.isUserDirectory
      }
      const url = routesApi.spaces.update(updatedSpace.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
      return Promise.resolve(res)
    },

    [Actions.reset]({ commit }) {
      commit(Mutations.set)
      return Promise.resolve()
    },

    [Actions.setSelected]({ commit, dispatch }, space: Record) {
      if (!space) Promise.reject()
      commit(Mutations.setSelected, space)

      // * Update route query
      const spaceId = space.id
      const current = router.currentRoute
      const isUrlSet = current.query.spaceId === spaceId
      if (!isUrlSet) {
        const name = Routes.documents.name
        //* Exn: handling case when user is at forbidden page
        const query = { ...current.query, spaceId }
        router.push({ name, query }) // TODO: should it return?
      }

      return dispatch(RootA.fetchSpace, spaceId, RTX)
    },

    async [Actions.leave]({ commit, dispatch, getters }) {
      const selectedSpace = getters[Getters.getSelected]
      const url = routesApi.spaces.leave(selectedSpace.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn

      //* On successful response
      const spacePersonal = getters[Getters.getPersonal]
      commit(Mutations.delete, res)
      return dispatch(Actions.setSelected, spacePersonal)
    },

    async [Actions.updateSettingsAdmin]({ commit, dispatch }, data: Record) {
      const url = routesApi.spaces.updateSettingsAdmin(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
      return Promise.resolve(res)
    },

    async [Actions.fetchSpace]({ dispatch }, spaceId: string) {
      const url = routesApi.spaces.fetch(spaceId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    async [Actions.updatePersonalSpace]({ getters, commit, dispatch }) {
      const space = getters[Getters.getPersonal]
      const url = routesApi.spaces.fetch(space.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.update, res)
      return Promise.resolve(res)
    },

    async [Actions.fetchManagers]({ commit, dispatch }, spaceId: string) {
      const url = routesApi.spaces.fetchManagers(spaceId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.setManager, res)
      return Promise.resolve(res)
    },

    async [Actions.fetchSelectedSpaceManagers]({ commit, dispatch }) {
      const url = routesApi.spaces.fetchSelectedSpaceManagers()
      const [err, res] = await sendReq(dispatch, { url })
      commit(Mutations.setCaseManager, res || [])
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve()
    },

    async [Actions.fetchRegisteredUsers](
      { commit, dispatch },
      spaceId: string
    ) {
      const url = routesApi.spaces.fetchRegisteredUsers(spaceId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.setRegisteredUsers, res)
      return Promise.resolve(res)
    },

    async [Actions.deleteManager](
      { commit, dispatch },
      { spaceId, managerId }
    ) {
      const url = routesApi.spaces.deleteManager(spaceId, managerId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.deleteManager, managerId)
      return Promise.resolve(res)
    },

    [Actions.addManager]({ commit, dispatch }, data: Spaces.AddManagerP) {
      const { spaceId, managers } = data
      const onSuccess = (r: SpaceManager) => commit(Mutations.addManager, r)

      const promises: Promise<void>[] = []
      managers.forEach((manager) => {
        const url = routesApi.spaces.addManager(spaceId, manager.id)
        promises.push(sendReqProm(dispatch, { url, onSuccess }))
      })

      return Promise.all(promises)
    }
  }
}
