<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action as A } from 'vuex-class'
import Dialog from '@/mixins/Dialog.ts'
import AskText from '@/components/AskText.vue'
import { ConnectionsS } from '../types'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type Rule = (v: string) => string | true // vaidation rule type
interface Rules {
  [key: string]: Rule[]
}

interface Form extends Element {
  resetValidation: () => null
  validate: () => null
}

type Record = UserDirectory.Record

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({ mixins: [Dialog], components: { AskText } })
export default class ConnectionNew extends Mixins(Dialog) {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...ConnectionsS.create) vuexCreate: Connections.CreateA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onCreateConnection(email: string) {
    this.isLoading = true
    this.vuexCreate({ email })
      .then((user) => {
        this.isLoading = false
        this.isOpen = false
        this.$showSnack(this.$msg.ConnectionCreateSuccess)
        this.$emit('onSuccess', user)
      })
      .catch(() => {
        this.isLoading = false
      })
  }
}
</script>

<template>
  <AskText
    v-if="isOpen"
    v-model="isOpen"
    :title="$text.ConnectionAdd"
    :inputTitle="$text.Email"
    :btnSubmit="$text.Submit"
    :btnCancel="$text.Cancel"
    :isLoading="isLoading"
    @onSubmit="onCreateConnection"
    @onCancel="isOpen = false"
  />
</template>

<style lang="scss"></style>
