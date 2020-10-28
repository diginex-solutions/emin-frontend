<script lang="ts">
/*
  @Props: value, type
 Inputs mapper accepts type of input, and renders appropriate input component.
 Binded to value field.
*/

import { Vue, Component, Prop } from 'vue-property-decorator'
import DatePicker from '@/components/DatePicker.vue'
import CountrySelector from '@/components/CountrySelector.vue'
import { InputTypes } from '@/store/formsStore'

@Component({ components: { DatePicker, CountrySelector } })
export default class ActionInput extends Vue {
  // PROPS

  @Prop() type: string
  @Prop() label: string
  @Prop() value: string | number
  @Prop() options: Templates.Option[]

  get inputValue() {
    return this.value
  }
  set inputValue(value) {
    this.$emit('update:value', value)
  }

  get inputOptions() {
    return this.options
  }
  set inputOptions(value) {
    this.$emit('update:options', value)
  }

  get inputTypes() {
    return InputTypes
  }
}
</script>

<template>
  <div>
    <v-text-field
      v-if="type === inputTypes.text"
      v-model="inputValue"
      color="accent"
      :label="label"
      :counter="100"
      required
    />
    <v-text-field
      v-else-if="type === inputTypes.number"
      :label="label"
      type="number"
      v-model="inputValue"
      color="accent"
      required
    />
    <v-checkbox
      v-else-if="type === inputTypes.checkbox"
      :label="label"
      v-model="inputValue"
    />
    <v-select
      v-else-if="type === inputTypes.select"
      v-model="inputValue"
      item-text="label"
      item-value="id"
      :items="inputOptions"
      :label="label"
      dense
      color="accent"
    />
    <v-select
      v-else-if="type === inputTypes.multiselect"
      v-model="inputValue"
      :items="inputOptions"
      :label="label"
      item-text="label"
      item-value="id"
      dense
      :menu-props="{ maxHeight: '400' }"
      multiple
      color="accent"
    />
    <DatePicker
      v-else-if="type === inputTypes.date"
      :value.sync="inputValue"
      :label="label"
    />

    <CountrySelector
      v-else-if="type === inputTypes.country"
      :value.sync="inputValue"
      :label="label"
    />

    <v-text-field
      v-else-if="type === inputTypes.time"
      :label="label"
      type="time"
      v-model="inputValue"
      color="accent"
      required
    />
    <!-- If input type is none of the above - show warning -->
    <div v-else>{{ $text.InputUnknown }}</div>
  </div>
</template>

<style lang="scss" scoped>
$colorAccent: #cc2531;
</style>
