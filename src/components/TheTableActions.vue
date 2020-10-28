<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class TheTableActions extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop() item: Docs.Record

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  // Get number of sent actions
  get countActionsFilled() {
    const actions = this.actionsInitiator

    const filterCompleted = (d: Forms.Record) => {
      return d.status === 'accepted' || d.status === 'rejected'
    }
    return actions.filter(filterCompleted).length
  }

  // Info on number of filled actions vs pending
  get infoActionsFilled() {
    const actions = this.actionsInitiator

    if (actions.length === 0) {
      return '0'
    }
    return `${this.countActionsFilled} / ${actions.length}`
  }

  get actionsInitiator() {
    const filterInitiator = (a: Forms.Record) => a.isInitiator
    const actions = this.item.actions || []
    return actions.filter(filterInitiator)
  }

  // Get color based on whether the recipient completed it or not
  get getIconColor() {
    const actions = this.actionsInitiator

    const colors = {
      completed: '#44dd99',
      pending: 'orange',
      disabled: '#bbbbbb'
    }

    if (actions.length === 0) {
      return colors.disabled
    }

    const isAllFilled = this.countActionsFilled === actions.length
    return isAllFilled ? colors.completed : colors.pending
  }
}
</script>

<template>
  <a class="table-actions" :title="$text.Forms" @click.stop="$emit('onClick')">
    <v-icon :color="getIconColor" class="status-icon">assignment</v-icon>
    <span>{{ infoActionsFilled }}</span>
  </a>
</template>

<style lang="scss" scoped>
.table-actions {
  text-decoration: none;

  &:hover {
    .status-icon {
      opacity: 0.7;
    }
  }

  span {
    text-decoration: underline;
  }
}
</style>
