import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'spaces'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  namespace,
  scope,
  records: get + 'records',
  getSelected: get + 'getSelected',
  getPersonal: get + 'getPersonal',
  isSpaceAdmin: get + 'isSpaceAdmin',
  isUserDirectory: get + 'isUserDirectory',
  isAdminGlobal: get + 'isAdminGlobal',
  getManagers: get + 'getManagers',
  getRegisteredUsers: get + 'getRegisteredUsers',
  getCaseManagers: get + 'getCaseManagers',
  isManager: get + 'isManager'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  namespace,
  set: mut + 'set',
  create: mut + 'create',
  update: mut + 'update',
  setSelected: mut + 'setSelected',
  delete: mut + 'delete',
  deleteManager: mut + 'deleteManager',
  addManager: mut + 'addManager',
  setManager: mut + 'setManager',
  setRegisteredUsers: mut + 'setRegisteredUsers',
  setCaseManager: mut + 'setCaseManager'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  namespace,
  scope,
  fetch: act + 'fetch',
  reset: act + 'reset',
  setSelected: act + 'setSelected',
  create: act + 'create',
  update: act + 'update',
  leave: act + 'leave',
  updateSettingsAdmin: act + 'updateSettingsAdmin',
  fetchSpacesAdmin: act + 'fetchSpacesAdmin',
  fetchSpace: act + 'fetchSpace',
  updatePersonalSpace: act + 'updatePersonalSpace',
  fetchManagers: act + 'fetchManagers',
  fetchSelectedSpaceManagers: act + 'fetchSelectedSpaceManagers',
  fetchRegisteredUsers: act + 'fetchRegisteredUsers',
  deleteManager: act + 'deleteManager',
  addManager: act + 'addManager'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  getSelected: TypeGetter
  setSelected: TypeGetter
  create: TypeGetter
  update: TypeGetter
  leave: TypeGetter
  updateSettingsAdmin: TypeGetter
  isSpaceAdmin: TypeGetter
  isAdminGlobal: TypeGetter
  isUserDirectory: TypeGetter
  fetchSpacesAdmin: TypeGetter
  fetchSpace: TypeGetter
  updatePersonalSpace: TypeGetter
  getManagers: TypeGetter
  getRegisteredUsers: TypeGetter
  fetchManagers: TypeGetter
  fetchRegisteredUsers: TypeGetter
  deleteManager: TypeGetter
  addManager: TypeGetter
  getCaseManagers: TypeGetter
  isManager: TypeGetter

  // External
  extFetch: string
  extGetSelected: string
  extGetRecords: string
  extSetSelected: string
  extIsUserDirectory: string
  extIsSpaceAdmin: string
  extIsAdminGlobal: string
  extFetchSelectedSpaceManagers: string
} = {
  records: [Getters.records, scope],
  getSelected: [Getters.getSelected, scope],
  isSpaceAdmin: [Getters.isSpaceAdmin, scope],
  isUserDirectory: [Getters.isUserDirectory, scope],
  isAdminGlobal: [Getters.isAdminGlobal, scope],
  setSelected: [Actions.setSelected, scope],
  create: [Actions.create, scope],
  update: [Actions.update, scope],
  leave: [Actions.leave, scope],
  updateSettingsAdmin: [Actions.updateSettingsAdmin, scope],
  fetchSpacesAdmin: [Actions.fetchSpacesAdmin, scope],
  fetchSpace: [Actions.fetchSpace, scope],
  updatePersonalSpace: [Actions.updatePersonalSpace, scope],
  getManagers: [Getters.getManagers, scope],
  getRegisteredUsers: [Getters.getRegisteredUsers, scope],
  fetchManagers: [Actions.fetchManagers, scope],
  fetchRegisteredUsers: [Actions.fetchRegisteredUsers, scope],
  deleteManager: [Actions.deleteManager, scope],
  addManager: [Actions.addManager, scope],
  getCaseManagers: [Getters.getCaseManagers, scope],
  isManager: [Getters.isManager, scope],

  // Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch,
  extGetSelected: namespace + '/' + Getters.getSelected,
  extGetRecords: namespace + '/' + Getters.records,
  extSetSelected: namespace + '/' + Actions.setSelected,
  extIsUserDirectory: namespace + '/' + Getters.isUserDirectory,
  extIsSpaceAdmin: namespace + '/' + Getters.isSpaceAdmin,
  extIsAdminGlobal: namespace + '/' + Getters.isAdminGlobal,
  extFetchSelectedSpaceManagers:
    namespace + '/' + Actions.fetchSelectedSpaceManagers
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

// Synced
export enum SpaceRoles {
  admin = 'admin',
  employee = 'employee',
  manager = 'manager'
}

export { Getters, Actions, Mutations, Decorators }
