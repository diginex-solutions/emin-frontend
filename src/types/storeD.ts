import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'root'
const { get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  snackbarMessageGet: get + 'snackbarMessageGet',
  isPageLoading: get + 'isPageLoading',
  isLoading: get + 'isLoading'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  SNACKBAR_MESSAGE_SET: mut + 'SNACKBAR_MESSAGE_SET',
  LOADER_ACTIVE_SET: mut + 'LOADER_ACTIVE_SET',
  updateLoading: mut + 'updateLoading'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  showSnackbar: act + 'showSnackbar',
  doPageLoader: act + 'doPageLoader',
  resetAll: act + 'resetAll',
  initApp: act + 'initApp',
  fetchAll: act + 'fetchAll',
  handleResponseError: act + 'handleResponseError',
  updateLoading: act + 'updateLoading',
  myxios: act + 'myxios',
  fetchSpace: act + 'fetchSpace'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

enum ExternalFields {}

const Decorators: {
  [key in ExternalFields]: TypeGetter
} = {}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Actions, Mutations, Decorators }
