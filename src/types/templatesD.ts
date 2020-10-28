import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'templates'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  records: get + 'records'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  create: mut + 'create',
  delete: mut + 'delete',
  update: mut + 'update'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  set: act + 'set',
  create: act + 'create',
  reset: act + 'reset',
  delete: act + 'delete',
  update: act + 'update',
  fetch: act + 'fetch'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  create: TypeGetter
  update: TypeGetter
  delete: TypeGetter

  // External
  extFetch: string
} = {
  records: [Getters.records, scope],
  create: [Actions.create, scope],
  update: [Actions.update, scope],
  delete: [Actions.delete, scope],

  // Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch
}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Mutations, Actions, Decorators }
