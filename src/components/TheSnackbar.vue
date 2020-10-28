<script lang="ts">
/*
  Snackbar component for flashing messages.

  Usage:

  // map the action
  @Action("showSnackbar")
  showSnackbar: SnackbarActionType;

  // dispatch action and pass message
  this.showSnackbar("Some test messaage");

*/

import { Vue, Component, Watch } from 'vue-property-decorator'
import { Getter as G, Action as A } from 'vuex-class'
import { RootA, RootG } from '@/types/'
import { Msg, SnackIcons } from '@/plugins/i18n'

export interface SnackType {
  type: Msg
  data?: string | number
}

interface SnackbarMessage {
  icon?: string
  text: string
}

@Component({})
export default class TheSnackbar extends Vue {
  @A(RootA.showSnackbar) showSnackbar: Store.ActionShowSnackbar
  @G(RootG.snackbarMessageGet) snackbarMessageGet: string

  message: SnackbarMessage = { text: '' }
  show = true
  defaultTimeout = 6000
  timeoutFunc: Types.Timeout = undefined

  @Watch('snackbarMessageGet')
  onMsgChange(msg: string | any) {
    const EmptySnack = ''
    const DefaultIcon = 'info'

    if (msg === EmptySnack) {
      return
    }

    const type = msg?.type || msg

    // If msg is known - display, else - it's known message
    if (type in Msg) {
      const icon = SnackIcons[type as Msg]

      // handle known messages
      const data = msg.data
      this.message = {
        icon: icon || DefaultIcon,
        text: this.$i18n.tc(type, 0, {
          data
        })
      }
    } else if (typeof msg === 'string') {
      // handle simple texts
      this.message = { text: msg }
    } else {
      // handle custom snacks
      this.message = msg
    }

    this.show = true

    // clear store
    this.showSnackbar(EmptySnack)

    clearTimeout(this.timeoutFunc)
    this.timeoutFunc = setTimeout(() => {
      this.show = false
    }, this.defaultTimeout)
  }
}
</script>

<template>
  <v-snackbar
    v-if="message.text"
    v-model="show"
    :timeout="0"
    right
    bottom
    vertical
    color="white"
    class="snackbar"
  >
    <div class="snackbar-content">
      <div class="header">
        <div class="header__title">
          <v-icon v-if="message.icon" class="action-icon">
            {{ message.icon }}
          </v-icon>
          <span v-html="message.text" />
          <v-btn icon class="close-btn" color="gray" @click="show = false">
            <v-icon color="#aaaaaa" size="20">close</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </v-snackbar>
</template>

<style scoped lang="scss">
$colorAccent: #cc2531;

.snackbar {
  z-index: 1002;
  padding: 1em;
  color: #666666;
}

.snackbar-content {
  padding-bottom: 9px;

  .header {
    &__title {
      font-size: 1.5em;
      padding: 0;
      display: flex;
      align-items: center;

      span {
        flex-grow: 1;
        padding: 0 7px;
      }

      .action-icon {
        color: $colorAccent;
      }
    }

    .close-btn {
      margin-top: 0;
      align-self: self-end;
    }
  }
}
</style>
