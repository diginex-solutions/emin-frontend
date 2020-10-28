<script lang="ts">
import { Getter as G } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getShortName } from '../utils/helpers'
import _ from 'lodash'
import { AuthS } from '@/types/'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Document = Docs.Record

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({ components: {} })
export default class TheDocInfo extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.getUser) getUser: Auth.User

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Object) doc: Document

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get owner() {
    return this.doc.owner ? this.doc.owner : this.getUser
  }

  get attachments() {
    const file1 = {
      uri: this.doc.uri,
      name: this.doc.name,
      extension: this.doc.extension
    }

    if (!file1.uri) {
      return []
    }

    return [file1]
  }

  // List users involved in transaction space
  get users() {
    const actions = this.doc.actions || []
    const actionUsers = actions.map((a: Forms.Record) => a.recipient)

    return _.uniqBy(actionUsers, 'email')
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  getFullName(user: Forms.Recipient) {
    if (!user) {
      return ''
    }

    return user.name + ' ' + user.surname
  }

  getShortName(user: Forms.Recipient) {
    if (!user) {
      return ''
    }
    return getShortName(user)
  }
}
</script>

<template>
  <!-- Main document -->
  <div class="doc-info">
    <div>
      <!-- Attachment info -->
      <v-list>
        <v-list-item
          v-for="(attachment, i) in attachments"
          no-action
          sub-group
          :key="i"
        >
          <v-list-item-avatar>
            <v-icon class="gray">mdi-file</v-icon>
          </v-list-item-avatar>

          <v-list-item-title>
            <a :href="attachment.uri">{{ attachment | formatDocName }}</a>
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <!-- Owner information -->
      <v-divider></v-divider>

      <v-list-item>
        <v-list-item-content>
          <b>{{ $text.Owner }}</b>
        </v-list-item-content>
      </v-list-item>

      <v-list-item two-line>
        <v-list-item-avatar class="accent white--text" left>
          {{ getShortName(owner) }}
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ getFullName(owner) }}</v-list-item-title>
          <v-list-item-subtitle>{{ owner.email }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <!-- Users that have access to document -->
      <v-list-item>
        <v-list-item-content>
          <div class="text-center d-flex align-center">
            <b>{{ $text.Users }}</b>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon color="#dddddd" v-on="on" size="20">help</v-icon>
              </template>
              <span>{{ $text.DocInfoUsersHelp }}</span>
            </v-tooltip>
          </div>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-for="user in users" :key="user.email" two-line>
        <v-list-item-avatar class="accent white--text" left>
          {{ getShortName(user) }}
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ getFullName(user) }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.doc-info {
}
</style>
