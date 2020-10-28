<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { toggleScrollbar } from '../utils/helpers'
import Dialog from '@/mixins/Dialog.ts'

// * === === === === === === === === === ===
// * Types 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷 🔷

type User = UserDirectory.Record

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

/*
  This component is to be used to view file's list of recipients (shared)
*/

@Component({
  components: {},
  mixins: [Dialog]
})
export default class ShareListDrawer extends Mixins(Dialog) {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() list: Forms.Recipient[]

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isShareDialog = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  // Returns sorted actions - latest actions first
  get usersSorted() {
    //const isUserShared = ({ id }: User) => this.list.includes(id)
    // return this.users.filter(isUserShared)
    return this.list
    // TODO: return sorted
    // const sorterByDate = (a: Forms.Record) => a.dateCreated
    // return _.orderBy(this.users, sorterByDate, 'desc')
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  mounted() {
    toggleScrollbar(true) // show main scrollbar
  }

  destroyed() {
    toggleScrollbar(false) // show main scrollbar
    this.$emit('onClose') // Emit event to parent
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getUserInfo(user: User) {
    const { name, surname, isRegistered } = user
    return isRegistered
      ? `${name} ${surname}`
      : `(${this.$text.PendingRegistration})`
  }
}
</script>

<template>
  <v-navigation-drawer
    v-model="isOpen"
    right
    fixed
    app
    width="500"
    temporary
    style="z-index: 300"
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          <v-icon color="accent" size="50">mdi-account</v-icon>
          <span class="header">
            <span v-text="$text.UsersWithAccess" />
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
      <div v-if="usersSorted.length == 0" class="cta-no-items">
        <div>{{ $text.ShareNone }}</div>
      </div>
      <v-list-item v-for="item in usersSorted" :key="item.id">
        <v-list-item-avatar class="status-icon">
          <v-avatar color="accent">
            <v-icon dark size="30">mdi-account</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content two-line>
          <v-list-item-title class="user__title">
            <span class="user__title__recipient">
              <span class="sender">{{ getUserInfo(item) }}</span>
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="user__email">
            <div>{{ !item.isRegistered ? item.email : '' }}</div>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
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

.cta-no-items {
  font-size: 1.3em;
  justify-content: center;
  align-items: center;
  display: flex;
  color: #999999;
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
</style>
