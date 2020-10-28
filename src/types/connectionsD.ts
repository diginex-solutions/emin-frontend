import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'connections'
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
  reset: act + 'reset',
  fetch: act + 'fetch',
  create: act + 'create',
  delete: act + 'delete'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  create: TypeGetter
  delete: TypeGetter
  fetch: TypeGetter

  // External
  extFetch: string
} = {
  records: [Getters.records, scope],
  create: [Actions.create, scope],
  delete: [Actions.delete, scope],
  fetch: [Actions.fetch, scope],

  // * Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch
}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Mutations, Actions, Decorators }
