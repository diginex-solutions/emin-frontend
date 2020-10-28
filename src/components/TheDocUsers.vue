<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _ from 'lodash'
import { Getter as G } from 'vuex-class'
import { AuthS } from '@/types/'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

type Template = Templates.Record
type Action = Forms.Record
interface User {
  email: string
  name: string
  surname: string
  actions: Forms.Record[]
}

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

const getEmptyTemplate = {
  id: '',
  name: 'Empty Template',
  inputs: [],
  languages: []
}

@Component({ components: {} })
export default class TheDocUsers extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getUser) getUser: Auth.User

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Object) doc: Docs.Record

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  headers = [
    {
      text: this.$text.Name,
      align: 'left',
      value: 'name'
    },
    { text: this.$text.Forms, value: 'forms' }
  ]
  headersTemplates = [
    {
      text: this.$text.Name,
      align: 'left',
      value: 'name'
    },
    { text: this.$text.Forms, value: 'forms' }
  ]

  headersForms = [
    {
      text: this.$text.Date,
      align: 'left',
      value: 'dateCreated'
    },
    { text: this.$text.Status, value: 'status' },
    { text: 'Date filled', value: 'dateFilled' }
  ]

  selectedUser: User[] = [] // Highlighted user
  selectedTemplate: Templates.Record[] = [] // Highlighted template

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get actions() {
    return this.doc.actions || []
  }

  // List users involved in transaction space
  get users() {
    const actionUsers = this.actions.map((a: Forms.Record) => a.recipient)
    const users = _.uniqBy(actionUsers, 'email')

    // Attach actions, related to this user
    return users.map((u: { email: string }) => {
      const filterByEmail = (a: Forms.Record) => a.recipient.email === u.email
      return {
        ...u,
        actions: this.actions.filter(filterByEmail)
      }
    })
  }

  //  Fetch templates used by selected user
  // ! Populating of Empty templates should be moved to store,
  // ! To place where actions array is being populated in the first place
  get selectedUserTemplates() {
    // Get and verify selected user
    const user = this.selectedUser[0]
    if (!user) {
      return []
    }

    // Get all templates for each user's action
    const userActionTemplates = user.actions.map((a: Forms.Record) => {
      return a.template && a.template.id ? a.template : getEmptyTemplate
    })

    // Only unique templates
    return _.uniqBy(userActionTemplates, 'id')
  }

  get selectedTemplateForms() {
    // Get and verify selected template
    const template = this.selectedTemplate[0]
    if (!template) {
      return []
    }

    return this.getTemplateForms(template)
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('selectedUser')
  resetSelectedTemplate() {
    this.selectedTemplate = []
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  getTemplateForms(template: Templates.Record) {
    // Get and verify selected user
    const user = this.selectedUser[0]
    if (!user) {
      return []
    }

    const filterActionsByTemplate = (a: Forms.Record) => {
      const isEmpty = !template.id && !a.template
      return isEmpty || (a.template && a.template.id === template.id)
    }

    return user.actions.filter(filterActionsByTemplate)
  }

  getFullName(user: User) {
    if (!user) {
      return ''
    }

    return user.name + ' ' + user.surname
  }

  viewAction(action: Forms.Record) {
    this.$emit('viewAction', action)
  }

  onSelectUser(user: User) {
    this.selectedUser = [user]
  }

  onSelectTemplate(template: Templates.Record) {
    this.selectedTemplate = [template]
  }

  sortUsers(items: User[], index: string[], isDesc: boolean[]) {
    // Allowed fields
    const Fields = {
      name: 'name',
      forms: 'forms'
    }

    // Sorting rules
    const sorters: any = {
      [Fields.name]: (t: User) => this.getFullName(t),
      [Fields.forms]: (t: User) => t.actions.length
    }

    // Process vuetify inputs, set default field and order
    const field = index[0] ? index[0] : Fields.name
    const order = isDesc[0] ? 'desc' : 'asc'

    // Define primary and secondary sorting rules
    const primarySorter = sorters[field]
    const secondarySorter = sorters.name

    // Return sorted result
    return _.orderBy(items, [primarySorter, secondarySorter], order)
  }

  sortTemplates(items: Template[], index: string[], isDesc: boolean[]) {
    // Allowed fields
    const Fields = {
      name: 'name',
      forms: 'forms'
    }

    // Sorting rules
    const sorters: any = {
      [Fields.name]: (t: Template) => t.name,
      [Fields.forms]: (t: Template) => this.getTemplateForms(t)
    }

    // Process vuetify inputs, set default field and order
    const field = index[0] ? index[0] : Fields.name
    const order = isDesc[0] ? 'desc' : 'asc'

    // Define primary and secondary sorting rules
    const primarySorter = sorters[field]
    const secondarySorter = sorters.name

    // Return sorted result
    return _.orderBy(items, [primarySorter, secondarySorter], order)
  }

  sortActions(items: Action[], index: string[], isDesc: boolean[]) {
    // helpers
    const formatDate =
      this.$options.filters && this.$options.filters.formatDateSimple
    if (!formatDate) {
      return items
    }

    // Allowed fields
    const Fields = {
      dateCreated: 'dateCreated',
      dateFilled: 'dateFilled',
      status: 'status'
    }

    // Sorting rules
    const sorters: any = {
      [Fields.dateCreated]: (i: Action) => formatDate(i.dateCreated),
      [Fields.dateFilled]: (i: Action) => formatDate(i.dateFilled),
      [Fields.status]: (i: Action) => i.status
    }

    // Process vuetify inputs, set default field and order
    const field = index[0] ? index[0] : Fields.dateCreated
    const order = isDesc[0] ? 'desc' : 'asc'

    // Define primary and secondary sorting rules
    const primarySorter = sorters[field]
    const secondarySorter = sorters.name

    // Return sorted result
    return _.orderBy(items, [primarySorter, secondarySorter], order)
  }
}
</script>

<template>
  <div class="space-users">
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0 ml-5 mr-5>
          <!-- 🦅 Users list -->
          <v-data-table
            :headers="headers"
            :items="users"
            item-key="email"
            color="accent"
            v-model="selectedUser"
            single-select
            show-select
            @click:row="onSelectUser"
            :custom-sort="sortUsers"
          >
            <template v-slot:item.name="{ item }">
              <span v-if="item.email === getUser.email">
                <b>{{ $text.Me }}</b>
              </span>
              <span v-else>{{ getFullName(item) }}</span>
            </template>
            <template v-slot:item.forms="{ item }">
              {{ item.actions.length }}
            </template>
          </v-data-table>

          <!-- 🦅 Selected user's templates list -->
          <v-data-table
            v-if="selectedUser && selectedUser.length > 0"
            :headers="headersTemplates"
            :items="selectedUserTemplates"
            item-key="id"
            color="accent"
            v-model="selectedTemplate"
            single-select
            show-select
            @click:row="onSelectTemplate"
            :custom-sort="sortTemplates"
          >
            <!-- Show number of forms available to given user+template -->
            <template v-slot:item.name="{ item }">{{ item.name }}</template>
            <template v-slot:item.forms="{ item }">
              {{ getTemplateForms(item).length }}
            </template>
          </v-data-table>

          <!-- 🦅 Actions/Forms List-->
          <v-data-table
            v-if="selectedUser.length > 0 && selectedTemplate.length > 0"
            :headers="headersForms"
            :items="selectedTemplateForms"
            item-key="id"
            color="accent"
            @click:row="viewAction"
            :custom-sort="sortActions"
          >
            <!-- Show number of forms available to given user+template -->
            <template v-slot:item.dateCreated="{ item }">
              <a class="action-link">
                {{ item.dateCreated | formatDateSimple }}
              </a>
            </template>
            <template v-slot:item.dateFilled="{ item }">
              {{ item.dateFilled | formatDateSimple }}
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss">
.space-users {
  .action-link {
    text-decoration: underline;
    font-weight: bold;
  }
}
</style>
