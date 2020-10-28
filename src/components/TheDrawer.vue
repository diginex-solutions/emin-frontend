<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Getter as G } from 'vuex-class'
import { DocsS, SpacesS, AuthS, SettingsS, UserDirectoryS } from '@/types/'
import { config } from '@/utils/config'
import { Routes } from '../router'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

type Docs = Docs.Record

type MenuBtn = {
  text: string
  name: string
  icon: string
  isHidden?: boolean
} | null

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({})
export default class TheDrawer extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...DocsS.records) documents: Docs[]
  @G(...SettingsS.isShowDashboard) isShowDashboard: boolean
  @G(...SpacesS.getSelected) space: Spaces.Record
  @G(...SpacesS.isSpaceAdmin) isSpaceAdmin: boolean
  @G(...SpacesS.isAdminGlobal) isAdminGlobal: boolean
  @G(...SpacesS.isUserDirectory) isUserDirectory: boolean
  @G(...AuthS.getUser) getUser: Auth.User
  @G(...UserDirectoryS.getAdmins) getAdmins: UserDirectory.Record[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Boolean) drawer: boolean // * Synced, responsible for visibility of the side drawer

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  logoFileName = config.logoFileName

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  // * Drawer items
  get items() {
    if (!this.space) return []
    const userDirectoryBtn: MenuBtn = {
      text: this.$text.UserDirectory,
      name: Routes.userDirectory.name,
      icon: 'mdi-clipboard-account',
      isHidden: !this.isUserDirectory
    }

    const contactsBtn: MenuBtn = {
      text: this.$text.Connections,
      name: Routes.connections.name,
      icon: 'contacts',
      isHidden: !!this.isUserDirectory
    }

    return [
      {
        text: this.$text.Spaces,
        name: Routes.spaces.name,
        icon: 'mdi-account-switch',
        isHidden: this.getUser.isExternal
      },
      {
        text: this.$text.Documents,
        name: Routes.documents.name,
        icon: 'insert_drive_file'
      },
      {
        text: this.$text.Checklist,
        name: Routes.checklist.name,
        icon: 'mdi-format-list-checkbox',
        isHidden: !this.space.isChecklist || this.getUser.isExternal
      },
      {
        text: this.$text.FormTemplates,
        name: Routes.templates.name,
        icon: 'mdi-clipboard-text',
        disabled: !this.isShowDashboard,
        isHidden: !this.space.isForms
      },
      {
        text: this.$text.Forms,
        name: Routes.forms.name,
        icon: 'mdi-clipboard-flow',
        isHidden: !this.space.isForms || this.getUser.isExternal
      },
      {
        text: this.$text.Cases,
        name: Routes.cases.name,
        icon: 'mdi-clipboard-alert',
        isHidden: !this.space.isCases
      },
      contactsBtn,
      userDirectoryBtn,
      {
        text: this.$text.Dashboard,
        name: Routes.overview.name,
        icon: 'pie_chart',
        disabled: !this.isShowDashboard,
        isHidden: !this.space.isDashboard
      },
      {
        text: this.$text.SpaceAdministration,
        name: Routes.spacesAdmin.name,
        icon: 'mdi-settings',
        isHidden: !this.isAdminGlobal
      },
      {
        text: this.$text.Support,
        name: Routes.articles.name,
        icon: 'mdi-text',
        isHidden: !this.space.isSupport
      }
    ]
  }

  // isDrawerOpen: computed value for managing synced "drawer" prop
  get isDrawerOpen() {
    return this.drawer
  }
  set isDrawerOpen(value: boolean) {
    this.$emit('update:drawer', value)
  }

  get countPendingActions() {
    // Count number of actions with status "pending"
    let countPending = 0

    // for each document, count pending actions
    this.documents.forEach((doc: Docs.Record) => {
      const actions = doc.actions || []

      const filterRecipient = (a: Forms.Record) => !a.isInitiator
      const filterPending = (a: Forms.Record) => {
        return a.status === 'pending' || a.status === 'received'
      }
      countPending += actions.filter(filterRecipient).filter(filterPending)
        .length
    })

    return countPending > 0
      ? ` <span class="count-pending">(${countPending})</span>`
      : ''
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // * True if menu item is active
  isMenuActive(name: string) {
    return name === this.$route.name
  }

  onGotoLanding() {
    this.$router.push(Routes.root.name)
  }
}
</script>

<template>
  <v-navigation-drawer
    v-model="isDrawerOpen"
    fixed
    app
    dark
    class="primary no-print"
    width="250"
    mobile-break-point="960"
  >
    <a class="company-name primary" @click="onGotoLanding">
      <div>
        <img height="45px" :src="`/img/company-logos/${logoFileName}`" />
      </div>
    </a>
    <v-list>
      <template v-for="item in items">
        <v-list-item
          v-if="!item.isHidden"
          :key="item.name"
          class="drawer-item"
          :class="isMenuActive(item.name) ? 'highlighted' : ''"
          :to="{ name: item.name }"
          active-class="highlighted"
          height="30px"
          v-show="!item.disabled"
        >
          <v-list-item-action>
            <v-icon size="22" class="pl-1 drawer-icon">{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title style="font-size:1.1em" v-html="item.text" />
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style lang="scss">
$colorAccent: '#cc2531';
$colorAccentLight: '#ff8f97';
$colorPrimary: '#333434';
$colorSecondary: '#000000';
$colorListHover: #898c8f;
$colorListFocus: #bababa;

.drawer-item {
  transition: border-color 0.3s ease-in-out;
  border-right: 5px solid transparent;
  height: 30px;

  .v-list-item__action {
    margin-right: 16px !important;
  }

  &:hover {
    border-right: 5px solid $colorListHover;
  }

  &:focus {
    border-right: 5px solid $colorListFocus;
  }

  &.highlighted {
    background: #{$colorSecondary} !important;
    color: white;
    border-right: 5px solid #{$colorAccent};

    // disable overlaying "fader"
    &:before {
      background: transparent !important;
    }
    .drawer-icon {
      color: white !important;
    }
  }

  .drawer-icon {
    color: #cecece !important;
  }

  .count-pending {
    color: red;
  }
}

.company-name {
  background: #{$colorPrimary};
  font-weight: bold;
  height: 90px;
  font-size: 1.2em;
  padding-left: 1em;
  color: white;
  display: flex;
  align-items: center;
  letter-spacing: 2px;
}
</style>
