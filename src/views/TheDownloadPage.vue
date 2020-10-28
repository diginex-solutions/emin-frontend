<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { routesApi } from '../router'

@Component({})
export default class TheDownloadPage extends Vue {
  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get getDownloadLink() {
    const accessCode = this.$route.query.access as string
    const shareId = this.$route.params.shareId

    if (!accessCode || !shareId) {
      return null
    }

    return routesApi.documents.download(accessCode, shareId)
  }
}
</script>

<template>
  <div>
    <div style="text-align:center;">
      <img width="300" :src="`/img/company-logos/${colorLogoFileName}`" />
    </div>

    <v-container grid-list-md pa-0>
      <v-layout wrap>
        <v-flex xs12>
          <div class="card-container">
            <v-card class="mx-auto" outlined min-width="100%">
              <v-card-title class="card-title">
                {{ $text.DownloadFile }}
              </v-card-title>
              <v-card-text style="text-align: center">
                <a
                  v-if="getDownloadLink"
                  :href="getDownloadLink"
                  v-text="getDownloadLink"
                />
                <span v-else>
                  Download link is broken, please check the url
                </span>
              </v-card-text>
            </v-card>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
