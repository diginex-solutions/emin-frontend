<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Spinner from '@/components/Spinner.vue'
import TheBreadcrumbs from './TheBreadcrumbs.vue'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({ components: { Spinner, TheBreadcrumbs } })
export default class Cta extends Vue {
  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(String) icon: string
  @Prop(String) message: string
}
</script>

<template>
  <v-container class="cta__container" grid-list-md pa-0 ma-0 fluid>
    <div class="cta">
      <div style="display: flex; flex-direction: column; align-items:center">
        <v-icon color="#dddddd" size="150">{{ icon }}</v-icon>
        <span class="cta-text" style="font-size:1.5em; color:#bbbbbb;">
          {{ message ? message : $text.NotFound }}
        </span>
      </div>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.cta {
  &__container {
    position: relative;
    min-height: 50vh;
  }

  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  min-height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
