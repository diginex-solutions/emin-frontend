import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'documenttypes'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  records: get + 'records'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  create: mut + 'create',
  delete: mut + 'delete'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  fetch: act + 'fetch',
  create: act + 'create',
  delete: act + 'delete'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  fetch: TypeGetter
  create: TypeGetter
  delete: TypeGetter
  extFetch: string
} = {
  records: [Getters.records, scope],
  fetch: [Actions.fetch, scope],
  create: [Actions.create, scope],
  delete: [Actions.delete, scope],

  // Getter/action helper for external calls
  extFetch: namespace + '/' + Actions.fetch
}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Mutations, Actions, Decorators }
