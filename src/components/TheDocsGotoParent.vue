<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({})
export default class TheDocsGotoParent extends Vue {
  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Boolean) isSharedPath: boolean
  @Prop(String) getCurrentPath: string
  @Prop(Boolean) isSearch: boolean
  @Prop() highlightedRow: string

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  gotoFolder() {
    this.$emit('gotoFolder')
  }

  onHighlight() {
    this.$emit('onHighlight')
  }
}
</script>

<template>
  <tr
    v-if="!isSearch && getCurrentPath !== '/'"
    @dblclick="gotoFolder()"
    @dragenter="onHighlight"
    class="non-draggable is-special"
    :class="{ 'highlight-row': highlightedRow === 'parent' }"
    :data-id="'parent'"
    :title="$text.GoBack"
  >
    <template v-if="$vuetify.breakpoint.xs">
      <td>
        <v-icon
          style="margin-right: 10px; margin-left: 20px;"
          color="#ffc107"
          :size="32"
          @click="gotoFolder()"
        >
          folder
        </v-icon>
        <a @click="gotoFolder()">..</a>
      </td>
    </template>
    <template v-else>
      <td></td>
      <!-- Icon -->
      <td style="padding-left: 5px">
        <v-icon
          style="margin-right: 10px"
          color="#ffc107"
          @click="gotoFolder()"
          :size="32"
        >
          folder
        </v-icon>
        <a @click="gotoFolder()">..</a>
      </td>

      <td />
      <td />
      <td />
      <!-- + Search page has extra column "path" -->
      <td v-if="isSearch" />
      <!-- - Shared with me folder has no `shared` and `actions` columns-->
      <td v-if="!isSharedPath" />
      <td v-if="!isSharedPath" />
    </template>
  </tr>
</template>

<style lang="scss"></style>
