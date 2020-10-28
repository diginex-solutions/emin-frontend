<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action as A, Getter as G } from 'vuex-class'
import { AuthS } from '../types'
import { Routes } from '../router'
import { to } from '../utils/helpers'

@Component({})
export default class TheLoginV8 extends Vue {
  @G(...AuthS.getUser) getUser: Auth.User
  @A(...AuthS.loginV8) loginV8: Auth.LoginV8A
  @A(...AuthS.logout) logout: Auth.LogoutA

  async mounted() {
    //* User is logged - force logout
    if (this.getUser) {
      const noRedirect = true
      await to(this.logout(noRedirect))
    }
    const jwt = String(this.$route.query.jwt || '')
    if (!jwt) {
      // this.$showSnack(this.$msg.NoJwtToken)
      const name = Routes.root.name
      return this.$router.push({ name })
    }

    const [err, res] = await to(this.loginV8(jwt))
    if (err) return //? exn

    this.gotoLanding()
  }

  gotoLanding() {
    let redirectTo = String(this.$route.query.landing || '')
    if (!redirectTo) {
      redirectTo = Routes.documents.name
    }
    setTimeout(() => {
      this.$router.push({ path: '/' + redirectTo })
    }, 1000)
  }
}
</script>

<template>
  <div></div>
</template>
