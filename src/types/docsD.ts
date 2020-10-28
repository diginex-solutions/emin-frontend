import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'docs'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  getSearchQuery: get + 'getSearchQuery',
  getDocumentHistory: get + 'getDocumentHistory',
  getSelectedRecord: get + 'getSelectedRecord',
  records: get + 'records',
  getHistory: get + 'getHistory',
  getCurrentPath: get + 'getCurrentPath',
  allActions: get + 'allActions',
  documentVersionHistory: get + 'documentVersionHistory',
  getDocumentsWithoutCategory: get + 'getDocumentsWithoutCategory',
  getChecklist: get + 'getChecklist'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  updateSearchPage: mut + 'updateSearchPage',
  updateSearchQuery: mut + 'updateSearchQuery',
  updatePath: mut + 'updatePath',
  addRecord: mut + 'addRecord',
  setOverview: mut + 'setOverview',
  setSelectedRecord: mut + 'setSelectedRecord',
  update: mut + 'update',
  setDocumentHistory: mut + 'setDocumentHistory',
  updateArchivedById: mut + 'updateArchivedById',
  sort: mut + 'sort',
  setSort: mut + 'setSort',
  setCurrentPath: mut + 'setCurrentPath',
  deleteFolder: mut + 'deleteFolder',
  moveDocs: mut + 'moveDocs',
  reset: mut + 'reset',
  documentVersionHistory: mut + 'documentVersionHistory',
  setChecklist: mut + 'setChecklist',
  singleSelectChecklist: mut + 'singleSelectChecklist',
  updateChecklist: mut + 'updateChecklist'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  fetch: act + 'fetch',
  updateSearchPage: act + 'updateSearchPage',
  updateSearchQuery: act + 'updateSearchQuery',
  downloadDocument: act + 'downloadDocument',
  addRecord: act + 'addRecord',
  fetchDocument: act + 'fetchDocument',
  reset: act + 'reset',
  update: act + 'update',
  fetchDocumentHistory: act + 'setDocumentHistory',
  archive: act + 'archive',
  download: act + 'download',
  sort: act + 'sort',
  setCurrentPath: act + 'setCurrentPath',
  createFolder: act + 'createFolder',
  deleteFolder: act + 'deleteFolder',
  moveDocs: act + 'moveDocs',
  renameFolder: act + 'renameFolder',
  createActionRequest: act + 'createActionRequest',
  updateActionRequest: act + 'updateActionRequest',
  resetRecords: act + 'resetRecords',
  setFolder: act + 'setFolder',
  rename: act + 'rename',
  create: act + 'create',
  fetchDocVersionHistory: act + 'fetchDocVersionHistory',
  uploadNewVersion: act + 'uploadNewVersion',
  fetchChecklist: act + 'fetchChecklist',
  singleSelectChecklist: act + 'singleSelectChecklist',
  updateChecklist: act + 'updateChecklist'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  getSearchQuery: TypeGetter
  getDocumentHistory: TypeGetter
  getSelectedRecord: TypeGetter
  records: TypeGetter
  getHistory: TypeGetter
  getCurrentPath: TypeGetter
  allActions: TypeGetter
  fetch: TypeGetter
  updateSearchPage: TypeGetter
  updateSearchQuery: TypeGetter
  downloadDocument: TypeGetter
  addRecord: TypeGetter
  fetchDocument: TypeGetter
  reset: TypeGetter
  update: TypeGetter
  fetchDocumentHistory: TypeGetter
  archive: TypeGetter
  download: TypeGetter
  sort: TypeGetter
  setCurrentPath: TypeGetter
  createFolder: TypeGetter
  deleteFolder: TypeGetter
  moveDocs: TypeGetter
  renameFolder: TypeGetter
  createActionRequest: TypeGetter
  updateActionRequest: TypeGetter
  resetRecords: TypeGetter
  setFolder: TypeGetter
  rename: TypeGetter
  create: TypeGetter
  fetchDocVersionHistory: TypeGetter
  uploadNewVersion: TypeGetter
  documentVersionHistory: TypeGetter
  getDocumentsWithoutCategory: TypeGetter
  getChecklist: TypeGetter
  fetchChecklist: TypeGetter
  singleSelectChecklist: TypeGetter
  updateChecklist: TypeGetter

  // External calls
  extSetCurrentPath: string
  extUpdateSearchPage: string
  extResetRecords: string
  extReset: string
  extFetch: string
  extFetchChecklist: string
} = {
  getSearchQuery: [Getters.getSearchQuery, scope],
  getDocumentHistory: [Getters.getDocumentHistory, scope],
  getSelectedRecord: [Getters.getSelectedRecord, scope],
  records: [Getters.records, scope],
  getHistory: [Getters.getHistory, scope],
  getCurrentPath: [Getters.getCurrentPath, scope],
  allActions: [Getters.allActions, scope],
  fetch: [Actions.fetch, scope],

  updateSearchPage: [Actions.updateSearchPage, scope],
  updateSearchQuery: [Actions.updateSearchQuery, scope],
  downloadDocument: [Actions.downloadDocument, scope],
  addRecord: [Actions.addRecord, scope],
  fetchDocument: [Actions.fetchDocument, scope],
  reset: [Actions.reset, scope],
  update: [Actions.update, scope],
  fetchDocumentHistory: [Actions.fetchDocumentHistory, scope],
  archive: [Actions.archive, scope],
  download: [Actions.download, scope],
  sort: [Actions.sort, scope],
  setCurrentPath: [Actions.setCurrentPath, scope],
  createFolder: [Actions.createFolder, scope],
  deleteFolder: [Actions.deleteFolder, scope],
  moveDocs: [Actions.moveDocs, scope],
  renameFolder: [Actions.renameFolder, scope],
  createActionRequest: [Actions.createActionRequest, scope],
  updateActionRequest: [Actions.updateActionRequest, scope],
  resetRecords: [Actions.resetRecords, scope],
  setFolder: [Actions.setFolder, scope],
  rename: [Actions.rename, scope],
  create: [Actions.create, scope],
  fetchDocVersionHistory: [Actions.fetchDocVersionHistory, scope],
  uploadNewVersion: [Actions.uploadNewVersion, scope],
  documentVersionHistory: [Getters.documentVersionHistory, scope],
  getDocumentsWithoutCategory: [Getters.getDocumentsWithoutCategory, scope],
  getChecklist: [Getters.getChecklist, scope],
  fetchChecklist: [Actions.fetchChecklist, scope],
  singleSelectChecklist: [Actions.singleSelectChecklist, scope],
  updateChecklist: [Actions.updateChecklist, scope],

  // Getter/action helper for external calls
  extUpdateSearchPage: namespace + '/' + Actions.updateSearchPage,
  extSetCurrentPath: namespace + '/' + Actions.setCurrentPath,
  extResetRecords: namespace + '/' + Actions.resetRecords,
  extReset: namespace + '/' + Actions.reset,
  extFetch: namespace + '/' + Actions.fetch,
  extFetchChecklist: `${namespace}/${Actions.fetchChecklist}`
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

export { Getters, Actions, Mutations, Decorators }
