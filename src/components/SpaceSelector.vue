<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action as A, Getter as G } from 'vuex-class'
import { SpacesS } from '../types'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({ components: {} })
export default class SpaceSelector extends Vue {
  @G(...SpacesS.records) spaces: Spaces.Record[]
  @G(...SpacesS.getSelected) getSelected: Spaces.Record
  @A(...SpacesS.setSelected) setSelected: Spaces.SetSelectedA

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get isSelectedPersonal() {
    return this.getSelected?.isPrivate
  }
}
</script>

<template>
  <v-menu offset-y v-if="getSelected">
    <template v-slot:activator="{ on }">
      <!-- Desktop: Button text -->
      <v-btn
        v-if="!$vuetify.breakpoint.xs"
        outlined
        v-on="on"
        class="plain-btn"
      >
        <span>{{ getSelected.name }}</span>

        <v-icon right dark>mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    <v-list flat>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ $text.MySpaces }}</v-list-item-title>
          <v-list-item-subtitle>{{ $text.SpaceSelect }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item-group>
        <v-list-item
          v-for="space in spaces"
          :key="space.id"
          :class="{ active: getSelected.id === space.id }"
          @click="setSelected(space)"
        >
          <v-list-item-icon>
            <v-icon>{{ space.icon }}</v-icon>
          </v-list-item-icon>
          <!-- todo: map role properly -->
          <v-list-item-title>
            {{ `${space.name} (${space.role})` }}
          </v-list-item-title>

          <v-list-item-action>
            <v-icon v-if="getSelected.id === space.id">check</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<style lang="scss" scoped>
.active {
  background: rgba(0, 0, 0, 0.2);
}

.plain-btn {
  &.v-btn:before {
    display: none;
  }
}
</style>
