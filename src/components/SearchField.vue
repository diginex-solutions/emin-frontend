<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Action as A } from 'vuex-class'
import { ArticlesS } from '@/types/'
import _ from 'lodash'

import SpaceSelector from './SpaceSelector.vue'

interface VueRef extends Element {
  focus(): () => void
}

@Component({
  components: { SpaceSelector }
})
export default class TheNavbar extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @A(...ArticlesS.fetch) fetchArticles: Articles.FetchA

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Boolean) drawer: boolean

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  debounceUpdate = _.debounce(this.onUpdateQuery, 150)
  query = ''

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  // onActivate: to manually trigger this loader component - set vuex state `loaderActive` to true

  // @Watch('query')
  // onSearchQueryUpdate(value: string) {
  //   if (value === '') this.query = ''
  // }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onUpdateQuery(q: string) {
    //TODO: dispatch to re-fetch articles
    // // Handle case for initial page load
    // this.updateSearchQuery(query)

    // Update route
    const routeQuery = { ...this.$route.query, q }
    this.$router
      .push({ query: routeQuery })
      .then(() => {
        this.$nextTick(() => this.fetchArticles())
      })
      .catch(() => null)
  }

  // If on mount route query is set - update state search query
  mounted() {
    const query = this.$route.query.q as string
    if (query) {
      this.query = String(query)
      this.onUpdateQuery(query)
    }
  }
}
</script>

<template>
  <v-text-field
    solo
    :label="$text.ArticlesSearch"
    prepend-inner-icon="search"
    class="search-box"
    v-model="query"
    @input="debounceUpdate"
    ref="searchInput"
  />
</template>

<style lang="scss">
$colorAccent: #cc2531;

// Navbar-highlighting is propagated from parent

.search-box {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: 2px solid rgba(0, 0, 0, 0.1) !important;

  /* ? to offset elements after right separator (gray border)*/
  margin-right: 1rem;

  input {
    color: gray !important;
  }

  .v-input__append-inner {
    display: none !important;
  }
}
</style>
