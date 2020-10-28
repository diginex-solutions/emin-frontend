<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Stx from '@/types/stx.ts'

@Component({})
export default class CountrySelector extends Vue {
  @Prop(String) value: string
  @Prop(String) label: string
  @Prop(Boolean) clearable: boolean | undefined
  @Prop(Boolean) noIcon: boolean | undefined

  get selected() {
    return this.value
  }
  set selected(newValue) {
    this.$emit('update:value', newValue)
  }

  get countriesList() {
    return Stx.countries
  }
}
</script>

<template>
  <v-autocomplete
    v-model="selected"
    :items="countriesList"
    :label="label"
    persistent-hint
    :prepend-icon="noIcon ? '' : 'mdi-flag'"
    :clearable="clearable"
    :no-data-text="$text.CountryNotFound"
  />
</template>

<style lang="scss" scoped></style>
