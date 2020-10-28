<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Getter as G } from 'vuex-class'
import _ from 'lodash'
import TemplateResults from './TemplateResults.vue'
import { Routes } from '../router'
import { finderById } from '../utils/helpers'
import { AuthS } from '../types/'

const getEmptyTemplate = {
  id: '',
  name: 'Empty Template',
  inputs: [],
  languages: []
}

// * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀

@Component({ components: { TemplateResults } })
export default class TheDocTemplates extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getLang) getLang: Auth.Language

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Object) doc: Docs.Record

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  headersTemplates = [
    {
      text: this.$text.TemplateName,
      align: 'left',
      value: 'name'
    },
    { text: this.$text.Users, value: 'users' },
    { text: this.$text.Forms, value: 'forms' },
    { text: this.$text.Questions, value: 'questions' }
  ]
  selectedTemplate: Templates.Record[] = [] // Highlighted template

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get actions() {
    if (!this.doc.actions) {
      return []
    }

    // Attach document to each action
    return this.doc.actions.map((a: Forms.Record) => {
      return {
        ...a,
        document: this.doc
      }
    })
  }

  get allTemplates() {
    const actionTemplates = this.actions.map((a: Forms.Record) => {
      return a.template ? a.template : getEmptyTemplate
    })

    return _.uniqBy(actionTemplates, 'id')
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('selectedTemplate')
  onSelectedUpdate(templates: Templates.Record[]) {
    const templateNewId = templates[0] ? templates[0].id : ''

    // Update route's templateId query
    const templateId = this.$route.query.templateId as string
    if (templateId !== templateNewId) {
      this.$router.push({
        query: { templateId: templateNewId }
      })
    }
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    const templateId = this.$route.query.templateId as string
    const findById = finderById(templateId)
    const template = this.allTemplates.find(findById)
    if (template) {
      this.onSelectTemplate(template)
    }
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  getTemplateForms(template: Templates.Record) {
    const filterActionsByTemplate = (a: Forms.Record) => {
      const isEmpty = !template.id && !a.template
      return isEmpty || (a.template && a.template.id === template.id)
    }

    return this.actions.filter(filterActionsByTemplate)
  }

  // List users involved in template
  templateUsers(template: Templates.Record) {
    const templateForms = this.getTemplateForms(template)
    const actionUsers = templateForms.map((a: Forms.Record) => a.recipient)
    const users = _.uniqBy(actionUsers, 'email')

    // Attach actions, related to this user
    return users.map((u: { email: string }) => {
      const filterByEmail = (a: Forms.Record) => a.recipient.email === u.email
      return {
        ...u,
        actions: templateForms.filter(filterByEmail)
      }
    })
  }

  onSelectTemplate(template: Templates.Record) {
    this.selectedTemplate = [template]
  }

  sortTemplate(items: Templates.Record[], index: string[], isDesc: boolean[]) {
    const payload = {
      order: isDesc[0] ? 'desc' : 'asc',
      field: index[0] ? index[0] : ''
    }

    const sorters: any = {
      name: (t: Templates.Record) => t.name,
      users: (t: Templates.Record) => this.templateUsers(t).length,
      forms: (t: Templates.Record) => this.getTemplateForms(t).length,
      questions: (t: Templates.Record) => t.inputs.length
    }
    const primarySorter = sorters[payload.field]
    const secondarySorter = sorters.name
    const order = payload.order === 'asc' ? 'asc' : 'desc'

    return _.orderBy(items, [primarySorter, secondarySorter], order)
  }

  getTemplatePath(templateId: string) {
    const documentId = this.doc.id

    return {
      name: Routes.template.children.results.name,
      params: { templateId },
      query: { documents: documentId }
    }
  }

  // * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀
}
</script>

<template>
  <div class="space-templates">
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <!-- 🦅 All templates list -->
          <v-data-table
            :headers="headersTemplates"
            :items="allTemplates"
            item-key="id"
            color="accent"
            v-model="selectedTemplate"
            single-select
            show-select
            @click:row="onSelectTemplate"
            :custom-sort="sortTemplate"
          >
            <!-- Show number of forms available to given user+template -->
            <template v-slot:item.name="{ item }">
              <router-link :to="getTemplatePath(item.id)">
                {{ item.name }}
              </router-link>
            </template>
            <template v-slot:item.users="{ item }">
              {{ templateUsers(item).length }}
            </template>
            <template v-slot:item.forms="{ item }">
              {{ getTemplateForms(item).length }}
            </template>
            <template v-slot:item.questions="{ item }">
              {{ item.inputs.length }}
            </template>
          </v-data-table>

          <TemplateResults
            :template="selectedTemplate[0]"
            :actions="actions"
            :lang="getLang"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
