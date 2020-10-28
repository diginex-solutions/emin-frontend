<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { getShortName } from '../utils/helpers'
import { AuthS, SpacesS, ConnectionsS, CasesS, UserDirectoryS } from '@/types/'
import CaseUsersDialog from '@/components/CaseUsersDialog.vue'
import CaseInfoDialog from '@/components/CaseInfoDialog.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import { StatusType } from '../types/casesD'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: { CaseUsersDialog, ConfirmationDialog, CaseInfoDialog }
})
export default class TheCaseSidebar extends Vue {
  @G(...AuthS.getUser) getUser: Auth.User
  @A(...CasesS.statusUpdate) vuexStatusUpdate: Cases.StatusUpdateA
  @G(...AuthS.isManager) isManager: boolean
  @G(...SpacesS.isUserDirectory) isUserDirectory: boolean
  @G(...UserDirectoryS.records) userDirectoryRecords: UserDirectory.Record[]
  @G(...ConnectionsS.records) connectionsRecords: UserDirectory.Record[]

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Object) theCase: Cases.Record

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isUsersDialog = false
  isInfoDialog = false
  isCloseDialog = false
  isReopenDialog = false
  isLoading = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get owner() {
    return this.theCase.owner ? this.theCase.owner : this.getUser
  }

  get contacts() {
    return this.isUserDirectory
      ? this.userDirectoryRecords
      : this.connectionsRecords
  }

  // List users involved in case (minus the owner)
  get users() {
    const users = this.theCase?.users || []
    const ownerEmail = this.owner?.email || ''
    const filterNonOwner = (u: Cases.User) => u.email !== ownerEmail
    return users.filter(filterNonOwner)
  }

  get isOwner() {
    return this.theCase.owner.email === this.getUser?.email
  }

  get isOpen() {
    return this.theCase.status !== 'closed'
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getFullName(user: Cases.User, isFromContacts = false) {
    if (!user) {
      return ''
    }

    const getMember = (
      member: Cases.User | UserDirectory.Record | undefined
    ) => {
      const { name = '', surname = '', isRegistered = false } = member || {}
      return isRegistered
        ? `${name} ${surname}`
        : `(${this.$text.PendingRegistration})`
    }

    // If no need to pull from contacts - return formatted name
    if (!isFromContacts) {
      return getMember(user)
    }

    // Pull contact, since user in might be in authed user's contacts list
    const findByEmail = (c: UserDirectory.Record) => c.email === user.email
    const contact = this.contacts.find(findByEmail)
    if (!contact) {
      return '?'
    }

    // Return formatted name
    return getMember(contact)
  }

  getFormattedShortName(user: Cases.User, isFromContacts = false) {
    if (!user) {
      return ''
    }

    // If no need to pull from contacts - return formatted name
    if (!isFromContacts) {
      return getShortName(user)
    }

    // Pull contact, since user in might be in authed user's contacts list
    const findByEmail = (c: UserDirectory.Record) => c.email === user.email
    const contact = this.contacts.find(findByEmail)
    if (!contact) {
      return '??'
    }

    // Return formatted string
    return getShortName(contact)
  }

  onAddUser() {
    this.isUsersDialog = true
  }

  onStatusUpdate(status: StatusType) {
    this.isLoading = true

    this.vuexStatusUpdate(status)
      .then(() => {
        this.isLoading = false
        this.isCloseDialog = false
        this.isReopenDialog = false
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  onOpenInfo() {
    this.isInfoDialog = true
  }

  onClose() {
    this.onStatusUpdate('closed')
  }

  onReopen() {
    this.onStatusUpdate('inProgress')
  }
}
</script>

<template>
  <v-navigation-drawer
    v-if="theCase"
    permanent
    right
    app
    clipped
    class="the-case-sidebar"
  >
    <template v-slot:prepend>
      <v-divider />

      <!-- Owner information -->

      <v-list-item>
        <v-list-item-content>
          <b>{{ $text.Owner }}</b>
        </v-list-item-content>
      </v-list-item>

      <v-list-item two-line>
        <v-list-item-avatar class="accent white--text" left>
          {{ getFormattedShortName(owner) }}
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ getFullName(owner) }}</v-list-item-title>
          <v-list-item-subtitle>{{ owner.email }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <!-- Users that have access to case -->
      <v-list-item>
        <v-list-item-content>
          <div class="text-center d-flex align-center">
            <b>{{ $text.Users }}</b>
          </div>
        </v-list-item-content>
      </v-list-item>

      <div v-if="!users || users.length == 0" class="users-not-found">
        <span>{{ $text.CaseNoUsers }}</span>
      </div>
      <v-list-item v-for="user in users" :key="user.email" two-line>
        <v-list-item-avatar class="accent white--text" left>
          {{ getFormattedShortName(user, true) }}
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ getFullName(user) }}</v-list-item-title>
          <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <!-- Users Add Button -->
      <v-list-item v-if="isOpen && isManager" class="mt-5 mb-2">
        <v-list-item-content>
          <v-btn outlined @click="onAddUser">{{ $text.AddUser }}</v-btn>
        </v-list-item-content>
      </v-list-item>

      <!-- Button and dialog for losing/opening the case -->
      <v-divider v-if="isOwner || isManager"></v-divider>
      <v-list-item class="mt-2" v-if="isManager">
        <v-list-item-content v-if="isOpen">
          <v-btn
            outlined
            color="accent"
            @click="isCloseDialog = true"
            :disabled="theCase.status !== 'inProgress'"
          >
            {{ $text.CloseCase }}
          </v-btn>

          <!-- Confirm: closing case -->
          <ConfirmationDialog
            v-if="isCloseDialog"
            v-model="isCloseDialog"
            :title="$text.CaseCloseTitle"
            :body="$text.CaseCloseBody"
            :action="onClose"
            :submitButtonText="$text.Close"
            :isLoading="isLoading"
          />
        </v-list-item-content>
        <v-list-item-content v-else>
          <v-btn outlined @click="isReopenDialog = true">
            {{ $text.CaseOpen }}
          </v-btn>

          <!-- Confirm: reopening case-->
          <ConfirmationDialog
            v-if="isReopenDialog"
            v-model="isReopenDialog"
            :title="$text.CaseReopenTitle"
            :body="$text.CaseReopenBody"
            :action="onReopen"
            :submitButtonText="$text.Open"
            :isLoading="isLoading"
          />
        </v-list-item-content>
      </v-list-item>
      <CaseUsersDialog
        v-if="isUsersDialog"
        v-model="isUsersDialog"
        :owner="theCase.owner"
        :caseUsers="theCase.users"
      />
      <CaseInfoDialog
        v-if="isInfoDialog"
        v-model="isInfoDialog"
        :theCase="theCase"
      />
    </template>
  </v-navigation-drawer>
</template>
<style lang="scss" scoped>
.the-case-sidebar {
  .users-not-found {
    display: flex;
    justify-content: center;
  }
}
</style>
