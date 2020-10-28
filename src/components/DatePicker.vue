<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class DatePicker extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(String) value: string
  @Prop(String) label: string

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  date = new Date().toISOString().substr(0, 10)
  dateFormatted = ''
  isPickerOpen = false

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  @Watch('date', { immediate: true })
  dateFormat(value: string) {
    this.dateFormatted = this.formatDate(value)
    this.$emit('update:value', value)
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    const dateSeparator = '-'
    const isBadValue =
      !this.value ||
      this.value === 'null' ||
      this.value.split(dateSeparator).length !== 3

    this.date = isBadValue ? new Date().toISOString().substr(0, 10) : this.value
    this.dateFormat(this.date)
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  formatDate(date: string) {
    if (!date) {
      return ''
    }

    const [year, month, day] = date.split('-')
    return `${month}/${day}/${year}`
  }
  parseDate(date: string) {
    if (!date) {
      return ''
    }

    const [month, day, year] = date.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
}
</script>

<template>
  <v-menu
    v-model="isPickerOpen"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        v-model="dateFormatted"
        :label="label"
        hint="MM/DD/YYYY"
        persistent-hint
        prepend-icon="event"
        @blur="date = parseDate(dateFormatted)"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="date"
      no-title
      @input="isPickerOpen = false"
    ></v-date-picker>
  </v-menu>
</template>

<style lang="scss" scoped></style>
