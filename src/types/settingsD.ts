import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'settings'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

export const Getters = {
  records: get + 'records',
  isShowDashboard: get + 'isShowDashboard',
  layout: get + 'layout',
  getLayoutsSetting: get + 'getLayoutsSetting'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

export const Mutations = {
  set: mut + 'set',
  create: mut + 'create',
  delete: mut + 'delete',
  update: mut + 'update',
  setLayout: mut + 'setLayout',
  deleteLayout: mut + 'deleteLayout'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

export const Actions = {
  set: act + 'set',
  create: act + 'create',
  reset: act + 'reset',
  delete: act + 'delete',
  update: act + 'update',
  fetch: act + 'fetch',
  dashboardDisable: act + 'dashboardDisable',
  setLayout: act + 'setLayout',
  resetLayout: act + 'resetLayout',
  syncLayouts: act + 'syncLayouts'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

export const Decorators: {
  isShowDashboard: TypeGetter
  create: TypeGetter
  dashboardDisable: TypeGetter
  layout: TypeGetter
  setLayout: TypeGetter

  extFetch: string
  extSyncLayouts: string
} = {
  isShowDashboard: [Getters.isShowDashboard, scope],
  create: [Actions.create, scope],
  dashboardDisable: [Actions.dashboardDisable, scope],
  layout: [Getters.layout, scope],
  setLayout: [Actions.setLayout, scope],

  extFetch: namespace + '/' + Actions.fetch,
  extSyncLayouts: namespace + '/' + Actions.syncLayouts
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary
