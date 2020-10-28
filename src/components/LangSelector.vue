<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Action as A, Getter as G } from 'vuex-class'
import { AuthS } from '@/types/'
import Stx from '@/types/stx.ts'

// * === === === === === === === === === ===
// * Main 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯 🎯

@Component({})
export default class LangSelector extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...AuthS.getLang) getLang: Auth.Language
  @G(...AuthS.isLogged) isLogged: string
  @A(...AuthS.setLang) setLang: Auth.SetLangA
  @A(...AuthS.updateUser) updateUser: Auth.UpdateUserA

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(Boolean) dark: boolean
  @Prop(Boolean) isText: boolean
  @Prop(Boolean) noStore: boolean
  @Prop(String) lang: string

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  get languages() {
    return Stx.lang.list
  }

  get selectedLang() {
    return this.noStore ? this.lang : this.getLang
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  onSelectLang(lang: Auth.Language) {
    // Optionally update store
    if (!this.noStore) {
      this.setLang(lang)
      if (this.isLogged) {
        this.updateUser({ lang }).then(() => {
          // ? Note: instance prop $text is non-reactive, refresh the app
          window.location.reload()
        })
      } else if (this.$route.name === 'landing') {
        // ? Note: instance prop $text is non-reactive, refresh the app
        window.location.reload()
      }
    }

    this.$emit('onLangSelected', lang)
  }
}
</script>

<template>
  <v-menu :min-width="100">
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        :dark="dark"
        :title="$text.Language"
        :icon="!isText"
        :outlined="isText"
      >
        <span v-if="isText">{{ selectedLang }}</span>
        <v-icon v-else>public</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="item in languages"
        @click="onSelectLang(item)"
        :key="item"
        :class="{ 'active-lang': selectedLang == item }"
      >
        <v-list-item-title class="text-xs-center">
          {{ item.toUpperCase() }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style lang="scss" scoped>
.active-lang {
  background: #dddddd;
  color: white;
}
</style>
