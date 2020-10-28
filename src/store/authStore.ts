import { i18n } from '@/plugins/i18n'
import r, { routesApi, Routes } from '@/router'
import { DocsS, RootA } from '@/types/'
import {
  Actions as actionsT,
  AuthProviders,
  Getters as gettersT,
  Mutations as mutationsT
} from '@/types/authD'
import stx from '@/types/stx'
import { config } from '@/utils/config'
import axios from 'axios'
import jwtDecode from 'jwt-decode'
import moment from 'moment'
import { Module } from 'vuex'
import { sendReq, RTX } from '@/utils/helpers'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

const router: typeof r = r

// TODO: look into extracting router.push wrappers outside into helper file - solve import problem
// Wrapper on router, to catch errors
const gotoRoute = async (route: Types.Route) => {
  console.log('GOTOROUITEEFWOTF -> route:', route)
  try {
    const emptyFunc = () => {
      console.log('Suppress navguard bug > :')
    }
    await router.push(route, emptyFunc)
  } catch (err) {
    throw new Error(`Problem handling router.push: ${err}.`)
  }
}

const redirectUserToLogin = (isDiginexSignin = false) => {
  const query = router.currentRoute.query // * Shorthand helper
  const redirect = window.location.pathname + window.location.search
  let urlRedirect = '/?auth&redirect=' + encodeURIComponent(redirect)

  // * Save current page and user details for further redirect and auth flow
  if (query.email) {
    // ** Query fields which will be processed
    const userFields = ['email', 'name', 'surname', 'lang', 'isRegistered']
    // ** Reducer - pull user data from url queries, add to a string
    const reduceQueryParams = (acc: string, field: string) =>
      `${acc}&${field}=${query[field]}`
    // ** Add parsed user info to url redirect path
    urlRedirect += userFields.reduce(reduceQueryParams, '')
  }

  // * Check if user is trying to sign in using token
  const token = query.token
  if (token) {
    urlRedirect += '&token=' + token
  }

  //? Exception: No redirect to MS, if provider is diginex, or if token is set
  if (isDiginexSignin || token) return gotoRoute(urlRedirect)

  window.location.href = config.azure.authUrl
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

export const authStore: Module<Auth.State, RootStore.State> = {
  namespaced: true,
  state: {
    isLogged: false,
    user: null,
    token: '',
    isWelcomeScreen: true,
    lang: 'en'
  },
  getters: {
    [gettersT.isLogged](state): boolean {
      return !!state.user && state.isLogged
    },

    [gettersT.getUser](state): Auth.User | null {
      return state.user ? { ...state.user } : null
    },

    // * Fetch language of the interface - if user is present - return theirs
    [gettersT.getLang](state): Auth.Language {
      if (state.user && state.user.lang) {
        return state.user.lang
      } else if (state.lang) {
        return state.lang
      }
      return i18n.locale as Auth.Language
    },

    [gettersT.getToken](state): string {
      return state.token
    },

    [gettersT.isWelcomeScreen](state): boolean {
      return state.isWelcomeScreen
    },

    [gettersT.isNoauth](): boolean {
      return router.currentRoute.meta?.noauth
    },

    [gettersT.isManager](state): boolean {
      const user = state.user ? { ...state.user } : null
      return (user && user.positionType === 'manager') || false
    }
  },
  mutations: {
    [mutationsT.setUser](state, user: Auth.User) {
      state.user = user
    },
    [mutationsT.updateToken](state, token = '') {
      state.token = token
    },
    [mutationsT.updateIsLogged](state, isLogged = false) {
      state.isLogged = isLogged
    },
    [mutationsT.hideWelcomeScreen](state) {
      state.isWelcomeScreen = false
    },
    [mutationsT.setLang](state, lang: Auth.Lang = 'en') {
      state.lang = lang
    }
  },

  actions: {
    // Request to login current user, if success - update store, apply token
    async [actionsT.login]({ dispatch, commit }, data: Auth.LoginP) {
      //? Exception: no `code` - redirect user to login page (pull token/user details from query)
      if (!data.code) {
        redirectUserToLogin(data.signInAuthority === AuthProviders.diginex)
        return Promise.resolve()
      }

      //* Send request and handle error/response
      const url = routesApi.user.login()
      dispatch(RootA.updateLoading, true, RTX) // Enable loading spinner
      const [err, res] = await sendReq(dispatch, { url, data }) // Send request and wait for err/res
      dispatch(RootA.updateLoading, false, RTX) // Disable spinner
      // TODO: potential error due to stale "code" value - repeat network signin
      if (err) return Promise.reject(err) //? Exn - error, reject
      dispatch(actionsT.saveUserData, res) // Save user data to store
      return Promise.resolve(res)
    },

    // * Logic similar to action `login` (which is for initial app load and handles networks)
    async [actionsT.signin]({ dispatch }, data: Auth.SigninP) {
      const url = routesApi.user.signin()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      dispatch(actionsT.saveUserData, res)
      return Promise.resolve(res)
    },

    [actionsT.saveUserData]({ commit, dispatch }, p: Auth.SigninResponse) {
      commit(mutationsT.setUser, p.user)
      commit(mutationsT.updateToken, p.token)
      if (p.user) {
        dispatch(actionsT.setLang, p.user.lang).then(() => {
          //* Setting language on login requires full reload of the app (i18n is init in main)
          // Timeout is to wait for redirects before reload
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
      return dispatch(actionsT.checkToken)
    },

    // Verify cached token, if bad - go to MS login, else - init app
    [actionsT.checkToken]({ state, commit, dispatch }) {
      const token = state.token

      //* If bad token - clear cache and redirect to MS login
      let isExpired = true
      if (token) {
        isExpired = Date.now() > jwtDecode<{ exp: number }>(token).exp * 1000
      }
      if (!token || isExpired) {
        commit(mutationsT.setUser)
        commit(mutationsT.updateToken)
        commit(mutationsT.updateIsLogged)
        gotoRoute('/')
        return Promise.reject()
      }

      //* Token is set, prepare app
      axios.defaults.headers.common = { Authorization: 'Bearer ' + token } // Add token to axios headers
      commit(mutationsT.updateIsLogged, true) // User is logged flag set to true
      i18n.locale = state.lang // Apply localization
      dispatch(RootA.fetchAll, null, RTX) // Initialize state (fetch data)

      //* Redirect is required if: 1. Address is set in url; 2. Current page which is only for unauthed
      const redirectUrl = router.currentRoute.query.redirect as string
      const isPageDisallowed = router.currentRoute.meta?.disallowAuthed
      if (redirectUrl) {
        gotoRoute(redirectUrl)
      } else if (isPageDisallowed) {
        gotoRoute({ name: Routes.spaces.name })
      }

      return Promise.resolve()
    },

    //* Clear state and redirect to login page
    [actionsT.logout]({ commit, dispatch }, noRedirect = false) {
      commit(mutationsT.updateToken)
      commit(mutationsT.setUser)
      commit(mutationsT.updateIsLogged)
      dispatch(RootA.resetAll, null, RTX)

      if (!noRedirect) {
        gotoRoute('/')
      }
      return Promise.resolve()
    },

    // Reset isLogged
    [actionsT.updateIsLogged]({ commit }) {
      commit(mutationsT.updateIsLogged)
      return Promise.resolve()
    },

    // Reset module state
    [actionsT.reset]({ commit }) {
      commit(mutationsT.updateToken)
      commit(mutationsT.setUser)
      commit(mutationsT.updateIsLogged)
      return Promise.resolve()
    },

    // Hides welcome screen
    [actionsT.hideWelcomeScreen]({ commit }) {
      commit(mutationsT.hideWelcomeScreen)
      return Promise.resolve()
    },

    // Update account details, and local data state
    async [actionsT.updateUser]({ commit, dispatch }, data) {
      const url = routesApi.user.update()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.setUser, res)
      return Promise.resolve(res)
    },

    // Get updated account details
    async [actionsT.fetchUserInfo]({ commit, dispatch }) {
      const url = routesApi.user.info()
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.setUser, res)
      return Promise.resolve(res)
    },

    // Set language
    [actionsT.setLang]({ commit, dispatch }, langRaw: Auth.Lang) {
      // cast code to lowercase, since i18n and moment are using lowercase code
      const lang = (langRaw && langRaw.toLowerCase()) || stx.lang.default
      dispatch(RootA.doPageLoader, null, RTX)
      commit(mutationsT.setLang, lang)
      i18n.locale = lang
      moment.locale(lang)
      dispatch(DocsS.extResetRecords, null, RTX) // TODO: delete?
      return Promise.resolve()
    },

    async [actionsT.register]({ dispatch }, data: Auth.NewUser) {
      const url = routesApi.user.register()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      dispatch(actionsT.saveUserData, res)
      return Promise.resolve(res)
    },

    async [actionsT.forgotPassword]({ dispatch }, data: Auth.ForgotPasswordP) {
      const url = routesApi.user.forgotPassword()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    async [actionsT.resetPassword]({ dispatch }, data: Auth.ResetPasswordP) {
      const token = router.currentRoute.query.token as string
      const url = routesApi.user.resetPassword(token)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    async [actionsT.changePassword](
      { commit, dispatch },
      data: Auth.ChangePasswordP
    ) {
      const url = routesApi.user.changePassword()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.setUser, res)
      return Promise.resolve(res)
    },

    async [actionsT.isEmailRegistered]({ dispatch }, email: string) {
      const url = routesApi.user.isRegistered(email)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    async [actionsT.loginV8]({ dispatch }, jwt: string) {
      const url = routesApi.user.loginV8()
      const data = { jwt }
      const [err, res] = await sendReq(dispatch, { url, data })
      console.log(' -> err, res:', err, res)
      if (err) return Promise.reject(err) //? Exn
      dispatch(actionsT.saveUserData, res)
      return Promise.resolve(res)
    }
  }
}
