import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'forms' // ! Important to set correctly
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  records: get + 'records'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  addRecords: mut + 'addRecord',
  update: mut + 'update'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  fetch: act + 'fetch',
  reset: act + 'reset',
  addRecords: act + 'addRecord',
  fetchHistory: act + 'fetchHistory',
  update: act + 'update'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  fetchHistory: TypeGetter

  // External
  extFetch: string
  extAddRecords: string
  extGetRecords: string
  extUpdate: string
} = {
  records: [Getters.records, scope],
  fetchHistory: [Actions.fetchHistory, scope],

  // Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch,
  extAddRecords: namespace + '/' + Actions.addRecords,
  extGetRecords: namespace + '/' + Getters.records,
  extUpdate: namespace + '/' + Actions.update
}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Mutations, Actions, Decorators }
