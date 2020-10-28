<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component } from 'vue-property-decorator'
import { DocsS, TemplatesS } from '@/types/'
import ButtonsPanel from '@/components/ButtonsPanel.vue'
import TheBreadcrumbs from '@/components/TheBreadcrumbs.vue'
import { finderById } from '../utils/helpers'
import { Routes } from '../router'

type Document = Docs.Record
type Record = Templates.Record

@Component({
  components: {
    ButtonsPanel,
    TheBreadcrumbs
  }
})
export default class TheTemplate extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  @G(...DocsS.records) docs: Docs.Record[]
  @G(...TemplatesS.records) templates: Templates.Record[]
  @A(...TemplatesS.create) vuexCreate: Templates.CreateA
  @A(...TemplatesS.delete) vuexDelete: Templates.DeleteA

  // * === === === === === === === === === ===
  // * Data  🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏 🍏

  selected: null | Record = null
  tab = this.tabs[0].name

  // * === === === === === === === === === ===
  // * Computed 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙 🌙

  get template() {
    const templateId = this.$route.params.templateId
    const findById = finderById(templateId)

    return this.templates.find(findById)
  }

  get tabs() {
    return [
      { name: 'Results', to: Routes.template.children.results.name }
      // { name: 'Documents', to: Routes.template.children.docs.name }
    ]
  }

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  getPath(name: string) {
    return { name, params: { templateId: this.template && this.template.id } }
  }

  // * 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀 💀
}
</script>

<template>
  <div v-if="template">
    <v-container grid-list-md pa-0 ma-0 fluid>
      <v-layout wrap pa-0>
        <v-flex xs12 pa-0>
          <!-- Buttons panel - empty, for ui only-->
          <ButtonsPanel :buttons="[]" />

          <!-- Breadcrumbs Panel -->
          <TheBreadcrumbs
            :items="[
              [$text.Templates, '/templates'],
              [template.name, template.id]
            ]"
            router-mode
          />
        </v-flex>
        <v-flex xs12 pa-0 ml-5 mr-5 mb-3>
          <!-- <v-tabs v-model="tab" background-color="transparent" color="accent">
            <v-tab v-for="tab in tabs" :to="getPath(tab.to)" :key="tab.name">{{ tab.name }}</v-tab>
          </v-tabs>-->
          <!-- PAGES -->
          <router-view
            :template="template"
            :templates="templates"
            :docs="docs"
            style="margin-top:1rem"
          />
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<style lang="scss"></style>
