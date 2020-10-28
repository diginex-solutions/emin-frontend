<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import SharingDialog from '@/components/SharingDialog.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import ActionViewer from '@/components/ActionViewer.vue'
import ActionFiller from '@/components/ActionFiller.vue'
import _ from 'lodash'
import { toggleScrollbar } from '../utils/helpers'
import Dialog from '@/mixins/Dialog.ts'
import { FormStatuses, FormTypes } from '@/store/formsStore'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type User = UserDirectory.Record

@Component({
  components: {
    SharingDialog,
    ConfirmationDialog,
    ActionViewer,
    ActionFiller
  },
  mixins: [Dialog]
})
export default class TheActionsDrawer extends Mixins(Dialog) {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() document: Docs.Record //
  @Prop(Boolean) isActionsInitiator: boolean // exception
  @Prop() actions: Forms.Record[]
  @Prop(String) selectedActionId: string

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  dialogs = {
    isView: false,
    isFill: false
  }
  selectedAction: Forms.Record | null = null
  isCreateAction = false
  initialDelay = 100

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get isActionsRecipient() {
    return !this.isActionsInitiator
  }

  get statusIcons() {
    return {
      pending: {
        icon: 'assignment_late',
        color: 'accent',
        title: this.$text.DrawerInfoWaiting
      },
      received: {
        icon: 'assignment_late',
        color: 'orange',
        title: this.$text.DrawerInfoWaiting
      },
      accepted: {
        icon: 'assignment_turned_in',
        color: '#1bb7a1',
        title: this.$text.DrawerInfoAccepted
      },
      rejected: {
        icon: 'assignment_turned_in',
        color: '#e99090',
        title: this.$text.DrawerInfoRejected
      }
    }
  }

  // Returns sorted actions - latest actions first
  get actionsSorted() {
    const sorterByDate = (a: Forms.Record) => a.dateCreated
    const actions = _.orderBy(this.actions, sorterByDate, 'desc')

    return actions
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    toggleScrollbar(true) // show main scrollbar

    if (this.selectedActionId) {
      const findById = (a: { id: string }) => a.id === this.selectedActionId
      const action = this.actions.find(findById)
      if (action) {
        this.viewAction(action)
      }
    }
  }

  destroyed() {
    toggleScrollbar(false) // show main scrollbar
    this.$emit('onClose') // Emit event to parent
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  viewAction(action: Forms.Record | null = null) {
    this.selectedAction = action

    const isInitiator = action?.isInitiator

    // Compute isFilled
    const status = this.selectedAction?.status
    const filled =
      status === FormStatuses.accepted || status === FormStatuses.rejected
    const isFilled = filled ? status : false

    this.dialogs.isView = false
    this.dialogs.isFill = false

    if (!isInitiator && !isFilled) {
      this.dialogs.isFill = true
    } else {
      this.dialogs.isView = true
    }
  }

  isActionForm(action: Forms.Record) {
    return !!action.template
  }

  getActionStatus(action: Forms.Record) {
    const isReceived = this.isActionsRecipient && action.status === 'received'
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

  getFormType(form: Forms.Record) {
    if (form.type === FormTypes.form) {
      return this.$text.Form
    } else if (form.type === FormTypes.verification) {
      return this.$text.Verification
    }

    return '?' // TODO: throw exception
  }

  getUserInfo(user: User) {
    const { name, surname, isRegistered } = user
    return isRegistered
      ? `${name} ${surname}`
      : `(${this.$text.PendingRegistration})`
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
        :file="document"
        :actionRaw="selectedAction"
      />
      <ActionViewer
        v-if="dialogs.isView"
        v-model="dialogs.isView"
        :file="document"
        :actionRaw="selectedAction"
      />
      <SharingDialog
        v-if="isCreateAction"
        v-model="isCreateAction"
        :file="document"
        :isVerifyDefault="true"
      />

      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            <v-icon color="accent" size="50">assignment_turned_in</v-icon>
            <span class="header">
              <span
                v-if="isActionsRecipient"
                v-text="$text.DrawerTitleRecipient"
              />
              <span v-else v-text="$text.DrawerTitleInitiator" />
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
          v-if="!isActionsRecipient"
          link
          @click="isCreateAction = true"
          class="mb-3"
        >
          <v-list-item-content>
            <div class="share-btn">
              <v-icon color="accent">add</v-icon>
              <span>{{ $text.DrawerCreateBtn }}</span>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          v-for="item in actionsSorted"
          :key="item.id"
          @click="viewAction(item)"
          :class="{
            'hl-pending': isActionPending(item) && !isActionsInitiator
          }"
        >
          <v-list-item-avatar class="status-icon">
            <v-avatar :color="statusIcons[item.status].color">
              <v-icon dark :title="statusIcons[item.status].title" size="30">
                {{ statusIcons[item.status].icon }}
              </v-icon>
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="user__title">
              <span v-if="isActionsRecipient" class="user__title__recipient">
                {{ getActionStatus(item) }}
                <!-- For initiator - -->
                <span class="sub">{{ item.initiator.email }}</span>
              </span>
              <span
                v-else
                class="user__title__name"
                :title="
                  `${getUserInfo(item.recipient)} (${item.recipient.email})`
                "
              >
                {{ getUserInfo(item.recipient) }}
              </span>
              <v-spacer />
              <span
                class="date"
                :title="$options.filters.formatDate(item.dateCreated)"
              >
                {{ item.dateCreated | formatAgo }}
              </span>
            </v-list-item-title>
            <v-list-item-subtitle class="user__email" :title="item.message">
              ({{ getFormType(item) }}) {{ item.message }} &nbsp;
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

      .sub {
        font-size: 1rem !important;
        font-weight: normal;
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
