<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

interface Breadcrumb {
  value: string
  label: string
  disabled?: boolean
}

type BreadcrumbInput = [string, string]

@Component({})
export default class TheBreadcrumbs extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Array) items: BreadcrumbInput[]
  @Prop(Boolean) routerMode: boolean
  @Prop(Boolean) isRouter: boolean // Router mode based on name

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get breadcrumbs() {
    // Validation
    if (!this.items) {
      return []
    }

    const makeBreadcrumb = (label: string, value: string) => {
      return {
        label,
        value,
        disabled: false
      }
    }

    // Clone prop breadcrumbs
    const result: Breadcrumb[] = []

    this.items.forEach((crumb: BreadcrumbInput) => {
      result.push(makeBreadcrumb(...crumb))
    })

    // Disable last item
    result[result.length - 1].disabled = true

    return result
  }

  onClick(value: string) {
    if (this.routerMode) {
      this.$router.push({ path: value })
    } else if (this.isRouter) {
      this.$router.push({ name: value })
    } else {
      this.$emit('onClick', value)
    }
  }
}
</script>

<template>
  <v-breadcrumbs :items="breadcrumbs" :large="true" class="breadcrumbs">
    <template v-slot:divider>
      <v-icon size="23">mdi-chevron-right</v-icon>
    </template>

    <template v-slot:item="props">
      <v-breadcrumbs-item
        @click.native="onClick(props.item.value)"
        :class="[
          'breadcrumbs__item',
          props.item.disabled && 'disabled',
          breadcrumbs.length === 1 && 'root'
        ]"
      >
        <a>{{ props.item.label }}</a>
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<style lang="scss">
.breadcrumbs {
  padding-left: 50px !important;
  padding-top: 10px;
  padding-bottom: 10px;

  .breadcrumbs__item a {
    padding: 3px 5px;
  }

  .v-breadcrumbs__divider {
    padding: 0 !important;
  }

  &__item {
    &.disabled.root {
      pointer-events: none;
      a {
        color: #333333 !important;
      }
    }
    &.disabled {
      pointer-events: none;

      a {
        color: #aaaaaa !important;
      }
    }

    a {
      font-size: 1.2em;
      padding: 3px 15px;
      color: #cc2530 !important;

      &:hover {
        background: #e7e7e7;
      }
    }
  }
}
</style>
