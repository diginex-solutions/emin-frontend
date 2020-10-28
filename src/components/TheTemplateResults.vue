<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Getter as G } from 'vuex-class'
import _ from 'lodash'
import TemplateResults from './TemplateResults.vue'
import { Routes } from '../router'
import { finderById, sortItems } from '../utils/helpers'
import { AuthS, DocsS, FormsS } from '@/types/'

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

@Component({ components: { TemplateResults } })
export default class TheTemplateResults extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getLang) getLang: Auth.Language
  @G(...FormsS.records) formsAll: Forms.Record[]
  @G(...DocsS.records) docsAll: Docs.Record[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Object) template: Templates.Record
  @Prop(Array) docs: Docs.Record[]

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  headers: Types.Header[] = [
    {
      text: 'Document Name',
      align: 'left',
      value: 'name'
    },
    { text: 'Users', value: 'users' }
  ]
  selectedDocs: Docs.Record[] = []

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get actions() {
    const filterByTemplate = (form: Forms.Record) =>
      form.template?.id === this.template.id

    return this.formsAll.filter(filterByTemplate)
  }

  get templateDocs() {
    const templateId = this.template && this.template.id
    const findActionByTemplate = (a: Forms.Record) =>
      a.isInitiator && a.template && a.template.id === templateId
    const filterDocsByTemplate = (d: Docs.Record) =>
      d.actions && d.actions.find(findActionByTemplate)

    return this.docs.filter(filterDocsByTemplate)
  }

  get mapTemplateDocUsers() {
    const templateId = this.template && this.template.id

    // * Get all template forms for the doc, pull users 0 - unique by email
    const mapUsers = (doc: Docs.Record) => {
      const filterByTemplate = (a: Forms.Record) =>
        a.isInitiator && a.template && a.template.id === templateId
      const allActions = doc.actions || []
      const actions = allActions.filter(filterByTemplate)

      const actionUsers = actions.map((a: Forms.Record) => a.recipient)
      const users = _.uniqBy(actionUsers, 'email')

      return {
        id: doc.id,
        users: _.flatten(users)
      }
    }

    const mappedDocActions = this.templateDocs.map(mapUsers)

    const result: any = _.mapKeys(mappedDocActions, (obj) => obj.id)

    // Flatten value from {id, actions} to ...actions, and transform each action
    return _.mapValues(result, (obj) => obj.users)
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('templateDocs', { immediate: true })
  onTemplateDocs() {
    this.initData()
  }

  @Watch('selectedDocs')
  onSelectedDocsUpdate() {
    // * Update route's documents query, if not equal to local docs list
    const docsList = this.$route.query.documents as string

    // Get docs id's
    const docsRouterIds = docsList ? docsList.split(',') : []
    const docsLocalIds = this.selectedDocs.map((d: Docs.Record) => d.id)

    // Sorted, for comparison purpose
    const docsRouter = _.sortBy(docsRouterIds)
    const docsLocal = _.sortBy(docsLocalIds)

    // Compare and update router query
    if (!_.isEqual(docsRouter, docsLocal)) {
      this.$router.push({
        query: { documents: docsLocal.join(',') }
      })
    }
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  initData() {
    // Deep-linking selected documents list
    const docsList = this.$route.query.documents as string
    const docs = docsList ? docsList.split(',') : []

    docs.forEach((docId: string) => {
      const findById = finderById(docId)
      const doc = this.templateDocs.find(findById)

      if (doc) {
        this.onSelectDoc(doc)
      }
    })
  }

  getDocPath(documentId: string, templateId: string) {
    return {
      name: Routes.doc.children.docTemplates.name,
      params: { documentId },
      query: { templateId }
    }
  }

  countTemplateDocUsers(id: string) {
    return Object.keys(this.mapTemplateDocUsers[id] || {}).length
  }

  // On selecting doc - toggle selection
  onSelectDoc(doc: Docs.Record) {
    const findById = finderById(doc.id)
    const alreadySelected = this.selectedDocs.findIndex(findById)

    if (alreadySelected === -1) {
      this.selectedDocs.push(doc)
    } else {
      this.selectedDocs.splice(alreadySelected, 1)
    }

    this.selectedDocs = [...this.selectedDocs] // Refresh
  }

  sortDocs(items: Docs.Record[], index: string[], isDesc: boolean[]) {
    const defaultField = 'name'
    const sorters = {
      name: (doc: Docs.Record) => doc.name,
      users: (doc: Docs.Record) => this.countTemplateDocUsers(doc.id)
    }
    return sortItems({ items, index, isDesc, defaultField, sorters })
  }
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀
</script>

<template>
  <div class="space-templates">
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <TemplateResults
            :template="template"
            :actions="actions"
            :lang="getLang"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
