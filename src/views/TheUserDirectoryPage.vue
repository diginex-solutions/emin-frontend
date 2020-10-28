<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { AuthS, SpacesS, UserDirectoryS } from '@/types/'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import TheContactsEdit from '@/components/TheContactsEdit.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import { SpaceRoles } from '../types/spacesD'
import { finderById } from '../utils/helpers'
import { UserTypes } from '../types/userDirectoryD'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type Record = UserDirectory.Record
type Updates = UserDirectory.Updates
type Updating = UserDirectory.Updating

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({
  components: {
    ButtonsPanel,
    TheBreadcrumbs,
    TheContactsEdit,
    ConfirmationDialog
  }
})
export default class TheUserDirectory extends Vue {
  // VUEX === === === === === === === === === ===
  @G(...AuthS.getUser) getUser: Auth.User
  @G(...UserDirectoryS.records) records: Record[]
  @G(...UserDirectoryS.updatedRecords) updatedRecords: Record[]
  @G(...UserDirectoryS.updates) updates: Updates
  @G(...UserDirectoryS.pendingUpdates) pendingUpdates: Updating

  @A(...UserDirectoryS.updateUser) updateUser: UserDirectory.ActionUpdateUser
  @A(...UserDirectoryS.sendUpdate) sendUpdate: UserDirectory.ActionSendUpdate
  @A(...UserDirectoryS.sendUpdates) sendUpdates: UserDirectory.ActionSendUpdates
  @A(...UserDirectoryS.reinvite) vuexReinvite: UserDirectory.ReinviteA
  @A(...UserDirectoryS.resetUpdates)
  resetUpdates: UserDirectory.ActionResetUpdates
  @G(...UserDirectoryS.getAdmins) getAdmins: UserDirectory.Record[]
  @A(...UserDirectoryS.delete) vuexDelete: UserDirectory.DeleteA
  @G(...SpacesS.getSelected) getSpace: Spaces.Record
  @G(...AuthS.getUser) authedUser: Auth.User
  @A(...SpacesS.leave) vuexLeaveSpace: Spaces.LeaveA

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  search = ''
  updated = false
  isInviteDialog = false
  isReInviteDialog = false
  isLoading = false
  reinviteUserId = ''
  isDeleteDialog = false
  isLeaveDialog = false
  selected: UserDirectory.Record | null = null
  headers: Types.Header[] = [
    {
      text: this.$text.Name,
      align: 'left',
      value: 'name'
    },
    {
      text: this.$text.Surname,
      align: 'left',
      value: 'surname'
    },
    {
      text: this.$text.Email,
      value: 'email'
    },
    {
      text: this.$text.Status,
      value: 'isRegistered'
    },
    {
      text: this.$text.DateCreated,
      value: 'createdAt'
    },
    {
      text: this.$text.Role,
      value: 'role'
      // TODO: commenting width out, column is too wide
      // width: 220
    },
    {
      text: this.$text.Actions,
      value: 'actions',
      sortable: false,
      width: 180,
      align: 'center'
    }
  ]

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // * Is current user has admin role in current space
  get isAdmin() {
    const findById = finderById(this.getUser.id)
    return !!this.getAdmins.find(findById)
  }

  // * Is current user allowed to invite users
  get isAllowInvites() {
    const allowInviteAll = this.getSpace?.allowInviteAll
    return this.isAdmin || allowInviteAll
  }

  get getButtonsPanel() {
    // Define button constants
    const inviteBtn = {
      view: ['mdi-plus', this.$text.InviteUser],
      active: this.isAllowInvites,
      onClick: () => (this.isInviteDialog = true)
    }

    if (!this.isAllowedToModify) {
      return [inviteBtn]
    }

    return [
      inviteBtn,
      {
        view: ['mdi-clipboard-alert', this.$text.Reset],
        active: this.updated,
        onClick: () => this.resetUpdates()
      },
      {
        view: ['mdi-clipboard-alert', this.$text.UpdateAll],
        active: this.updated,
        onClick: () => this.sendUpdates()
      }
    ]
  }

  get profileTextMap() {
    return {
      [SpaceRoles.employee]: this.$text.Employee,
      [SpaceRoles.admin]: this.$text.Admin
    }
  }

  get roles() {
    return [
      { value: SpaceRoles.employee, text: this.$text.Employee },
      { value: SpaceRoles.admin, text: this.$text.Admin }
    ]
  }

  get userTypes() {
    return [
      { value: UserTypes.normal, text: this.$text.Normal },
      { value: UserTypes.superUser, text: this.$text.SuperUser },
      { value: UserTypes.diginexAdmin, text: this.$text.DiginexAdmin }
    ]
  }

  get brandList() {
    interface FillableObject {
      [k: string]: true
    }
    const registry: FillableObject = {}
    for (const user of this.records) {
      const brand = user.brand as string
      if (brand) {
        registry[brand] = true
      }
    }
    return Object.keys(registry)
  }

  get isSuperUser() {
    return this.getUser?.userType === UserTypes.superUser
  }

  get isAllowedToModify() {
    return this.isAdmin || this.isSuperUser
  }

  get filteredRecords(): Record[] {
    const fieldsToSearch = ['name', 'surname', 'email', 'role']

    const searchList = this.search.split(' ').filter((w) => w.length > 0)

    const contains = (keyword: string, item: Record) => {
      return !!fieldsToSearch.find((f) => {
        const fieldName = f as keyof Record
        const value = item[fieldName]
        return (
          typeof value === 'string' &&
          value.toLowerCase().includes(keyword.toLowerCase())
        )
      })
    }

    let filtered = this.updatedRecords
    searchList.forEach((keyword) => {
      filtered = filtered.filter((item) => contains(keyword, item))
    })

    return filtered
  }

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  @Watch('updates')
  updateDetected(latestUpdates: Document[]) {
    this.updated =
      latestUpdates != null && Object.keys(latestUpdates).length > 0
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  updatePending(id: string) {
    return this.pendingUpdates[id]
  }

  emitEvent(btn: { onClick: () => void }) {
    if (btn) {
      btn.onClick()
    }
  }

  onReinviteUser(id: string) {
    this.isReInviteDialog = true
    this.reinviteUserId = id
  }

  sendInvitation() {
    this.isLoading = true
    this.vuexReinvite(this.reinviteUserId)
      .then(() => {
        this.isLoading = false
        this.isReInviteDialog = false
        this.$showSnack(this.$msg.userReinviteSuccess)
      })
      .catch(() => {
        this.isLoading = false
        this.isReInviteDialog = false
      })
  }

  onDeleteUser() {
    this.isLoading = true
    if (this.selected) {
      this.vuexDelete(this.selected)
        .then(() => {
          this.isLoading = false
          this.$showSnack(this.$msg.UserDeleteSuccess)
          this.isDeleteDialog = false
        })
        .catch(() => {
          this.isLoading = false
        })
    }
  }

  onConfirmDelete(user: UserDirectory.Record) {
    this.selected = user
    this.isDeleteDialog = true
  }

  leaveSpace() {
    this.isLoading = true
    this.vuexLeaveSpace()
      .then(() => {
        this.$showSnack(this.$msg.SpaceLeaveSuccess)
        this.isLoading = false //* Disable spinner
        this.isLeaveDialog = false //* Hide leave dialog
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <div>
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel -->
          <ButtonsPanel :buttons="getButtonsPanel" @btnClick="emitEvent" />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs :items="[[$text.UserDirectory, '/userDirectory']]" />
        </v-flex>
        <v-col md="3" offset-md="9">
          <v-text-field
            v-model="search"
            append-icon="search"
            :label="$text.Search"
            single-line
            hide-details
            style="padding: 0 1rem"
          ></v-text-field>
        </v-col>

        <v-flex xs12 pa-0 ml-5 mr-5>
          <!-- TABLE -->
          <v-data-table
            :headers="headers"
            :items="filteredRecords"
            item-key="id"
            color="accent"
          >
            <template v-slot:item.fullname="{ item }">
              {{ item.name }}
              {{ item.surname }}
            </template>
            <template v-slot:item.role="{ item }">
              <v-select
                v-if="isSuperUser"
                :items="roles"
                item-text="text"
                item-value="value"
                :value="item.role"
                :disabled="updatePending(item.id)"
                @change="updateUser({ id: item.id, role: $event })"
                hide-details
                solo
                style="padding: 0.3rem 0"
              ></v-select>
              <span v-else>{{ profileTextMap[item.role] }}</span>
            </template>
            <template v-slot:item.userType="{ item }">
              <v-select
                :items="userTypes"
                :value="item.userType"
                :disabled="updatePending(item.id)"
                @change="updateUser({ id: item.id, userType: $event })"
                hide-details
                solo
                style="padding: 0.3rem 0"
              ></v-select>
            </template>
            <template v-slot:item.brand="{ item }">
              <v-select
                :items="brandList"
                :value="item.brand"
                :disabled="updatePending(item.id)"
                hide-details
                solo
                style="padding: 0.3rem 0"
                @change="updateUser({ id: item.id, brand: $event })"
              ></v-select>
            </template>

            <!-- User status - registered/pending -->
            <template v-slot:item.isRegistered="{ item }">
              <span v-if="item.isRegistered">{{ $text.Registered }}</span>
              <span v-else>
                {{ $text.Pending }}
                <v-btn
                  icon
                  small
                  @click="onReinviteUser(item.id)"
                  :title="$text.ResendInvitation"
                >
                  <v-icon color="grey lighten-1" medium>mdi-email-plus</v-icon>
                </v-btn>
              </span>
            </template>

            <!-- User creation date -->
            <template v-slot:item.createdAt="{ item }">
              <div :title="item.createdAt | formatDate">
                {{ item.createdAt | formatDateSimpleInv }}
              </div>
            </template>

            <template v-slot:item.actions="{ item }">
              <!-- <v-btn @click="onEditUser(item)" icon>
                <v-icon>mdi-pencil</v-icon>
              </v-btn>-->

              <v-btn
                v-if="item.email === authedUser.email"
                @click="isLeaveDialog = true"
                icon
              >
                <v-icon>mdi-exit-run</v-icon>
              </v-btn>
              <v-btn v-else-if="isAdmin" @click="onConfirmDelete(item)" icon>
                <v-icon>cancel</v-icon>
              </v-btn>

              <!-- <v-btn
                style="width: 100%"
                :disabled="!updates[item.id] || updatePending(item.id)"
                color="error"
                @click="sendUpdate({id:item.id})"
                icon
              >
                <span v-if="updatePending(item.id)">{{ $text.Updating}}</span>
                <span v-else>{{ $text.Update}}</span>
              </v-btn>-->
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
    </v-container>
    <TheContactsEdit v-if="isInviteDialog" v-model="isInviteDialog" />

    <!-- Confirm: resending invitation to registered user -->
    <ConfirmationDialog
      v-if="isReInviteDialog"
      v-model="isReInviteDialog"
      :title="$text.ConfirmReinvite"
      :body="$text.ConfirmReinviteBody"
      :action="sendInvitation"
      :submitButtonText="$text.Ok"
      :isLoading="isLoading"
      persistent
    />

    <!-- Confirm: removing user from space-->
    <ConfirmationDialog
      v-if="isDeleteDialog"
      v-model="isDeleteDialog"
      :title="$text.UserDeleteConfirmTitle"
      :body="$text.UserDeleteConfirm"
      :action="onDeleteUser"
      :submitButtonText="$text.Ok"
      :isLoading="isLoading"
      persistent
    />

    <!-- Confirm: authed user is leaving space-->
    <ConfirmationDialog
      v-if="isLeaveDialog"
      v-model="isLeaveDialog"
      :title="$text.SpaceLeaveConfirmTitle"
      :body="$text.SpaceLeaveConfirm"
      :action="leaveSpace"
      :submitButtonText="$text.Ok"
      :isLoading="isLoading"
      persistent
    />
  </div>
</template>

<style lang="scss"></style>
