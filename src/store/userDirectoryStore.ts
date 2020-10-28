import { Msg } from '@/plugins/i18n'
import { routesApi } from '@/router'
import { AuthS, RootA } from '@/types/'
import { SpaceRoles } from '@/types/spacesD'
import { Module } from 'vuex'
import { sendReq, RTX } from '@/utils/helpers'
import { Getters, Mutations, Actions } from '@/types/userDirectoryD'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary;

type Record = UserDirectory.Record
type ModuleState = UserDirectory.State
type Updates = UserDirectory.Updates
type Update = UserDirectory.Update
type Updating = UserDirectory.Updating
type UserNew = UserDirectory.RawRecord

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const userDirectoryStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,

  state: {
    records: [],
    updates: {},
    pendingUpdates: {}
  },

  //*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

  getters: {
    [Getters.records](state): Record[] {
      return [...state.records]
    },
    [Getters.updates](state): Updates {
      return { ...state.updates }
    },

    // TODO: refac
    [Getters.updatedRecords](state): Record[] {
      const updatedRecords = [...state.records]
      for (const uu of Object.keys(state.updates)) {
        const updatedUser = uu as string
        const position = updatedRecords.findIndex((r) => r.id === updatedUser)
        const copy = { ...updatedRecords[position] } as any // ! FIX
        for (const u of Object.keys(state.updates[updatedUser])) {
          const update = u as 'role' | 'brand' | 'userType'
          copy[update] = state.updates[updatedUser][update]
        }
        updatedRecords[position] = copy
      }
      return updatedRecords
    },
    [Getters.pendingUpdates](state): Updating {
      return { ...state.pendingUpdates }
    },

    // * Fetch users with role "admin"
    [Getters.getAdmins](state): Record[] {
      const filterAdmin = (u: Record) => u.role === SpaceRoles.admin
      return state.records.filter(filterAdmin)
    }
  },

  //*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

  mutations: {
    [Mutations.set](state, payload: Record[] = []) {
      // TODO: not sure what's up with this one, causing problem with updating user, since _id is not present
      // const formattedRecords = payload.map((entry) => {
      //   entry.id = entry._id
      //   delete entry._id
      //   return entry
      // })

      state.records = payload as Record[]
    },

    [Mutations.addUpdate](state, payload: UserDirectory.UpdateUserPayload) {
      const { id, ...update } = payload

      state.updates = {
        ...state.updates,
        [id]: {
          ...state.updates[id],
          ...update
        }
      }

      const [updateType, updateValue] = Object.entries(update)[0] as [
        keyof Update,
        any
      ]

      const record = state.records.find((r) => r.id === id)!
      const backToOriginal = record[updateType] === updateValue
      if (backToOriginal) {
        const containsOtherUpdates = Object.keys(state.updates[id]).length > 1
        if (containsOtherUpdates) {
          delete state.updates[id][updateType]
        } else {
          delete state.updates[id]
        }
      }
    },
    [Mutations.updateRequestPending](state, { id }) {
      state.pendingUpdates = {
        ...state.pendingUpdates,
        [id]: true
      }
    },

    [Mutations.updateRequestSuccess](state, { id }) {
      state.records = [...state.records]
      const profileToUpdate = state.records.find(
        (profile) => profile.id === id
      ) as any // ! FIX
      for (const u of Object.keys(state.updates[id])) {
        const update = u as keyof UserDirectory.Update
        profileToUpdate[update] = state.updates[id][update]
      }

      state.updates = { ...state.updates }
      delete state.updates[id]
      state.pendingUpdates = {
        ...state.pendingUpdates
      }
      delete state.pendingUpdates[id]
    },

    [Mutations.updateRequestFailure](state, { id }) {
      state.updates = {
        ...state.updates,
        [id]: { ...state.updates[id] }
      }
      state.pendingUpdates = { ...state.pendingUpdates }
      delete state.pendingUpdates[id]
    },

    [Mutations.resetUpdates](state) {
      state.updates = {}
    },

    // Delete record by given id from the store
    [Mutations.delete](state, { id }: Record) {
      const findById = (p: Record) => p.id === id
      const index = state.records.findIndex(findById)
      if (index < 0) return
      state.records.splice(index, 1)
    }
  },

  //*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

  actions: {
    async [Actions.fetch]({ commit, dispatch }, noSpinner = false) {
      const url = routesApi.users.index()
      dispatch(RootA.updateLoading, !noSpinner, RTX) // Show spinner only if noSpinner flag not set
      const [err, res] = await sendReq(dispatch, { url })
      dispatch(RootA.updateLoading, false, RTX)
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, res)
      return Promise.resolve(res)
    },

    [Actions.updateUser]({ commit }, payload) {
      commit(Mutations.addUpdate, payload)
      return Promise.resolve()
    },

    [Actions.resetUpdates]({ commit }, payload) {
      commit(Mutations.resetUpdates, payload)
      return Promise.resolve()
    },

    // ! Ref: simplify code, this is so bad
    [Actions.sendUpdate]({ commit, dispatch, state, rootGetters }, payload) {
      const updateConfig = {
        brand: {
          url: routesApi.users.updateBrand()
        },
        userType: {
          url: routesApi.users.updateUserType()
        },
        role: {
          url: routesApi.users.updateRole()
        }
      }

      const { id } = payload
      const requiredUpdates = Object.keys(state.updates[id])

      const requests = []
      for (const u of requiredUpdates) {
        const update = u as 'brand' | 'userType' | 'role' // ! FIX: Don't use literals
        const req = {
          url: updateConfig[update].url,
          data: {
            userId: id,
            [update]: state.updates[id][update]
          }
        }

        const updateReq = sendReq(dispatch, req)
        requests.push(updateReq)
      }

      commit(Mutations.updateRequestPending, payload)

      Promise.all(requests)
        .then(() => {
          commit(Mutations.updateRequestSuccess, payload)
          dispatch(RootA.showSnackbar, Msg.userUpdateSuccess, RTX)

          const currentUserData = rootGetters[AuthS.extGetUser]
          const currentId = currentUserData.id
          const isSelf = id === currentId
          if (isSelf) {
            // update current user info if updates performed on self
            dispatch(AuthS.extFetchUserInfo, null, RTX)
          }
        })
        .catch(() => {
          commit(Mutations.updateRequestFailure, payload)
          dispatch(RootA.showSnackbar, Msg.userUpdateFailure, RTX)
        })
    },

    [Actions.sendUpdates]({ dispatch, state }) {
      const idsToUpdate = Object.keys(state.updates)
      idsToUpdate.forEach((id) => dispatch(Actions.sendUpdate, { id }))
      return Promise.resolve()
    },

    // Create user - send invite
    async [Actions.create]({ state, commit, dispatch }, data: UserNew) {
      const url = routesApi.userDirectory.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.set, [...state.records, res])
      return Promise.resolve(res)
    },

    // Resend invitation
    async [Actions.reinvite]({ dispatch }, id: string) {
      const url = routesApi.userDirectory.reinvite(id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    // * Deletes user from current space
    async [Actions.delete]({ dispatch, commit }, user: Record) {
      const url = routesApi.userDirectory.delete(user.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(Mutations.delete, user)
      return Promise.resolve(res)
    }
  }
}
