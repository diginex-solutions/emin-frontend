import { TypeGetter } from '@/types'
import { makeDecoratorHelpers } from '@/utils/helpers'

const namespace = 'articles'
const { scope, get, act, mut } = makeDecoratorHelpers(namespace)

//*===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙===🌙Getters

const Getters = {
  getRecords: get + 'getRecords',
  getTopic: get + 'getTopic',
  getTopics: get + 'getTopics',
  getRecordsByTopic: get + 'getRecordsByTopic',
  getSelected: get + 'getSelected',
  getImprovements: get + 'getImprovements',
  isFetchingArticles: get + 'isFetchingArticles',
  getArticlesEditSidebar: get + 'getArticlesEditSidebar'
}

//*===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧===🔧Mutations

const Mutations = {
  set: mut + 'set',
  create: mut + 'create',
  update: mut + 'update',
  delete: mut + 'delete',
  setTopic: mut + 'setTopic',
  setTopics: mut + 'setTopics',
  createTopic: mut + 'createTopic',
  updateTopic: mut + 'updateTopic',
  deleteTopic: mut + 'deleteTopic',
  createFeedback: mut + 'createFeedback',
  setImprovements: mut + 'setImprovements',
  updateImprovement: mut + 'updateImprovement',
  deleteImprovement: mut + 'deleteImprovement',
  setIsFetchingArticles: mut + 'setIsFetchingArticles',
  setShowArticlesEditSidebar: mut + 'setShowArticlesEditSidebar'
}

//*===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖===🤖Actions

const Actions = {
  fetch: act + 'fetch',
  setTopic: act + 'setTopic',
  publish: act + 'publish',
  unpublish: act + 'unpublish',
  delete: act + 'delete',
  create: act + 'create',
  save: act + 'save',
  fetchArticle: act + 'fetchArticle',
  fetchFeedback: act + 'fetchFeedback',
  createFeedback: act + 'createFeedback',
  countView: act + 'countView',
  deleteImprovement: act + 'deleteImprovement',
  fetchImprovements: act + 'fetchImprovements',
  createImprovement: act + 'createImprovement',
  updateImprovement: act + 'updateImprovement',
  fetchTopics: act + 'fetchTopics',
  createTopic: act + 'createTopic',
  updateTopic: act + 'updateTopic',
  deleteTopic: act + 'deleteTopic',
  showArticlesEditSidebar: act + 'showArticlesEditSidebar'
}

//*===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎===💎Decorators

const Decorators: {
  getRecords: TypeGetter
  fetch: TypeGetter
  setTopic: TypeGetter
  getTopics: TypeGetter
  getTopic: TypeGetter
  getRecordsByTopic: TypeGetter
  getSelected: TypeGetter
  create: TypeGetter
  publish: TypeGetter
  unpublish: TypeGetter
  delete: TypeGetter
  save: TypeGetter
  deleteTopic: TypeGetter
  fetchArticle: TypeGetter
  fetchFeedback: TypeGetter
  createFeedback: TypeGetter
  countView: TypeGetter
  getImprovements: TypeGetter
  deleteImprovement: TypeGetter
  updateImprovement: TypeGetter
  createImprovement: TypeGetter
  createTopic: TypeGetter
  updateTopic: TypeGetter
  isFetchingArticles: TypeGetter
  getArticlesEditSidebar: TypeGetter
  showArticlesEditSidebar: TypeGetter

  // External
  extFetch: string
  extFetchTopics: string
  extFetchImprovements: string
} = {
  getRecords: [Getters.getRecords, scope],
  getTopics: [Getters.getTopics, scope],
  getTopic: [Getters.getTopic, scope],
  getRecordsByTopic: [Getters.getRecordsByTopic, scope],
  fetch: [Actions.fetch, scope],
  setTopic: [Actions.setTopic, scope],
  create: [Actions.create, scope],
  getSelected: [Getters.getSelected, scope],
  publish: [Actions.publish, scope],
  unpublish: [Actions.unpublish, scope],
  save: [Actions.save, scope],
  delete: [Actions.delete, scope],
  deleteTopic: [Actions.deleteTopic, scope],
  fetchArticle: [Actions.fetchArticle, scope],
  fetchFeedback: [Actions.fetchFeedback, scope],
  createFeedback: [Actions.createFeedback, scope],
  countView: [Actions.countView, scope],
  getImprovements: [Getters.getImprovements, scope],
  updateImprovement: [Actions.updateImprovement, scope],
  createImprovement: [Actions.createImprovement, scope],
  deleteImprovement: [Actions.deleteImprovement, scope],
  createTopic: [Actions.createTopic, scope],
  updateTopic: [Actions.updateTopic, scope],
  isFetchingArticles: [Getters.isFetchingArticles, scope],
  getArticlesEditSidebar: [Getters.getArticlesEditSidebar, scope],
  showArticlesEditSidebar: [Actions.showArticlesEditSidebar, scope],

  // Helpers for referencing as external module
  extFetch: namespace + '/' + Actions.fetch,
  extFetchTopics: namespace + '/' + Actions.fetchTopics,
  extFetchImprovements: namespace + '/' + Actions.fetchImprovements
}

//*===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰===📰Exports

export { Getters, Actions, Mutations, Decorators }
