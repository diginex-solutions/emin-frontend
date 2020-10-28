import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'cases' // ! Important to set correctly
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  records: get + 'records',
  getSelected: get + 'getSelected',
  getCaseTypes: get + 'getCaseTypes'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  create: mut + 'create',
  delete: mut + 'delete',
  update: mut + 'update',
  selectedSet: mut + 'selectedSet',
  feedAdd: mut + 'feedAdd',
  commentUpdate: mut + 'commentUpdate',
  commentDelete: mut + 'commentDelete',
  usersAdd: mut + 'usersAdd',
  setCaseTypes: mut + 'setCaseTypes',
  addCaseType: mut + 'addCaseType',
  deleteCaseType: mut + 'deleteCaseType'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  set: act + 'set',
  create: act + 'create',
  reset: act + 'reset',
  delete: act + 'delete',
  update: act + 'update',
  fetch: act + 'fetch',
  setSelected: act + 'setSelected',
  commentCreate: act + 'commentCreate',
  commentUpdate: act + 'commentUpdate',
  commentDelete: act + 'commentDelete',
  selectedSet: act + 'selectedSet',
  caseCreate: act + 'caseCreate',
  usersAdd: act + 'usersAdd',
  close: act + 'close',
  statusUpdate: act + 'statusUpdate',
  feedAdd: act + 'feedAdd',
  fetchCaseTypes: act + 'fetchCaseTypes',
  fileUploads: namespace + 'fileUploads',
  removeAssigned: namespace + 'removeAssigned',
  createCaseTypes: namespace + 'createCaseTypes',
  deleteCaseType: namespace + 'deleteCaseType'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  records: TypeGetter
  create: TypeGetter
  update: TypeGetter
  delete: TypeGetter
  commentCreate: TypeGetter
  commentUpdate: TypeGetter
  commentDelete: TypeGetter
  selectedSet: TypeGetter
  usersAdd: TypeGetter
  close: TypeGetter
  statusUpdate: TypeGetter
  feedAdd: TypeGetter
  getCaseTypes: TypeGetter
  fileUploads: TypeGetter
  removeAssigned: TypeGetter
  createCaseTypes: TypeGetter
  deleteCaseType: TypeGetter

  // External
  extFetch: string
  extFetchCaseTypes: string
} = {
  records: [Getters.records, scope],
  create: [Actions.create, scope],
  update: [Actions.update, scope],
  delete: [Actions.delete, scope],

  commentCreate: [Actions.commentCreate, scope],
  commentUpdate: [Actions.commentUpdate, scope],
  commentDelete: [Actions.commentDelete, scope],
  selectedSet: [Actions.selectedSet, scope],
  usersAdd: [Actions.usersAdd, scope],
  close: [Actions.close, scope],
  statusUpdate: [Actions.statusUpdate, scope],
  feedAdd: [Actions.feedAdd, scope],
  getCaseTypes: [Getters.getCaseTypes, scope],
  fileUploads: [Actions.fileUploads, scope],
  removeAssigned: [Actions.removeAssigned, scope],
  createCaseTypes: [Actions.createCaseTypes, scope],
  deleteCaseType: [Actions.deleteCaseType, scope],

  // Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch,
  extFetchCaseTypes: namespace + '/' + Actions.fetchCaseTypes
}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Mutations, Actions, Decorators }

export enum CaseIssueType {
  Grievance = 'grievance',
  Others = 'others'
}

export enum ContactSource {
  userDirectory = 'userDirectory',
  connection = 'connection',
  manager = 'manager'
}

export type StatusType = 'new' | 'inProgress' | 'closed'
