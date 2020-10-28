<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import Dialog from '@/mixins/Dialog.ts'
import { Getter as G, Action as A } from 'vuex-class'
import { SpacesS, ConnectionsS, CasesS, UserDirectoryS } from '../types'
import ContactsSelect from '@/components/ContactsSelect.vue'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

interface VueRef extends Element {
  $el: HTMLElement
}

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ components: { ContactsSelect }, mixins: [Dialog] })
export default class CaseUsersDialog extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  // @G(...SpacesS.getSelected) space: Spaces.Record
  @G(...UserDirectoryS.records) userDirectoryRecords: UserDirectory.Record[]
  @G(...ConnectionsS.records) connectionsRecords: UserDirectory.Record[]
  @A(...CasesS.usersAdd) vuexUsersAdd: Cases.usersAddA
  @G(...SpacesS.isUserDirectory) isUserDirectory: boolean

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Array) caseUsers: Cases.User[] // * Current case users
  @Prop() owner: Cases.User

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  users: Cases.User[] = []
  isLoading = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get contacts() {
    return this.isUserDirectory
      ? this.userDirectoryRecords
      : this.connectionsRecords.filter((c) => c.isRegistered)
  }

  // Filter out current users belonging to the case
  get allowedContacts(): UserDirectory.Record[] {
    const caseUsers = this.caseUsers.map((r) => r.email)
    const usersAndOwner = this.owner?.email
      ? [...caseUsers, this.owner?.email]
      : caseUsers
    return this.contacts.filter((c) => !usersAndOwner.includes(c.email))
  }

  get isUsersEqual() {
    return this.users.length === 0
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    setTimeout(() => {
      const confirmBtn = this.$refs.confirmBtn as VueRef
      confirmBtn?.$el?.focus()
    }, 100)
  }

  onSave() {
    this.isLoading = true

    this.vuexUsersAdd(this.users)
      .then(() => {
        this.isOpen = false
        this.$showSnack(this.$msg.caseUserAdded)
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card>
      <!-- *** Title and message of the confirmation -->
      <v-card-title>
        <span class="headline">{{ $text.CaseUsersTitle }}</span>
      </v-card-title>
      <v-card-text>
        <ContactsSelect
          :selected.sync="users"
          :contacts="allowedContacts"
          :noDataText="'No users'"
        />
      </v-card-text>

      <!-- *** Action buttons -->
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="isLoading" color="secondary" @click="isOpen = false">
          {{ $text.Cancel }}
        </v-btn>
        <v-btn
          :loading="isLoading"
          :disabled="isLoading || isUsersEqual"
          ref="confirmBtn"
          color="accent"
          @click="onSave"
        >
          <span>{{ $text.Send }}</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.headline {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
