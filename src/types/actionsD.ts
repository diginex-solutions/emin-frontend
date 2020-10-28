import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'actions'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  records: get + 'records'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  selectedSet: mut + 'selectedSet',
  selectedAdd: mut + 'selectedAdd',
  selectedDelete: mut + 'selectedDelete',
  selectedRefresh: mut + 'selectedRefresh'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  reset: act + 'reset',
  selectedSet: act + 'selectedSet',
  selectedAdd: act + 'selectedAdd',
  selectedDelete: act + 'selectedDelete',
  selectedRefresh: act + 'selectedRefresh'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  selectedSet: TypeGetter
  selectedAdd: TypeGetter
  selectedDelete: TypeGetter

  extSelectedRefresh: string
  extRecords: string
  extSelectedSet: string
} = {
  records: [Getters.records, scope],
  selectedSet: [Actions.selectedSet, scope],
  selectedAdd: [Actions.selectedAdd, scope],
  selectedDelete: [Actions.selectedDelete, scope],

  // Helpers for referencing as external module
  extSelectedRefresh: namespace + '/' + Actions.selectedRefresh,
  extSelectedSet: namespace + '/' + Actions.selectedSet,
  extRecords: namespace + '/' + Getters.records
}

export { Getters, Mutations, Actions, Decorators }
