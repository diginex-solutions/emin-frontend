import r, { routesApi } from '@/router'
import { AuthS, SpacesS } from '@/types/'
import {
  Actions as actionsT,
  Getters as gettersT,
  Mutations as mutationsT
} from '@/types/articlesD'
import { config } from '@/utils/config'
import { finderById, sendReq } from '@/utils/helpers'
import _ from 'lodash'
import Vue from 'vue'
import { Module } from 'vuex'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Constructor

type Record = Articles.Record
type ModuleState = Articles.State
type CreateTopicP = Articles.CreateTopicP
const TopicAllId = config.TopicAllId
const router: typeof r = r

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

export const articlesStore: Module<ModuleState, RootStore.State> = {
  namespaced: true,
  state: {
    records: [],
    topicId: TopicAllId,
    selectedId: null,
    topics: [],
    improvements: [],
    isFetchingArticles: false,
    showArticlesEditSidebar: false
  },
  getters: {
    //* Return new array of records
    [gettersT.getRecords](state): Record[] {
      return [...state.records]
    },

    [gettersT.getSelected](state): Record | null {
      if (!state.selectedId) return null //* Exn
      const findById = finderById(state.selectedId)
      return state.records.find(findById) || null
    },

    //* Return new array of records, filtered by topic
    [gettersT.getRecordsByTopic](state, g, rs, rootGetters): Record[] {
      const isSpaceAdmin = rootGetters[SpacesS.extIsSpaceAdmin]
      const isAdminGlobal = rootGetters[SpacesS.extIsAdminGlobal]
      const getUser = rootGetters[AuthS.extGetUser]

      const filterPublished = (r: Record) => {
        const isUserOwner = r.userId === getUser.id
        const userHasAccess = isUserOwner || isSpaceAdmin || isAdminGlobal
        return userHasAccess || r.isPublished
      }
      const published = state.records.filter(filterPublished)

      const sortByView = (r: Record) => r && r.views || 0
      //* Exn: return all published
      if (!state.topicId || state.topicId === '-1') { 
        return _.orderBy(published, sortByView, 'desc').slice(0, 5)
      }
      const filterByTopic = (a: Record) => a.topicId === state.topicId
      return _.sortBy(published.filter(filterByTopic), sortByView, 'desc')
    },

    //* Get all categories in the system
    [gettersT.getTopics](state): Articles.Topic[] {
      return [...state.topics]
    },

    //* Get selected topic, null if not set
    [gettersT.getTopic](state): Articles.Topic | null {
      if (!state.topicId) return null
      const findById = finderById(state.topicId)
      return state.topics.find(findById) || null
    },

    //* Get all improvements
    //* Improvements are needed both for admin and reg users
    [gettersT.getImprovements](state): Articles.Improvement[] {
      return state.improvements
    },

    [gettersT.isFetchingArticles](state): boolean {
      return state.isFetchingArticles
    },

    [gettersT.getArticlesEditSidebar](state): boolean {
      return state.showArticlesEditSidebar
    }
  },
  mutations: {
    // * Process records before storing to local state - handle folder structure
    [mutationsT.set](state, payload = []) {
      state.records = payload
    },

    [mutationsT.setTopic](state, topicId = null) {
      state.topicId = topicId
    },

    [mutationsT.setTopics](state, records = []) {
      state.topics = [...records]
    },

    [mutationsT.create](state, record: Record) {
      state.records = [...state.records, record]
    },

    // * Updates record - accepts the record that needs to be updated, `id` field is required
    [mutationsT.update](state, record) {
      const findById = finderById(record.id)
      const index = state.records.findIndex(findById)
      if (index === -1) return //* Exn: no record

      Vue.set(state.records, index, record)
    },

    // Delete record by given id from the store
    [mutationsT.delete](state, { id }: Record) {
      const findById = (p: Record) => p.id === id
      const index = state.records.findIndex(findById)
      if (index === -1) return //* Exn: no record

      state.records.splice(index, 1)
    },

    [mutationsT.createTopic](state, topic: Articles.Topic) {
      state.topics = [...state.topics, topic]
    },

    [mutationsT.updateTopic](state, record) {
      const findById = finderById(record.id)
      const index = state.topics.findIndex(findById)
      if (index === -1) return //* Exn: no record

      Vue.set(state.topics, index, record)
    },

    // Delete topic by given id from the store
    [mutationsT.deleteTopic](state, { id }: Articles.Topic) {
      const findById = finderById(id)
      const index = state.topics.findIndex(findById)
      if (index === -1) return //* Exn: no record

      state.topics.splice(index, 1) //* Reactive
    },

    [mutationsT.setImprovements](state, records = []) {
      state.improvements = records
    },

    [mutationsT.updateImprovement](state, record) {
      const findById = finderById(record.id)
      const index = state.improvements.findIndex(findById)
      if (index === -1) return //* Exn: no record

      Vue.set(state.improvements, index, record)
    },

    // Delete record by given id from improvements list
    [mutationsT.deleteImprovement](state, { id }: Record) {
      const findById = finderById(id)
      const index = state.improvements.findIndex(findById)
      if (index === -1) return //* Exn: no record

      state.improvements.splice(index, 1)
      state.improvements = [...state.improvements]
    },

    //* Used to show spinner at ArticlesIndex page
    [mutationsT.setIsFetchingArticles](state, val = false) {
      state.isFetchingArticles = val
    },

    // show/hide ArticlesEdit sidebar
    [mutationsT.setShowArticlesEditSidebar](state, val = false) {
      state.showArticlesEditSidebar = val
    }
  },
  actions: {
    // * Fetch all topic
    async [actionsT.fetchTopics]({ commit, dispatch }) {
      const url = routesApi.articles.topics()
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.setTopics, res)
      return Promise.resolve(res)
    },

    // * Fetch all articles
    async [actionsT.fetch]({ commit, dispatch }) {
      //* Compose url
      const query = router.currentRoute.query.q as string
      const url = routesApi.articles.index(query || '')

      //* Dispatch to backend, show spinners
      commit(mutationsT.setIsFetchingArticles, true)
      const [err, res] = await sendReq(dispatch, { url })
      commit(mutationsT.setIsFetchingArticles, false)

      if (err) return Promise.reject(err) //? Exn: if error, reject

      commit(mutationsT.set, res)
      return Promise.resolve(res) //* Success: resolve with articles
    },

    async [actionsT.create](
      { commit, rootGetters, dispatch },
      { text, title, summary, topicId, isPublished }: Articles.RecordNew
    ) {
      const getUser = rootGetters[AuthS.extGetUser]

      const data = {
        title,
        text,
        summary,
        topicId,
        isPublished,
        userId: getUser.id,
        user: getUser,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Clear topic field, if not set
      if (!topicId || topicId === '-1') {
        delete data.topicId
      }

      const url = routesApi.articles.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn: if error, reject
      commit(mutationsT.create, res)
      return Promise.resolve(res)
    },

    async [actionsT.save](
      { dispatch, commit, state },
      article: Articles.RecordNew
    ) {
      const findById = finderById(article?.id || '')
      const articleExisting = state.records.find(findById)

      //? Exn: if article doesn't exist - redirect to create
      if (!articleExisting) return dispatch(actionsT.create, article)

      //* Clone existing and populate with updated fields
      const data = {
        ...articleExisting,
        title: article.title,
        text: article.text,
        summary: article.summary,
        topicId: article.topicId,
        isPublished: article.isPublished,
        updatedAt: new Date()
      }

      // Clear topic field, if not set
      if (!article.topicId || article.topicId === '-1') {
        delete data.topicId
      }

      const url = routesApi.articles.update(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn: if error, reject
      commit(mutationsT.update, res)
      return Promise.resolve(res)
    },

    [actionsT.setTopic]({ commit }, { id }: Articles.Topic) {
      commit(mutationsT.setTopic, id)
      return Promise.resolve()
    },

    [actionsT.publish]({ dispatch }, record: Articles.Record) {
      record.isPublished = true
      return dispatch(actionsT.save, record)
    },

    [actionsT.unpublish]({ dispatch }, record: Articles.Record) {
      record.isPublished = false
      return dispatch(actionsT.save, record)
    },

    //* Create topic
    async [actionsT.createTopic](
      { commit, state, dispatch },
      data: CreateTopicP
    ) {
      const url = routesApi.topics.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.setTopics, [...state.topics, res])
      return Promise.resolve(res)
    },

    //* Update given topic
    async [actionsT.updateTopic]({ commit, dispatch }, data: Articles.Topic) {
      const url = routesApi.topics.update(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.updateTopic, res)
      return Promise.resolve(res)
    },

    //* Delete given topic
    async [actionsT.deleteTopic]({ commit, dispatch }, topic: Articles.Topic) {
      const url = routesApi.topics.delete(topic.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.deleteTopic, topic)
      return Promise.resolve(res)
    },

    //* Req to delete given article
    async [actionsT.delete]({ commit, dispatch }, record: Record) {
      const url = routesApi.articles.delete(record.id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.delete, record)
      return Promise.resolve(res)
    },

    //* Fetch article by id
    async [actionsT.fetchArticle]({ commit, dispatch }, articleId: string) {
      const url = routesApi.articles.fetch(articleId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.update , res)
      return Promise.resolve(res)
    },

    //* Fetch feedback for articleId
    async [actionsT.fetchFeedback]({ dispatch }, articleId: string) {
      const url = routesApi.articles.fetchFeedback(articleId)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    //* Create new feedback
    async [actionsT.createFeedback]({ dispatch }, data: Articles.FeedbackNew) {
      const url = routesApi.articles.createFeedback(data.articleId || '')
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    //* Dispatch to increment view count of the article
    async [actionsT.countView]({ dispatch }, { id }: Articles.Record) {
      const url = routesApi.articles.countView(id)
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      return Promise.resolve(res)
    },

    // * Fetch all improvements
    async [actionsT.fetchImprovements]({ commit, dispatch }) {
      const url = routesApi.improvements.fetch()
      const [err, res] = await sendReq(dispatch, { url })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.setImprovements, res)
      return Promise.resolve(res)
    },

    async [actionsT.createImprovement](
      { state, commit, dispatch },
      data: Articles.CreateImprovementP
    ) {
      const url = routesApi.improvements.create()
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.setImprovements, [...state.improvements, res])
      return Promise.resolve(res)
    },

    async [actionsT.updateImprovement](
      { commit, dispatch },
      data: Articles.Improvement
    ) {
      const url = routesApi.improvements.update(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.updateImprovement, res)
      return Promise.resolve(res)
    },

    async [actionsT.deleteImprovement](
      { commit, dispatch },
      data: Articles.Improvement
    ) {
      const url = routesApi.improvements.delete(data.id)
      const [err, res] = await sendReq(dispatch, { url, data })
      if (err) return Promise.reject(err) //? Exn
      commit(mutationsT.deleteImprovement, data)
      return Promise.resolve(res)
    },

    async [actionsT.showArticlesEditSidebar]({ commit }, data: boolean) {
      commit(mutationsT.setShowArticlesEditSidebar, data)
      return Promise.resolve()
    }
  }
}
