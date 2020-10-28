<script lang="ts">
import { Vue, Component, Prop, Provide } from 'vue-property-decorator'
import TheContactsEdit from '@/components/TheContactsEdit.vue'
import { finderById } from '../utils/helpers'
import { Getter as G } from 'vuex-class'
import { SpacesS } from '../types'
import ConnectionNew from '@/components/ConnectionNew.vue'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Types

type Rule = (v: string) => string | true // validation rule type
type SelectedType = UserDirectory.Record[] | UserDirectory.Record | undefined

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({ components: { TheContactsEdit, ConnectionNew } })
export default class SelectUsers extends Vue {
  @G(...SpacesS.isUserDirectory) isUserDirectory: boolean

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() contacts: UserDirectory.Record[]
  @Prop() selected: SelectedType
  @Prop() rule: Rule
  @Prop() noDataText: ''
  @Prop({ default: true }) multiple: boolean
  @Prop({ default: true }) allowInviteUser: boolean
  @Prop() label: string

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isCreateDialog = false

  @Provide()
  searchInput = null

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get users() {
    return this.multiple ? this.selected || [] : this.selected
  }

  set users(value: SelectedType) {
    this.$emit('update:selected', value)
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // Returns string - 2 capitalized letters of user name and surname
  getShortName(user: UserDirectory.Record) {
    const letter1 = user.name ? user.name.substring(0, 1).toUpperCase() : ''
    const letter2 = user.surname
      ? user.surname.substring(0, 1).toUpperCase()
      : ''

    //* If name or surname is present - return first letters
    const shortName = letter1 + letter2
    if (shortName) return shortName

    //* Return first 2 letters of email
    return user.email.substring(0, 2).toUpperCase()
  }

  // remove item from the selector
  remove(item: UserDirectory.Record) {
    if (Array.isArray(this.users)) {
      const findById = finderById(item.id)
      const index = this.users.findIndex(findById)
      if (index >= 0) {
        this.users.splice(index, 1)
      }
    } else {
      this.users = undefined
    }
  }

  onAddContact(record: UserDirectory.Record) {
    if (Array.isArray(this.users)) {
      this.users.push(record)
    } else {
      this.users = record
    }
  }

  getContactAsText(user: UserDirectory.Record) {
    return user.name + ' ' + user.surname + ' ' + user.email
  }

  getName(user: UserDirectory.Record) {
    if (user.name && user.surname) {
      return user.name + ' ' + user.surname
    }

    return user.email
  }

  closeList() {
    if (this.$refs.autocomplete) {
      const el = this.$refs.autocomplete as HTMLElement
      if (el && el.blur) {
        el.blur()
      }
    }
  }
}
</script>

<template>
  <div>
    <v-autocomplete
      v-model="users"
      :items="contacts"
      filled
      chips
      color="blue-grey lighten-2"
      :label="label ? label : $text.Recipients"
      :item-text="getContactAsText"
      :rules="rule"
      return-object
      :multiple="multiple"
      :no-data-text="noDataText"
      ref="autocomplete"
      @input="searchInput = null"
      :search-input.sync="searchInput"
    >
      <!-- multiple -->
      <template v-slot:selection="data">
        <v-chip
          v-bind="data.attrs"
          :input-value="data.selected"
          close
          @click="data.select"
          @click:close="remove(data.item)"
        >
          <v-avatar class="accent white--text user-avatar" left>
            {{ getShortName(data.item) }}
          </v-avatar>
          {{ data.item.name }}
        </v-chip>
      </template>
      <template v-slot:item="data">
        <template v-if="typeof data.item !== 'object'">
          <v-list-item-content v-text="data.item"></v-list-item-content>
        </template>
        <template v-else>
          <v-list-item-avatar>
            <v-avatar class="accent white--text user-avatar">
              {{ getShortName(data.item) }}
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>
              {{ getName(data.item) }}
            </v-list-item-title>
            <v-list-item-subtitle
              v-text="data.item.email"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </template>
      </template>
    </v-autocomplete>

    <template v-if="isUserDirectory">
      <TheContactsEdit
        v-if="isCreateDialog"
        v-model="isCreateDialog"
        @onSuccess="onAddContact"
      />
    </template>
    <template v-else>
      <ConnectionNew
        v-if="isCreateDialog"
        v-model="isCreateDialog"
        @onSuccess="onAddContact"
      />
    </template>
    <v-btn
      v-if="allowInviteUser"
      @click="isCreateDialog = true"
      small
      text
      color="accent"
    >
      <v-icon>add</v-icon>
      <span v-if="isUserDirectory" v-text="$text.InviteUser" />
      <span v-else v-text="$text.ConnectionAdd" />
    </v-btn>
  </div>
</template>

<style lang="scss" scoped></style>
