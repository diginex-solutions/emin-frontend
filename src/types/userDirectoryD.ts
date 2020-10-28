import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'userDirectory' //! Important to set correctly
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  records: get + 'records',
  updates: get + 'updates',
  updatedRecords: get + 'updatedRecords',
  pendingUpdates: get + 'pendingUpdates',
  getAdmins: get + 'getAdmins'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  updateUser: mut + 'updateUser',
  addUpdate: mut + 'addUpdate',
  updateRequestPending: mut + 'updateRequestPending',
  updateRequestSuccess: mut + 'updateRequestSuccess',
  updateRequestFailure: mut + 'updateRequestFailure',
  resetUpdates: mut + 'resetUpdates',
  delete: mut + 'delete'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  updateUser: act + 'updateUser',
  fetch: act + 'fetch',
  sendUpdate: act + 'sendUpdate',
  sendUpdates: act + 'sendUpdates',
  resetUpdates: act + 'resetUpdates',
  create: act + 'create',
  reinvite: act + 'reinvite',
  delete: act + 'delete'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  updatedRecords: TypeGetter
  updateUser: TypeGetter
  updates: TypeGetter
  pendingUpdates: TypeGetter
  sendUpdate: TypeGetter
  sendUpdates: TypeGetter
  resetUpdates: TypeGetter
  fetch: TypeGetter
  create: TypeGetter
  reinvite: TypeGetter
  getAdmins: TypeGetter
  delete: TypeGetter

  // External
  extFetch: string
} = {
  records: [Getters.records, scope],
  updatedRecords: [Getters.updatedRecords, scope],
  updateUser: [Actions.updateUser, scope],
  updates: [Getters.updates, scope],
  pendingUpdates: [Getters.pendingUpdates, scope],
  sendUpdate: [Actions.sendUpdate, scope],
  sendUpdates: [Actions.sendUpdates, scope],
  resetUpdates: [Actions.resetUpdates, scope],
  fetch: [Actions.fetch, scope],
  create: [Actions.create, scope],
  reinvite: [Actions.reinvite, scope],
  getAdmins: [Getters.getAdmins, scope],
  delete: [Actions.delete, scope],

  // Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch
}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Mutations, Actions, Decorators }

export enum UserTypes {
  normal = 'normal',
  superUser = 'superUser',
  diginexAdmin = 'diginexAdmin'
}

export enum Gender {
  male = 'male',
  female = 'female',
  other = 'other'
}

// Sync d.ts <-> D.ts
export enum PositionTypes {
  manager = 'manager',
  others = 'others'
}
