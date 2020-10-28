<script lang="ts">
/*
  This component is to be used:
    1. Viewing all notifications by clicking bell icon on navbar
    2. Viewing document-related notifications
*/

import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import {
  DocsS,
  FormsS,
  NotificationsS,
  UserDirectoryS,
  SpacesS
} from '@/types/'
import SharingDialog from '@/components/SharingDialog.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ActionViewer from '@/components/ActionViewer.vue'
import ActionFiller from '@/components/ActionFiller.vue'
import _ from 'lodash'
import { toggleScrollbar, finderById } from '@/utils/helpers'
import Dialog from '@/mixins/Dialog.ts'
import { FormStatuses } from '@/store/formsStore'
import { NotificationTypes } from '../types/notificationsD'
import { Routes } from '../router'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Record = Notifications.Record

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({
  components: {
    SharingDialog,
    ConfirmationDialog,
    ActionViewer,
    ActionFiller
  },
  mixins: [Dialog]
})
export default class NotificationsDrawer extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...FormsS.records) forms: Forms.Record[]
  @G(...DocsS.records) docs: Docs.Record[]
  @G(...UserDirectoryS.records) users: UserDirectory.Record[]
  @A(...NotificationsS.markRead) markRead: Notifications.MarkReadA
  @G(...SpacesS.records) spaces: Spaces.Record[]
  @A(...SpacesS.setSelected) setSpaceSelected: Spaces.SetSelectedA

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() notifications: Notifications.Record[]
  @Prop(String) selectedId: string

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  dialogs = {
    isView: false,
    isFill: false,
    isSharedInfo: false
  }
  selectedAction: Forms.Record | null = null
  initialDelay = 100

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  // Returns sorted actions - latest actions first
  get notificationsSorted() {
    const sorterByDate = (a: Notifications.Record) => a.createdAt
    return _.orderBy(this.notifications, sorterByDate, 'desc')
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    toggleScrollbar(true) // show main scrollbar

    if (this.selectedId) {
      const findById = (a: { id: string }) => a.id === this.selectedId
      const notif = this.notifications.find(findById)
      if (notif) {
        this.viewNotification(notif)
      }
    }
  }

  destroyed() {
    toggleScrollbar(false) // show main scrollbar
    this.$emit('onClose') // Emit event to parent
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  getSpaceById(id: string) {
    const findById = finderById(id)
    return this.spaces.find(findById)
  }

  getStatusIcons(notif: Notifications.Record) {
    //* Define icons
    const IconRead = {
      icon: 'assignment_late',
      color: 'orange',
      title: this.$text.DrawerInfoWaiting
    }
    const IconPending = {
      icon: 'assignment_late',
      color: 'accent',
      title: this.$text.DrawerInfoWaiting
    }

    //* Return icon based on notif's isRead flag
    return notif.isRead ? IconRead : IconPending
  }

  viewNotification(notif: Notifications.Record) {
    //* Exception for spaceInvite type notifs - should show space

    if (this.isSpaceInvite(notif)) {
      return this.gotoSpace(notif.spaceId)
    }

    if (!notif.isRead) {
      this.markRead(notif)
    }

    if (notif.type === NotificationTypes.shared) {
      this.dialogs.isSharedInfo = true
    }

    const form = notif.form
    if (!form) return
    this.selectedAction = form

    // Compute isFilled
    const status = this.selectedAction?.status
    const filled =
      status === FormStatuses.accepted || status === FormStatuses.rejected
    const isFilled = filled ? status : false

    this.dialogs.isView = false
    this.dialogs.isFill = false

    if (isFilled) {
      this.dialogs.isView = true
    } else {
      this.dialogs.isFill = true
    }
  }

  isActionForm(action: Forms.Record) {
    return !!action.template
  }

  getActionStatus(action: Forms.Record) {
    const isReceived = action.status === 'received'
    const isPending = action.status === FormStatuses.pending

    if (isReceived || isPending) {
      let prefix = 'Verification '

      if (this.isActionForm(action)) {
        prefix = 'Form '
      }
      return prefix + ' ' + FormStatuses.pending
    }

    return _.capitalize(action.status)
  }

  isActionPending(action: Forms.Record) {
    return action.status === 'received' || action.status === 'pending'
  }

  // Subtitle message, based on type of notification
  getNotifSubtitle(notif: Record) {
    // * Compose messages map, type as key
    const types = NotificationTypes
    const typeMsgMap = {
      [types.verification]: this.$text.NotifMsgVerification,
      [types.shared]: this.$text.NotifMsgShared,
      [types.versionUpdate]: this.$text.NotifMsgVersion,
      [types.form]: this.$text.NotifMsgForm,
      [types.verificationFilled]: this.$text.NotifVerificationFilled,
      [types.formFilled]: this.$text.NotifFormFilled,
      [types.spaceInvited]: this.$text.NotifSpaceInvited
    }

    // * Return appropriate msg based on notif's type
    return typeMsgMap[notif.type]
  }

  getUserInfo(notif: Record) {
    const user = notif.initiator

    if (!user) {
      return
    }

    const { name, surname, isRegistered } = user
    return isRegistered
      ? `${name} ${surname}`
      : `(${this.$text.PendingRegistration})`
  }

  getEventMessage(item: Notifications.Record) {
    const eventMsg = this.getNotifSubtitle(item)
    const doc = item.doc
    const fileName = this.$options.filters?.formatDocName(doc)
    return eventMsg + fileName
  }

  isSpaceInvite(item: Record) {
    return item.type === NotificationTypes.spaceInvited
  }

  //* Set space as selected, and go to spaces route
  async gotoSpace(spaceId: string) {
    const space = this.getSpaceById(spaceId)
    if (!space) return
    await this.setSpaceSelected(space)
    const name = Routes.spaces.name
    const params = { spaceId }
    this.$router.push({ name, params })
  }
}
</script>

<template>
  <div>
    <v-navigation-drawer
      v-model="isOpen"
      right
      fixed
      app
      width="500"
      temporary
      style="z-index: 300"
    >
      <ActionFiller
        v-if="dialogs.isFill"
        v-model="dialogs.isFill"
        :file="selectedAction.doc"
        :actionRaw="selectedAction"
      />
      <ActionViewer
        v-if="dialogs.isView"
        v-model="dialogs.isView"
        :file="selectedAction.doc"
        :actionRaw="selectedAction"
      />
      <!-- Dialog: info message if user clicks on notification of shared file -->
      <ConfirmationDialog
        v-if="dialogs.isSharedInfo"
        v-model="dialogs.isSharedInfo"
        :title="$text.NotificationSharedTitle"
        :body="$text.NotificationSharedBody"
        :submitButtonText="$text.OK"
        hideCancleBtn
      />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            <v-icon color="accent" size="50">assignment_turned_in</v-icon>
            <span class="header">
              <span v-text="$text.Notifications" />
            </span>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="isOpen = false">
            <v-icon size="30" color="grey lighten-1">close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-divider />
      <v-list dense>
        <v-list-item
          v-for="item in notificationsSorted"
          :key="item.id"
          @click="viewNotification(item)"
          :class="{ 'hl-pending': isActionPending(item) }"
          :title="getEventMessage(item)"
        >
          <v-list-item-avatar class="status-icon">
            <v-avatar :color="getStatusIcons(item).color">
              <v-icon dark :title="getStatusIcons(item).title" size="30">
                {{ getStatusIcons(item).icon }}
              </v-icon>
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="user__title">
              <span class="user__title__recipient">
                {{ getActionStatus(item) }}
                <!-- For initiator - -->
                <span class="sender">{{ getUserInfo(item) }}</span>
              </span>
              <v-spacer />
              <span
                class="date"
                :title="$options.filters.formatDate(item.createdAt)"
              >
                {{ item.createdAt | formatAgo }}
              </span>
            </v-list-item-title>
            <!-- Notification subtitle, explaining the event -->
            <v-list-item-subtitle class="user__email">
              {{ getEventMessage(item) }}
              <!-- This block is for space_invited type notifications only -->
              <template
                v-if="isSpaceInvite(item) && getSpaceById(item.spaceId)"
              >
                <b>
                  {{ getSpaceById(item.spaceId).name }}
                </b>
              </template>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<style lang="scss" scoped>
// TODO: extract theme vars
$fontColor: #666666;
$colorAccent: #cc2531;

.header {
  margin-left: 12px;
  color: $fontColor;
  font-size: 1.4em;
}

.docname {
  color: #838383;
}

.user {
  &__title {
    margin-bottom: 10px;
    display: flex;
    overflow: hidden;

    &__name {
      color: $fontColor !important;
      font-size: 1.3em !important;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &__recipient {
      font-size: 1.4em !important;
      font-weight: bold;
      color: #777777;

      .sender {
        font-size: 1rem !important;
        font-weight: bold;
        color: #6c6c6c;
      }
    }
    &__faded {
      color: #999999 !important;
      margin-left: 10px;
      font-size: 1em !important;
    }
  }
  &__email {
    color: #aaaaaa !important;
    font-size: 1em !important;
  }
}

.share-btn {
  display: flex;
  justify-content: left;
  align-items: center;
  color: $colorAccent;
  span {
    font-size: 1.3em;
  }
}

.date {
  margin-left: 0.5em;
  margin-right: 0.5em;
  font-size: 1rem;
  color: #bbbbbb;
}

.status-icon {
  align-self: center;
  margin-right: 18px !important;
}

.hl-pending {
  background: rgba(255, 0, 0, 0.08);
}
</style>
