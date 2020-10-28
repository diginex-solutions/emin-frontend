<script lang="ts">
/*
  ActionFillierVerify - verify page, user should accept/reject form before proceeding.
*/

import { Vue, Component, Prop } from 'vue-property-decorator'
import { FormStatuses } from '@/store/formsStore'

@Component({})
export default class ActionViewer extends Vue {
  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  notes = ''

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(Boolean) isLoading: boolean
  @Prop(Boolean) isAccept: boolean
  @Prop(Object) action: Forms.Record | null
  @Prop(Object) doc: Docs.Record

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  get isFilled() {
    const status = this.action && this.action.status
    const filled =
      status === FormStatuses.accepted || status === FormStatuses.rejected
    return filled ? status : false
  }

  get displayUser() {
    if (!this.action || !this.doc) {
      return ''
    }

    return this.action.initiator
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onSubmit(isAccept: boolean) {
    this.$emit('onSubmit', { isAccept, notes: this.notes })
  }
}
</script>

<template>
  <div id="action-filler-verify">
    <v-row>
      <v-col>
        <div v-if="action.message" class="mb-5">
          <h3 v-text="$text.Message" />
          <span style="white-space: pre-wrap;">
            {{ action.message.trim() }}
          </span>
        </div>
        <div>
          <h3 v-text="$text.File" />
          <a :href="doc.uri" @click.stop="updateStatusReceived">
            {{ doc | formatDocName }}
          </a>
          &nbsp;
          <span>({{ doc.size | filesize }})</span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="mt-1">
        <h3>
          <span v-text="$text.From" />
        </h3>
        <div v-if="displayUser && displayUser.email">
          <b>{{ $text.Email }}:</b>
          <span class="ml-1">{{ displayUser && displayUser.email }}</span>
        </div>
        <div v-if="displayUser.name">
          <b>{{ $text.Name }}:</b>
          <span class="ml-1">{{ displayUser && displayUser.name }}</span>
        </div>
        <div v-if="displayUser.surname">
          <b>{{ $text.Surname }}:</b>
          <span class="ml-1">{{ displayUser && displayUser.surname }}</span>
        </div>
        <div v-if="displayUser.company">
          <b>{{ $text.Company }}:</b>
          <span class="ml-1">{{ displayUser && displayUser.company }}</span>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="mt-1">
        <div v-if="action.dateCreated">
          <b>{{ $text.DateSent }}:</b>
          <span class="ml-1">{{ action.dateCreated | formatDateSimple }}</span>
        </div>
        <div v-if="action.dateReceived">
          <b>{{ $text.DateReceived }}:</b>
          <span class="ml-1">{{ action.dateReceived | formatDateSimple }}</span>
        </div>
        <div v-if="action.dateFilled">
          <b>{{ $text.DateFilled }}:</b>
          <span class="ml-1">{{ action.dateFilled | formatDateSimple }}</span>
        </div>
        <div v-if="action.notes">
          <b>{{ $text.Comments }}:</b>
          <span class="ml-1">{{ action.notes }}</span>
        </div>
      </v-col>
    </v-row>
    <v-divider />
    <v-row>
      <v-col>
        <div class="action-btn-wrapper">
          <v-btn
            v-if="isFilled !== 'accepted'"
            :loading="isLoading && !isAccept"
            :disabled="isLoading && isAccept"
            color="#444444"
            dark
            class="share-btn"
            :class="{ faded: isFilled === 'rejected' }"
            @click="onSubmit(false)"
          >
            <v-icon class="mr-1">close</v-icon>
            <span v-text="$text.Reject" />
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="isFilled !== 'rejected'"
            :loading="isLoading && isAccept"
            :disabled="(isLoading && !isAccept) || isFilled === 'rejected'"
            color="accent"
            @click="onSubmit(true)"
            class="share-btn white--text"
            :class="{ faded: isFilled === 'accepted' }"
          >
            <v-icon class="mr-1">check</v-icon>
            <span v-text="$text.Accept" />
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          outlined
          :label="$text.Comments"
          rows="2"
          :auto-grow="true"
          :placeholder="$text.CommentsPlaceholder"
          v-model="notes"
        ></v-textarea>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
#action-filler-verify {
  .action-btn-wrapper {
    justify-content: center;
    align-items: flex-end;
    padding: 10px;
    display: flex;

    .share-btn {
      height: 50px;
    }

    .faded {
      pointer-events: none;
      opacity: 0.5;
    }
  }
}
</style>
