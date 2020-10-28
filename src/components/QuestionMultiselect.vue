<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { finderById } from '../utils/helpers'

interface Question {
  id: string
  label: string
}

@Component({ components: {} })
export default class QuestionMultiselect extends Vue {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop() selected: Question[]
  @Prop() items: Question[]
  @Prop() noDataText: ''

  // * === === === === === === === === === ===
  // * Computed 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙

  get chosen() {
    return this.selected || []
  }

  set chosen(value: Question[]) {
    this.$emit('update:selected', value)
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  // remove item from the selector
  remove(item: Question) {
    const findById = finderById(item.id)
    const index = this.chosen.findIndex(findById)
    if (index === -1) {
      return
    }
    this.chosen.splice(index, 1)
  }

  getAsText(item: Forms.AnswerFull) {
    return item.label
  }
}
</script>

<template>
  <v-autocomplete
    v-model="chosen"
    :items="items"
    filled
    chips
    :label="$text.SelectQuestions"
    :item-text="getAsText"
    return-object
    multiple
    :no-data-text="noDataText"
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
        {{ data.item.label }}
      </v-chip>
    </template>
    <template v-slot:item="data">
      <template v-if="typeof data.item !== 'object'">
        <v-list-item-content v-text="data.item"></v-list-item-content>
      </template>
      <template v-else>
        <v-list-item-content>
          <v-list-item-title>{{ data.item.label }}</v-list-item-title>
        </v-list-item-content>
      </template>
    </template>
  </v-autocomplete>
</template>

<style lang="scss" scoped></style>
