<script lang="ts">
import { Getter as G, Action as A } from 'vuex-class'
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { ArticlesS } from '@/types/'
import FormParser from '@/components/FormParser.vue'
import TheBreadcrumbs from './TheBreadcrumbs.vue'
import FormFields, { getRules } from '../stx/stxForms'
import { finderById } from '../utils/helpers'

//*===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯===🎯Main

@Component({ components: { TheBreadcrumbs, FormParser } })
export default class ArticleFeedbackForm extends Vue {
  //*===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧===💧Vuex

  @G(...ArticlesS.getRecords) articles: Articles.Record[]
  @A(...ArticlesS.createFeedback) createFeedback: Articles.CreateFeedbackA
  @G(...ArticlesS.getImprovements) improvements: Articles.Improvement[]

  //*===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜===👜Props

  @Prop(String) articleId: string

  //*===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎===🍎Data

  isLoading = false
  formFields: Types.FormField[] = FormFields.articleFeedback()
  isFeedback = false
  isFeedbackSubmitted = false

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed

  //* Checkbox is 1st element of forms array
  get isFeedbackUseful() {
    return this.formFields[0].value
  }

  //* True if reason "Other" is selected
  get isImprovementOther() {
    const ImprovementFieldIndex = 1
    const improvementId = this.formFields[ImprovementFieldIndex].value
    const findById = finderById(improvementId)
    const improvement = this.improvements.find(findById)
    if (!improvement) return false
    return improvement.text === 'Other'
  }

  //*===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀===👀Watchers

  //* If "Other" reason is selected - enforce rules
  @Watch('isImprovementOther', { immediate: true }) onImpr(value = true) {
    const RequiredRules = { min: 3, max: 500, required: true }
    this.formFields[2].rules = []
    if (value) {
      this.formFields[2].rules = getRules(RequiredRules)
    }

    this.formFields = [...this.formFields] //* Reactivity
  }

  @Watch('isFeedbackUseful', { immediate: true }) onFeedbackUpdated(
    value = true
  ) {
    this.formFields[1].hidden = value
    this.formFields = [...this.formFields] //* Reactivity
  }

  @Watch('improvements', { immediate: true }) onImprovementsUpdated(
    improvements: Articles.Improvement[] = this.improvements
  ) {
    const findImprovement = (field: Types.FormField) =>
      field.name === 'improvementId'

    const improvementField = this.formFields.find(findImprovement)
    if (!improvementField) return //* Exn: improvement not found

    improvementField.inputOptions = improvements
  }

  //*===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊===🌊Methods

  onSubmitFeedback(formData: Types.FormData) {
    this.isLoading = true
    const articleId = this.articleId
    this.createFeedback({ articleId, ...formData })
      .then((record: Articles.Feedback) => {
        this.isFeedbackSubmitted = true
        this.isLoading = false
        this.$showSnack(this.$msg.FeedbackCreateSuccess)
        this.$emit('onCreateFeedback', record)
        this.resetForm()
      })
      .catch(() => (this.isLoading = false))
  }

  resetForm() {
    this.formFields = FormFields.articleFeedback()
    this.onImprovementsUpdated()
    this.onFeedbackUpdated(true)
  }

  onFeedback(isHelpful: boolean) {
    if (isHelpful) {
      this.onSubmitFeedback({ isHelpful: true })
    } else {
      this.isFeedback = true
    }
  }
}
</script>

<template>
  <v-container v-if="!isFeedbackSubmitted">
    <v-row v-if="!isFeedback">
      <v-col>
        {{ $text.FeedbackHelpfulLabel }}
        <v-btn
          :loading="isLoading"
          small
          class="ml-4"
          color="green"
          dark
          @click="onFeedback(true)"
        >
          {{ $text.Yes }}
        </v-btn>
        <v-btn
          :loading="isLoading"
          small
          class="ml-4"
          color="red"
          dark
          @click="onFeedback(false)"
        >
          {{ $text.No }}
        </v-btn>
      </v-col>
    </v-row>

    <FormParser
      v-if="isFeedback"
      :isLoading="isLoading"
      :formFields.sync="formFields"
      :submitBtnText="$text.Submit"
      class="elevation-0"
      @onSubmit="onSubmitFeedback"
      @onCancel="isFeedback = false"
    />
  </v-container>
</template>

<style lang="scss" scoped>
$colorAccent: #cc2531;
</style>
