<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { config } from '@/utils/config'
import TheShowcase from '@/components/TheShowcase.vue'
import RegisterDialog from '@/components/RegisterDialog.vue'
import SigninDialog from '@/components/SigninDialog.vue'
import ResetPasswordDialog from '@/components/ResetPasswordDialog.vue'
import LangSelector from '@/components/LangSelector.vue'

import { AuthS } from '@/types/'
import Stx from '@/types/stx.ts'

//* Create empty user obj - Need to return new object, otherwise reactivity issues
const emptyUnauthedUser = (): Auth.UnauthedUser => {
  return {
    email: '',
    name: '',
    surname: '',
    lang: 'en',
    token: ''
  }
}

@Component({
  components: {
    TheShowcase,
    RegisterDialog,
    SigninDialog,
    ResetPasswordDialog,
    LangSelector
  }
})
export default class TheLandingPage extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...AuthS.isLogged) isLogged: boolean
  @G(...AuthS.getUser) getUser: Auth.User
  @A(...AuthS.isEmailRegistered) isEmailRegistered: Auth.IsEmailRegisteredA

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isRegisterDialog = false
  isSigninDialog = false
  isUnauthed = false
  unauthedUser: Auth.UnauthedUser = emptyUnauthedUser()

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get getConfig() {
    return config
  }

  get isEnvLocal() {
    return config.env === Stx.env.local
  }

  get isMobile() {
    return this.$vuetify.breakpoint.xs
  }

  get getButtonsClass() {
    return this.isMobile ? 'col-12' : 'col-4'
  }

  get isResetPassword() {
    return this.$route.meta.resetPassword
  }

  set isResetPassword(value) {
    this.$router.push('/')
  }

  //*===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌===🦌Hooks

  mounted() {
    // need to wait for store to handle cache
    this.isUnauthed = typeof this.$route.query.auth !== 'undefined'

    //* Exn: If authed (auth/code) - go to documents or redirect to ms signin
    if (!this.isUnauthed) {
      this.$nextTick(() => {
        if (this.getUser) {
          return this.$router.push({ name: 'documents' })
        } else {
          // On local development, no redirect to MS
          if (!this.getConfig.minimalOverview && !this.isEnvLocal) {
            this.$router.push({ name: 'microsoft-signin' })
          }
        }
      })
      return
    }
    //* User is unauthed - handle signin/register cases

    type Lang = Auth.Language
    const langRaw = this.$route.query.lang as Lang

    const lang: Lang = Stx.lang.list.includes(langRaw)
      ? langRaw
      : Stx.lang.default

    const isRegisteredQuery = this.$route.query.isRegistered as string
    const isRegistered = isRegisteredQuery === 'true'

    this.unauthedUser = {
      email: this.$route.query.email as string,
      name: this.$route.query.name as string,
      surname: this.$route.query.surname as string,
      token: this.$route.query.token as string,
      lang
    }

    this.isSigninDialog = isRegistered || !this.unauthedUser.email
    this.isRegisterDialog = !this.isSigninDialog

    // if registration required - check user already completed procedure
    if (this.isRegisterDialog) {
      const handleRegister = (isExist: boolean) => {
        if (!isExist) return

        this.isSigninDialog = true
        this.isRegisterDialog = false
        this.$showSnack(this.$msg.userIsRegistered)
      }

      this.isEmailRegistered(this.unauthedUser.email).then(handleRegister)
    }
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onViewDocs() {
    this.$router.push({ path: 'overview' })
  }
}
</script>

<template>
  <div id="landing-page" v-show="getConfig.minimalOverview || isEnvLocal">
    <RegisterDialog
      v-if="isRegisterDialog"
      v-model="isRegisterDialog"
      :unauthedUser="unauthedUser"
      :isUnauthed.sync="isUnauthed"
    />
    <SigninDialog
      v-if="isSigninDialog"
      v-model="isSigninDialog"
      :unauthedUser="unauthedUser"
      :isUnauthed.sync="isUnauthed"
    />

    <ResetPasswordDialog v-if="isResetPassword" v-model="isResetPassword" />

    <!-- Margin is to accomodate for footer -->
    <v-content
      class="parallax-content"
      :class="{
        mobile: isMobile
      }"
    >
      <section>
        <v-parallax
          :src="`/img/landing-images/${getConfig.landingImageFileName}`"
          height="600"
          class="shadow"
        >
          <v-container
            fluid
            fill-height
            style="flex-direction: row; align-items: end;"
          >
            <v-toolbar style="width:100%;" color="transparent" flat>
              <v-toolbar-title>
                <a href="https://www.diginex.com">
                  <img src="/img/Diginex.png" alt="Diginex Logo" height="50" />
                </a>
              </v-toolbar-title>

              <div class="flex-grow-1"></div>

              <!-- TOOLBAR RIGHT: On mobile show only icon -->
              <v-toolbar-items>
                <v-btn
                  text
                  color="white"
                  href="https://www.diginex.com/customer-agreement/"
                  target="_blank"
                  :title="$text.TOS"
                >
                  <v-icon v-if="isMobile">mdi-book</v-icon>
                  <span v-else>{{ $text.TOS }}</span>
                </v-btn>

                <v-btn
                  text
                  color="white"
                  href="https://www.diginex.com/privacy-policy/"
                  target="_blank"
                  :title="$text.PrivacyPolicy"
                >
                  <v-icon v-if="isMobile">mdi-book-lock</v-icon>
                  <span v-else>{{ $text.PrivacyPolicy }}</span>
                </v-btn>

                <LangSelector dark />
              </v-toolbar-items>
            </v-toolbar>

            <v-layout column align-center justify-center class="white--text">
              <img
                :src="`/img/company-logos/${getConfig.logoFileName}`"
                alt="Logo"
                width="400"
              />

              <span v-if="isLogged">
                <v-btn
                  class="mt-12"
                  color="red darken-4"
                  dark
                  large
                  :to="{ path: 'documents' }"
                >
                  {{ $text.GoToApp }}
                </v-btn>
              </span>
              <span v-else>
                <v-row class="mt-12">
                  <v-col class="sign-btns" :class="getButtonsClass">
                    <v-btn
                      color="red darken-4"
                      dark
                      large
                      @click="isRegisterDialog = true"
                    >
                      {{ $text.SignUp }}
                    </v-btn>
                  </v-col>
                  <v-col class="sign-btns" :class="getButtonsClass">
                    <div>
                      <!-- // TODO: upper case filter -->
                      {{ $text.OR }}
                    </div>
                  </v-col>
                  <v-col class="sign-btns" :class="getButtonsClass">
                    <v-btn
                      color="red darken-4"
                      dark
                      large
                      @click="isSigninDialog = true"
                    >
                      {{ $text.SignIn }}
                    </v-btn>
                  </v-col>
                </v-row>
              </span>
            </v-layout>
          </v-container>
        </v-parallax>
      </section>

      <section v-show="!getConfig.minimalOverview && !isEnvLocal">
        <v-layout column wrap class="my-12" align-center>
          <v-flex xs12 sm4 class="my-4">
            <div class="text-center">
              <h2 class="headline">
                The best way to start securing your files
              </h2>
            </div>
          </v-flex>
          <v-flex xs12>
            <v-container grid-list-xl>
              <v-layout row wrap align-center>
                <v-flex xs12 md4>
                  <v-card flat class="transparent">
                    <v-card-text class="text-center">
                      <v-icon x-large class="accent--text">
                        mdi-account-group
                      </v-icon>
                    </v-card-text>
                    <v-card-title primary-title class="layout justify-center">
                      <div class="headline text-center">
                        {{ $text.LandingCta }}
                      </div>
                    </v-card-title>
                    <v-card-text>
                      <!-- TODO: i18n -->
                      Intuitive interface makes it easy to integrate
                      {{ getConfig.appName }} into your business workflow. It
                      takes minutes for new users to start using the
                      application, since the design of the application is
                      intended to provide a solution that doesn't require users
                      to be familiar with blockchain technoligies.
                    </v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card flat class="transparent">
                    <v-card-text class="text-center">
                      <v-icon x-large class="accent--text">mdi-lock</v-icon>
                    </v-card-text>
                    <v-card-title primary-title class="layout justify-center">
                      <div class="headline">{{ $text.Secure }}</div>
                    </v-card-title>
                    <v-card-text>
                      Every file in the system is timestamped using latest
                      blockchain technology, making it impossible for anyone to
                      tamper with files without being exposed.
                    </v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 md4>
                  <v-card flat class="transparent">
                    <v-card-text class="text-center">
                      <v-icon x-large class="accent--text">mdi-eye</v-icon>
                    </v-card-text>
                    <v-card-title primary-title class="layout justify-center">
                      <div class="headline text-center">
                        {{ $text.Transparency }}
                      </div>
                    </v-card-title>
                    <v-card-text>
                      All actions over files are being recorded on blockchain,
                      so it's easy to prove authenticity of files, access
                      grants, as well as access history.
                    </v-card-text>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-flex>
        </v-layout>
      </section>

      <section v-show="!getConfig.minimalOverview && !isEnvLocal">
        <v-layout column align-center justify-center>
          <TheShowcase />
        </v-layout>
      </section>
    </v-content>
    <v-footer id="footer" absolute>
      <section style="background: #f3f3f3; width: 100%">
        <v-container grid-list-xl>
          <v-layout row wrap justify-center class="my-12" style="width: 100%">
            <v-flex xs12 sm4>
              <v-card flat class="transparent">
                <v-card-title primary-title class="layout justify-center">
                  <div class="headline">
                    {{ $text.DiginexInfoTitle }}
                  </div>
                </v-card-title>
                <v-card-text>
                  {{ $text.DiginexInfo }}
                </v-card-text>
              </v-card>
            </v-flex>
            <v-flex xs12 sm4>
              <v-card flat class="transparent">
                <v-card-title primary-title class="layout justify-center">
                  <div class="headline">{{ $text.ContactUs }}</div>
                </v-card-title>
                <v-card-text>{{ $text.ContactUsAddressTitle }}</v-card-text>
                <v-list class="transparent">
                  <v-list-item>
                    <v-list-item-action>
                      <v-icon class="accent--text">mdi-map-marker</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ $text.ContactUsAddress }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-action>
                      <v-icon class="accent--text">mdi-phone</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>+852 2248 0600</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-action>
                      <v-icon class="accent--text">mdi-email</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>info@diginex.com</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-flex>
            <v-flex xs12 sm4>
              <v-card flat class="transparent">
                <v-card-title primary-title class="layout justify-center">
                  <div class="headline">{{ $text.Social }}</div>
                </v-card-title>
                <v-card-text>
                  <div
                    class="white--text ml-4 d-flex justify-center align-center"
                  >
                    <a
                      href="https://twitter.com/DiginexGlobal"
                      :title="$text.SocTwitterLink"
                      class="mr-5"
                    >
                      <v-icon>mdi-twitter</v-icon>
                    </a>
                    <a
                      href="https://www.linkedin.com/company/diginex-global"
                      :title="$text.SocLinkedinLink"
                      class="mr-5"
                    >
                      <v-icon>mdi-linkedin</v-icon>
                    </a>
                    <a
                      href="https://github.com/DIGINEX"
                      :title="$text.SocLinkedinLink"
                      class="mr-5"
                    >
                      <v-icon>mdi-github-circle</v-icon>
                    </a>
                  </div>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </section>
    </v-footer>
  </div>
</template>

<style lang="scss">
.mobile-parallax {
  min-height: 600px;
}

.v-parallax__content {
  background: rgba(0, 0, 0, 0.4);
  box-shadow: inset 0 0 100px #000000;
}

#landing-page {
  background: white;
  overflow-x: hidden;

  .parallax-content {
    margin-bottom: 400px;

    &.mobile {
      margin-bottom: 650px;
    }
  }
}

#footer {
  a {
    text-decoration: none;
    margin: 0 0.2em;
  }
}

.sign-btns {
  text-align: center;

  justify-content: center;
  align-items: center;
  display: flex;
}
</style>
