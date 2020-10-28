<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Getter as G } from 'vuex-class'
import ContactsSelect from '@/components/ContactsSelect.vue'
import { SpacesS, ConnectionsS, UserDirectoryS } from '@/types'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type SelectedType = UserDirectory.Record[] | UserDirectory.Record | undefined

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({ components: { ContactsSelect } })
export default class ContactSelectByType extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...UserDirectoryS.records) userDirectoryRecords: UserDirectory.Record[]
  @G(...ConnectionsS.records) connectionsRecords: UserDirectory.Record[]
  @G(...SpacesS.getCaseManagers) managerRecords: Spaces.SpaceManager[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() name: string
  @Prop() rule: Types.Rule[]
  @Prop() noDataText: ''
  @Prop() multiple: boolean
  @Prop() allowInviteUser: boolean
  @Prop() label: string
  @Prop() contactType: string
  @Prop() user: SelectedType

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get selectedContact() {
    return this.user
  }

  set selectedContact(value: SelectedType) {
    this.$emit('update:user', value)
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  contacts(contactType: string) {
    switch (contactType) {
      case 'userDirectory':
        return this.userDirectoryRecords
      case 'connection':
        return this.connectionsRecords.filter((c) => c.isRegistered)
      case 'manager':
        return this.managerRecords
      default:
        return []
    }
  }
}
</script>

<template>
  <ContactsSelect
    :key="name"
    :ref="name"
    :selected.sync="selectedContact"
    :contacts="contacts(contactType)"
    :rule="rule"
    :noDataText="noDataText"
    :multiple="multiple"
    :allowInviteUser="allowInviteUser"
    :label="label"
  />
</template>
