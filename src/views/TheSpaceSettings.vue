<script lang="ts">
import { Action as A } from 'vuex-class'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { SpacesS, ConnectionsS, UserDirectoryS } from '@/types/'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import FormFields from '@/stx/stxForms'
import FormParser from '@/components/FormParser.vue'

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

@Component({ components: { ConfirmationDialog, FormParser } })
export default class TheSpaceSettings extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...SpacesS.update) vuexUpdate: Spaces.UpdateA
  @A(...UserDirectoryS.fetch) vuexFetchUserDirectory: UserDirectory.ActionFetch
  @A(...ConnectionsS.fetch) vuexFetchConnection: Connections.FetchA

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() space: Spaces.Record // * Always non-null

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  formFields: Types.FormField[] = FormFields.space()

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  // * Populate form fileds to edited record
  @Watch('space', { immediate: true }) onSpaceUpdated(space: Spaces.Record) {
    const updateValue = (f: Types.FormField) =>
      (f.value = space[f.name as Spaces.Fields])
    this.formFields.forEach(updateValue)
    this.formFields = [...this.formFields] // * Trigger update (potential reactivity caveat)
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  // * User clicked submit button, update Space - dispatch to store
  onSubmitForm(formData: Types.FormData) {
    this.isLoading = true
    const payload = { id: this.space.id, ...formData }
    this.vuexUpdate(payload)
      .then((record: Spaces.Record) => {
        this.isLoading = false
        this.$showSnack(this.$msg.SpaceUpdateSuccess)
        this.onSpaceUpdated(record)
        return formData.isUserDirectory
          ? this.vuexFetchUserDirectory(false)
          : this.vuexFetchConnection()
      })
      .catch(() => (this.isLoading = false))
  }
}
</script>

<template>
  <FormParser
    :v-if="space"
    :isLoading="isLoading"
    :formFields="formFields"
    :submitBtnText="$text.Save"
    class="elevation-0"
    @onSubmit="onSubmitForm"
    :noCancelBtn="true"
  />
</template>
