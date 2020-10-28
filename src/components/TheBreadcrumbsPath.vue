<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { DocsS } from '@/types/'
import { Routes } from '../router'

@Component({})
export default class TheBreadcrumbs extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...DocsS.getCurrentPath) getCurrentPath: string
  @A(...DocsS.setCurrentPath) setCurrentPath: Docs.SetCurrentPathA
  @A(...DocsS.updateSearchQuery) updateSearchQuery: Docs.UpdateSearchA

  // === === === === === === === === === ===
  // PROPS
  @Prop(String) rootText: string
  @Prop(String) textAppend: string
  @Prop(Boolean) isSearch: boolean

  // === === === === === === === === === ===
  // COMPUTED

  get breadcrumbs() {
    const makeBreadcrumb = (text: string, path: string) => {
      return {
        text,
        path,
        disabled: false
      }
    }

    const result = [makeBreadcrumb(this.rootText, '/')]

    let totalPath = ''

    const isRoot = this.getCurrentPath === '/'
    if (!isRoot) {
      const folders = this.getCurrentPath.split('/')

      folders.shift() // remove root

      for (const folder of folders) {
        totalPath += totalPath !== '/' && '/' + folder
        result.push(makeBreadcrumb(folder, totalPath))
      }
    }

    if (this.textAppend) {
      totalPath += totalPath !== '/' && '/' + this.textAppend
      result.push(makeBreadcrumb(this.textAppend, totalPath))
    }

    // if isSearch flag is set - display extra 'Search Results' item
    if (this.isSearch) {
      const msg = this.$text.SearchResults
      result.push(makeBreadcrumb(msg, '?search'))
    }

    result[result.length - 1].disabled = true

    return result
  }

  onSetPath(path: string) {
    this.setCurrentPath(path)
    this.$emit('onChange')

    // If currently user is looking at search results - opening any page should reset search
    if (this.isSearch) {
      this.updateSearchQuery()
      this.$router.push({ path: Routes.documents.name })
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
        @click.native="onSetPath(props.item.path)"
        :class="[
          'breadcrumbs__item',
          props.item.disabled && 'disabled',
          breadcrumbs.length === 1 && 'root'
        ]"
      >
        <a>{{ props.item.text }}</a>
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
