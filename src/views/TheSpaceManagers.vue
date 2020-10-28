<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { SpacesS } from '@/types/'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import SpaceManagerForm from '@/components/SpaceManagerForm.vue'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ components: { ConfirmationDialog, SpaceManagerForm } })
export default class TheSpaceManagers extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @A(...SpacesS.addManager)
  managerAdd: Spaces.AddManagerA
  @A(...SpacesS.deleteManager)
  managerDelete: Spaces.DeleteManagerA
  @G(...SpacesS.getManagers)
  managers: Spaces.SpaceManager[]
  @G(...SpacesS.getRegisteredUsers)
  users: Spaces.SpaceManager[]

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() space: Spaces.Record // * Always non-null

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  isLoading = false

  isConfirmDelete = false
  selected: UserDirectory.Record

  // * === === === === === === === === === ===
  // * Watchers 👀 👀 👀 👀 👀 👀 👀 👀 👀 👀

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // * User clicked submit button, update Document types - dispatch to store
  onSubmitForm(formData: Types.FormData) {
    console.log('submitting space manager form > :', formData)

    // * Create Document Category - dispatch to store
    this.isLoading = true

    const payload = {
      spaceId: this.space.id,
      ...formData
    }
    console.log(' > payload:', payload)

    this.managerAdd(payload)
      .then(() => {
        this.isLoading = false
        this.$showSnack(this.$msg.ManagerAddedSuccess)
      })
      .catch(() => {
        this.isLoading = false
      })
  }

  onConfirmDelete(manager: UserDirectory.Record) {
    this.selected = manager
    this.isConfirmDelete = true
  }

  onDelete() {
    this.isLoading = true
    const spaceId = this.space.id
    const managerId = this.selected.id
    this.managerDelete({ spaceId, managerId })
      .then(() => {
        this.isLoading = false
        this.isConfirmDelete = false
        this.$showSnack(this.$msg.ManagerDeletedSuccess)
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <div v-if="space">
    <!-- *** Space Manager Form -->
    <SpaceManagerForm
      @onSubmit="onSubmitForm"
      @onConfirm="onConfirmDelete"
      :managers="managers"
      :users="users"
      class="elevation-0"
    />

    <ConfirmationDialog
      v-if="isConfirmDelete"
      v-model="isConfirmDelete"
      :title="$text.ManagerDeleteTitle"
      :body="$text.ManagerDeleteBody"
      :isLoading="isLoading"
      :submitButtonText="$text.Delete"
      :action="onDelete"
    />
  </div>
</template>
