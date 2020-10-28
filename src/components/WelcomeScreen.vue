<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action as A } from 'vuex-class'
import { AuthS } from '@/types/'
import { config } from '@/utils/config'

@Component({})
export default class WelcomeScreen extends Vue {
  @A(...AuthS.hideWelcomeScreen) hideWelcomeScreen: Auth.HideWelcomeA

  isLoading = false
  appName = config.appName

  onGetStarted() {
    this.isLoading = true
    this.$nextTick(() => {
      this.hideWelcomeScreen()
    })
  }
}
</script>

<template>
  <transition name="t__fade-spinner">
    <div id="welcome-screen">
      <div class="content">
        <div class="title">
          <h1>Welcome to {{ appName }}</h1>
        </div>
        <div class="subtitle">
          {{ $text.WelcomeIntro }}
        </div>
        <div class="action">
          <v-btn color="accent" :loading="isLoading" @click="onGetStarted">
            {{ $text.WelcomeCta }}
          </v-btn>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
#welcome-screen {
  position: fixed;
  width: 100vw;
  height: 100vh;

  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 10000;

  justify-content: center;
  align-items: center;
  display: flex;

  .content {
    width: 800px;

    .title {
      text-align: center;
      h1 {
        color: white;
        font-size: 2.5rem;
      }
    }

    .action {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
      button {
        color: #dddddd;
      }
    }
  }
}
</style>
