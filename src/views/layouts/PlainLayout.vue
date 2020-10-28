<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class PlainLayout extends Vue {}
</script>

<template>
  <div>
    <router-view />
  </div>
</template>
