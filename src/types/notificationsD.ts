import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'notifications' // ! Important to set correctly
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  records: namespace + get + 'records'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  markRead: mut + 'markRead'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  set: act + 'set',
  reset: act + 'reset',
  fetch: act + 'fetch',
  markRead: act + 'markRead'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  markRead: TypeGetter

  // External
  extFetch: string
} = {
  records: [Getters.records, scope],
  markRead: [Actions.markRead, scope],

  // Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch
}

export { Getters, Mutations, Actions, Decorators }

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

//* Sync `Type` at `notifications.d.ts`
export enum NotificationTypes {
  verification = 'verification',
  shared = 'shared',
  form = 'form',
  versionUpdate = 'version',
  verificationFilled = 'verification_filled',
  formFilled = 'form_filled',
  spaceInvited = 'space_invited'
}
