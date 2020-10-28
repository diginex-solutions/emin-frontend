/*
  # Store - Documentation

  index.ts provides a unified place for exporting decorators for root and modules.
  Modules are defined in types/*D.ts files, where * is the module name (namespace).
  ( Choice of name is based on similarity to .d.ts, where types for namespaces are defined).
  
  ## *D.ts files

  Contains Getters, Mutations, Actions and Decorators for the namespace

  Getters, Mutations, Actions are used ONLY by the module store file itself.
  Decorator serves as an interface for the external world.

  Decorator fields can be of 2 types: one is for SFC interaction through TS decorators,
  the other is for store interactions.
  In case of store interaction, assumption is that dispatch/getters are called from Root context.

*/

import { Msg } from '@/plugins/i18n'
import r, { PathMethod, Routes } from '@/router'
import {
  ArticlesS,
  AuthS,
  DocsS,
  SpacesS,
  SettingsS,
  FormsS,
  NotificationsS,
  ConnectionsS,
  CasesS,
  TemplatesS,
  UserDirectoryS,
  WidgetsS,
  ActionsS
} from '@/types/'
import { AuthProviders } from '@/types/authD'
import { Actions, Getters, Mutations } from '@/types/storeD'
import { config } from '@/utils/config'
import { finderById, RTX } from '@/utils/helpers'
import axios from 'axios'
import Vue from 'vue'
import Vuex, { ActionTree, GetterTree, MutationTree, StoreOptions } from 'vuex'
import VuexPersistence from 'vuex-persist'
import { actionsStore } from './actionsStore'
import { articlesStore as articles } from './articlesStore'
import { authStore as auth } from './authStore'
import { casesStore as cases } from './casesStore'
import { connectionsStore as connections } from './connectionsStore'
import { docsStore as docs } from './docsStore'
import { documentTypesStore as documenttypes } from './documentTypesStore'
import { formsStore as forms } from './formsStore'
import { notificationsStore as notifications } from './notificationsStore'
import { settingsStore as settings } from './settingsStore'
import { spacesStore as spaces } from './spacesStore'
import { templatesStore as templates } from './templatesStore'
import { userDirectoryStore as userDirectory } from './userDirectoryStore'
import { widgetsStore as widgets } from './widgetsStore'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

interface CustomRouterType {
  currentRoute: {
    meta?: { auth?: boolean }
    name?: string
    query: {
      code?: string
      spaceId?: string
    }
  }
}

interface RequestErrorMessages {
  [key: string]: string
}

type RootState = RootStore.State

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

const router: CustomRouterType = r
const NETWORK_ERROR =
  'Network error has occured, please check connection and try again.'

const REQUEST_ERRORS_MSG: RequestErrorMessages = {
  401: 'Problem while authentication, you will be redirected to login page'
}

axios.defaults.baseURL = config.backendUrl

let axiosInjectSpace = axios.interceptors.request.use((config) => {
  config.params = config.params || {}
  config.params['spaceId'] = ''
  return config
})

// Vuex plugin for persistent storage
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  modules: ['auth'], // Cache auth info
  supportCircular: true
})

Vue.use(Vuex)

const ROOT_STATE: RootState = {
  snackbarMessage: '',
  loaderActive: false,
  loadingQueue: 0 // used to display fullscreen spinner
}

const getters: GetterTree<RootState, RootState> = {
  [Getters.snackbarMessageGet]: (state) => state.snackbarMessage,
  [Getters.isPageLoading]: (state) => state.loaderActive,
  [Getters.isLoading]: (state) => state.loadingQueue > 0
}

const mutations: MutationTree<RootState> = {
  [Mutations.SNACKBAR_MESSAGE_SET](state: RootState, payload: string): void {
    state.snackbarMessage = payload
  },
  [Mutations.LOADER_ACTIVE_SET](state: RootState, value: boolean): void {
    state.loaderActive = value
  },
  [Mutations.updateLoading](state, isIncrement: boolean) {
    if (isIncrement) return state.loadingQueue++

    // Decrement with slight delay, to make sure the spinner is visible till page is rendered
    setTimeout(() => {
      state.loadingQueue--
    }, 100)
  }
}

const actions: ActionTree<RootState, RootState> = {
  [Actions.updateLoading]({ commit }, isLoading: boolean): void {
    commit(Mutations.updateLoading, isLoading)
  },

  [Actions.showSnackbar]({ commit }, message: Msg | string): void {
    commit(Mutations.SNACKBAR_MESSAGE_SET, message)
  },

  [Actions.doPageLoader]({ commit }): void {
    commit(Mutations.LOADER_ACTIVE_SET, true)
    setTimeout(() => {
      commit(Mutations.LOADER_ACTIVE_SET, false)
    }, 100)
  },

  // resetAll: reset all state objects
  [Actions.resetAll]({ dispatch }): void {
    dispatch(AuthS.extReset, null, RTX)
    dispatch(DocsS.extReset, null, RTX)
  },

  // * Middleman for dispatches
  // TODO: implement method type handling, mb use callback to handle onSuccess, onError
  [Actions.myxios](
    { dispatch },
    {
      url,
      data,
      hideError,
      onSuccess,
      onError,
      onFinish,
      options
    }: Store.MyxoisP
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const path = url.path
      const method = url.method

      type AxiosDummyT = Types.AxiosDummy
      let doAxios: Types.AxiosDummy = null

      if (method === PathMethod.get) {
        doAxios = axios.get(path)
      } else if (method === PathMethod.post) {
        doAxios = axios.post(path, data, options)
      } else if (method === PathMethod.put) {
        doAxios = axios.put(path, data, options)
      } else if (method === PathMethod.delete) {
        doAxios = axios.delete(path, options)
      }

      if (!doAxios) {
        return reject()
      }

      doAxios
        .then((response: AxiosDummyT) => {
          if (onSuccess) {
            onSuccess(response.data)
          }
          if (onFinish) {
            onFinish()
          }
          return resolve(response.data)
        })
        .catch((e: AxiosDummyT) => {
          if (onError) {
            onError()
          }
          if (onFinish) {
            onFinish()
          }

          // By default, show snackbar with error message
          if (!hideError) {
            dispatch(Actions.handleResponseError, e.response, RTX)
          }
          return reject(e.response)
        })
    })
  },

  [Actions.fetchAll]({ dispatch, commit, rootGetters }): void {
    const requests: string[] = [
      SettingsS.extFetch,
      AuthS.extFetchUserInfo,
      NotificationsS.extFetch,
      SpacesS.extFetch,
      ArticlesS.extFetchImprovements
    ]

    // fetch documents, templates and overview
    const dispatches = requests.map((req) => dispatch(req, null, RTX))

    commit(Mutations.updateLoading, true)

    // after all users have been handled, refresh history
    Promise.all(dispatches).then(() => {
      // layouts should be synced with widgets only after both are fetched
      const syncLayouts = SettingsS.extSyncLayouts
      dispatch(syncLayouts, null, RTX).then(() => {
        commit(Mutations.updateLoading, false)
      })

      // * Pull selected space from spaceStore (either private, or based on url)
      const spaces = rootGetters[SpacesS.extGetRecords]
      const findPrivate = (s: Spaces.Record) => s.isPrivate
      const spacePrivate = spaces.find(findPrivate)
      const spaceIdUrl = String(router.currentRoute.query.spaceId || '')
      const findById = finderById(spaceIdUrl)
      const spaceUrl = spaces.find(findById)

      // * Update store record
      const selected = spaceUrl || spacePrivate || spaces[0]
      if (selected) {
        dispatch(SpacesS.extSetSelected, selected)
      } else {
        // * Show error, user should have at least 1 space
        dispatch(Actions.showSnackbar, Msg.SpacesNotFound)
      }
    })
  },

  [Actions.fetchSpace]({ rootGetters, dispatch, commit }, spaceId): void {
    axios.interceptors.request.eject(axiosInjectSpace)
    axiosInjectSpace = axios.interceptors.request.use((config) => {
      config.params = config.params || {}
      config.params['spaceId'] = spaceId
      return config
    })

    const requests: string[] = [
      WidgetsS.extFetch,
      CasesS.extFetch,
      TemplatesS.extFetch,
      DocsS.extFetch,
      FormsS.extFetch,
      DocsS.extFetchChecklist,
      ArticlesS.extFetch,
      ArticlesS.extFetchTopics,
      AuthS.extFetchUserInfo,
      AuthS.extFetchUserInfo,
      CasesS.extFetchCaseTypes,
      SpacesS.extFetchSelectedSpaceManagers,
      ArticlesS.extFetchImprovements
    ]

    //* Fetch either UD or Connections
    const isUD = rootGetters[SpacesS.extIsUserDirectory]
    const fetchUsers = isUD ? UserDirectoryS.extFetch : ConnectionsS.extFetch
    requests.push(fetchUsers)

    // * Fetch documents, templates and overview
    const dispatches = requests.map((req) => dispatch(req, null, RTX))

    commit(Mutations.updateLoading, true)

    // * After all users have been handled, refresh history
    Promise.all(dispatches).then(() => {
      // * Layouts should be synced with widgets only after both are fetched
      const syncLayouts = SettingsS.extSyncLayouts
      dispatch(syncLayouts, null, RTX).then(() => {
        commit(Mutations.updateLoading, false)
      })
    })
  },

  // initiate app, login flow
  [Actions.initApp]({ dispatch, rootGetters }): void {
    console.log('init app -> :')
    // const isNoauth = rootGetters[AuthS.extIsNoauth]
    // if (isNoauth) return

    const authToken = rootGetters[AuthS.extGetToken]

    const signin = {
      isFacebook: router.currentRoute.name === Routes.facebookSignin.name,
      isMicrosoft: router.currentRoute.name === Routes.signin.name
    }

    const isSigninPage = signin.isFacebook || signin.isMicrosoft

    const isAuthRequired = router.currentRoute.meta?.auth
    if (authToken) {
      dispatch(AuthS.extCheckToken, null, RTX)
    } else if (isAuthRequired || isSigninPage) {
      // * If page requires auth, and user is no token is set - login
      const code = router.currentRoute.query.code as string

      // * Primary provider is facebook - if not set, check if microsoft
      const prov = AuthProviders
      let signInAuthority = signin.isFacebook ? prov.facebook : prov.diginex
      if (signin.isMicrosoft) {
        signInAuthority = prov.microsoft
      }

      const loginPayload = { code, signInAuthority }

      dispatch(AuthS.extLogin, loginPayload, RTX)
    }
  },

  [Actions.handleResponseError]({ dispatch, rootGetters }, error): void {
    const statusCode = (error && (error.status as number)) || 0
    let msg = error && error.data.message
    msg = msg ? msg : REQUEST_ERRORS_MSG[statusCode]
    msg = msg ? msg : NETWORK_ERROR

    const snack = {
      icon: 'error',
      text: msg
    }

    // show snackbar
    dispatch(Actions.showSnackbar, snack)

    // if bad token - reset store
    if (statusCode === 401) {
      const isLogged = rootGetters[AuthS.extIsLogged]
      if (isLogged) {
        setTimeout(() => {
          dispatch(AuthS.extReset)
          dispatch(AuthS.extLogin)
        }, 5000)
      }
      return
    }
  }
}

const store = new Vuex.Store<Types.VuexStore>({
  modules: {
    auth,
    docs,
    templates,
    settings,
    cases,
    userDirectory,
    connections,
    widgets,
    forms,
    actions: actionsStore,
    notifications,
    spaces,
    documenttypes,
    articles
  },
  state: ROOT_STATE,
  getters,
  mutations,
  actions,
  plugins: [vuexLocal.plugin]
})

// TODO: disable in production
//* Dev helper for printing called actions w payload
store.subscribeAction((action: any, state: any) => {
  // TODO: move to config
  const isEnabled = false //? Dev
  const highlightTarged = ActionsS.extSelectedSet //? Dev

  if (!isEnabled) return
  let textColor = '#ff9999'

  if (highlightTarged === action.type) {
    textColor = '#99ff99'
  }

  // const textCss = `font-size: 25px;background: #222; color: ${textColor}`
  const textCss = `font-size: 20px;background: #111c42; color: ${textColor}; padding: 2px;  border:3px solid #818cff; border-radius:5px;`
  console.log(`%c ${action.type} `, textCss)
  if (action.payload) {
    console.log(action.type + ' payload: ', action.payload)
  }
})

//======================================================
export default store
