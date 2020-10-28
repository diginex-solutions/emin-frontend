import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'auth'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  isLogged: get + 'isLogged',
  isWelcomeScreen: get + 'isWelcomeScreen',
  getUser: get + 'getUser',
  getToken: get + 'getToken',
  isNoauth: get + 'isNoauth',
  getLang: get + 'getLang',
  isManager: get + 'isManager'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  updateToken: mut + 'updateToken',
  setUser: mut + 'setUser',
  updateIsLogged: mut + 'updateIsLogged',
  hideWelcomeScreen: mut + 'hideWelcomeScreen',
  updateUser: mut + 'updateUser',
  setLang: mut + 'setLang'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  login: act + 'login',
  handleLoginResponse: act + 'handleLoginResponse',
  checkToken: act + 'checkToken',
  logout: act + 'logout',
  reset: act + 'reset',
  updateIsLogged: act + 'updateIsLogged',
  hideWelcomeScreen: act + 'hideWelcomeScreen',
  updateUser: act + 'updateUser',
  setLang: act + 'setLang',
  register: act + 'register',
  signin: act + 'signin',
  forgotPassword: act + 'forgotPassword',
  resetPassword: act + 'resetPassword',
  isEmailRegistered: act + 'isEmailRegistered',
  fetchUserInfo: act + 'fetchUserInfo',
  changePassword: act + 'changePassword',
  saveUserData: act + 'saveUserData',
  loginV8: act + 'loginV8'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

/*
 ? Decorators help with SFC integration. Needed only for Getters and Actions

 ? To avoid name collision, prefix getters with `get` or `is`.
 ? Avoid using `is` or `get` at action - replace `get` with `fetch` to get data.
 ? Ideally, use prefix like `act`, but to cumbersome - stuff for further considerationd.

 ? Also, this syntax could be used withing vuex to reference external actions/getters.
 ? Example:
 ? const hideWelcome = AuthA.namespace + '/' + AuthA.doSomething // Before (store)
 ? const hideWelcome = AuthS.extDoSomething // After (store)
 ? extDoSomething: namespace + '/' + Actions.doSomething // After (line at AuthS)

*/

const Decorators: {
  getUser: TypeGetter
  isLogged: TypeGetter
  isWelcomeScreen: TypeGetter
  getToken: TypeGetter
  isNoauth: TypeGetter
  getLang: TypeGetter
  isManager: TypeGetter

  updateUser: TypeGetter
  forgotPassword: TypeGetter
  changePassword: TypeGetter
  resetPassword: TypeGetter
  setLang: TypeGetter
  register: TypeGetter
  signin: TypeGetter
  logout: TypeGetter
  hideWelcomeScreen: TypeGetter
  isEmailRegistered: TypeGetter
  saveUserData: TypeGetter
  loginV8: TypeGetter

  extUpdateIsLogged: string
  extHideWelcome: string

  extLogin: string
  extReset: string
  extCheckToken: string
  extIsLogged: string
  extGetToken: string
  extIsNoauth: string
  extGetUser: string
  extFetchUserInfo: string
  extGetLang: string
} = {
  // Getters
  getUser: [Getters.getUser, scope],
  isLogged: [Getters.isLogged, scope],
  isWelcomeScreen: [Getters.isWelcomeScreen, scope],
  getToken: [Getters.getToken, scope],
  isNoauth: [Getters.isNoauth, scope],
  getLang: [Getters.getLang, scope],
  isManager: [Getters.isManager, scope],

  // Actions
  hideWelcomeScreen: [Actions.hideWelcomeScreen, scope],
  updateUser: [Actions.updateUser, scope],
  forgotPassword: [Actions.forgotPassword, scope],
  resetPassword: [Actions.resetPassword, scope],
  changePassword: [Actions.changePassword, scope],
  setLang: [Actions.setLang, scope],
  register: [Actions.register, scope],
  signin: [Actions.signin, scope],
  logout: [Actions.logout, scope],
  isEmailRegistered: [Actions.isEmailRegistered, scope],
  saveUserData: [Actions.saveUserData, scope],
  loginV8: [Actions.loginV8, scope],

  // Module helpers
  extUpdateIsLogged: namespace + '/' + Actions.updateIsLogged,
  extHideWelcome: namespace + '/' + Actions.hideWelcomeScreen,

  extLogin: namespace + '/' + Actions.login,
  extReset: namespace + '/' + Actions.reset,
  extCheckToken: namespace + '/' + Actions.checkToken,
  extIsLogged: namespace + '/' + Getters.isLogged,
  extGetToken: namespace + '/' + Getters.getToken,
  extIsNoauth: namespace + '/' + Getters.isNoauth,
  extGetUser: namespace + '/' + Getters.getUser,
  extFetchUserInfo: namespace + '/' + Actions.fetchUserInfo,
  extGetLang: namespace + '/' + Getters.getLang
}

// * Enums and Helpers

// ! Synced (*D <-> *.d)
export enum AuthProviders {
  facebook = 'facebook',
  microsoft = 'microsoft',
  diginex = 'diginex'
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

export { Getters, Actions, Mutations, Decorators }
