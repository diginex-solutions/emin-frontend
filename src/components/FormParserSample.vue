<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import FormParser from '@/components/FormParserV2.vue'
import FormFields from '@/stx/stxFormsV2'
import { $txt } from '@/plugins/i18n'

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Secondary

type AuthError = {
  code: string
  message: string
}

// Known error codes, needs to be extracted
// TODO: works only if key equals value
enum AuthErrorCodes {
  NoUser = 'NoUser',
  WrongPassword = 'WrongPassword'
}
const AuthErrorMessages: { [key in AuthErrorCodes]: any } = {
  [AuthErrorCodes.NoUser]: $txt.Documents,
  [AuthErrorCodes.WrongPassword]: $txt.WaitingResponse
}

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Primary

@Component({ components: { FormParser } })
export default class FormParserSample extends Vue {
  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  formFields: Types.FormFieldV2[] = FormFields.sample()
  error: null | AuthError = null

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  submitForm() {
    ;(this.$refs['FormParser'] as any)?.onSubmitForm()
  }

  async onSubmit(form: any) {
    // TODO: Do stuff

    //* Sample of handling errors
    this.handleError({
      code: 'Code from server, can be anything',
      message: 'Message from server, can be anything'
    })
    // OR - if code is known, message will be pulled from translations
    // this.handleError({
    //   code: AuthErrorCodes.WrongPassword,
    //   message: 'Message from server, can be anything'
    // })
  }

  handleError(err: any) {
    this.error = {
      code: err.code,
      message: err.message
    }

    //* If error code is familiar - Override errors with custom messages
    const code = err.code
    if (code in AuthErrorCodes) {
      this.error.message = AuthErrorMessages[code as AuthErrorCodes]()
    }
  }
}
</script>

<template>
  <div class="form-parser-sample">
    <FormParser
      ref="FormParser"
      :isLoading="isLoading"
      :formFields="formFields"
      @onSubmit="onSubmit"
    >
      <template v-slot:default>
        <!-- A way to handle custom errors -->
        <v-alert
          v-if="error"
          dense
          outlined
          dismissible
          type="error"
          transition="slide-y-transition"
        >
          {{ error.message }}
        </v-alert>

        <v-btn
          :loading="isLoading"
          block
          outlined
          height="60"
          class="mt-5"
          @click="submitForm"
        >
          Submit
        </v-btn>
      </template>
    </FormParser>
  </div>
</template>

<style lang="scss" scoped>
.form-parser-sample {
}
</style>
