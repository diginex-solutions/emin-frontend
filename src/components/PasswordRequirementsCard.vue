<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { validator } from '../utils/validator'
import { ValidationParams } from './RegisterDialog.vue'

@Component({})
export default class PasswordRequirementsCard extends Vue {
  // * === === === === === === === === === ===
  // * Vuex 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧 💧

  // * === === === === === === === === === ===
  // * Props 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜 👜

  @Prop(String) password: string
  @Prop(Object) validationParams: ValidationParams

  // * === === === === === === === === === ===
  // * Data 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎 🍎

  greenIntensityLimit = 200 // out of 255

  //*===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏===🍏Computed
  get requirements() {
    return [
      [this.isLongEnough, this.$text.SignUpTipMinChar],
      [this.mixedLetters, this.$text.SignUpTipMixedLetters],
      [this.containsNumber, this.$text.SignUpTipOneNumber],
      [this.containsSpecialChar, this.$text.SignUpTipSpecialChar]
    ]
  }

  get isLongEnough() {
    return this.strictlyTrue(
      validator.moreOrEqual(this.password, this.validationParams.password.min)
    )
  }

  get mixedLetters() {
    return (
      this.strictlyTrue(validator.oneLowerCase(this.password)) &&
      this.strictlyTrue(validator.oneUpperCase(this.password))
    )
  }

  get containsNumber() {
    return this.strictlyTrue(validator.oneNumber(this.password))
  }

  get containsSpecialChar() {
    return this.strictlyTrue(validator.oneSpecialChar(this.password))
  }

  get progress() {
    let progress = 0
    const length = this.password?.length || 0
    const filledRate = length / this.validationParams.password.min
    progress += 0.55 * Math.min(filledRate, 1)
    progress += this.containsNumber ? 0.15 : 0
    progress += this.containsSpecialChar ? 0.15 : 0
    progress += this.mixedLetters ? 0.15 : 0
    return progress
  }

  get getColorBar() {
    const limitAtEnd = this.progress > 0.85 ? this.greenIntensityLimit : 255
    return `rgb(
        ${(1 - this.progress) * 255 * 2},
        ${Math.min(limitAtEnd, this.progress * 255 * 2)},
        0)`
  }

  // * === === === === === === === === === ===
  // * Hooks 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌 🦌

  // * === === === === === === === === === ===
  // * Methods 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊 🌊

  strictlyTrue(thing: any): boolean {
    return thing === true
  }

  getColorIcon(el: boolean) {
    return el ? `rgb(0,${this.greenIntensityLimit},0)` : 'rgb(180,180,180)'
  }
}
</script>

<template>
  <v-card class="popup" style="background-color: rgb(245,245,245)">
    <div>{{ $text.SignUpTipNotice }}</div>

    <template v-for="[test, translation] in requirements">
      <div :key="translation" class="d-flex">
        <v-icon :color="getColorIcon(test)">mdi-check-circle-outline</v-icon>
        {{ translation }}
      </div>
    </template>

    <div class="pt-2">{{ $text.Strength }}:</div>
    <div class="progress-bar-wrapper">
      <div
        class="progress"
        :style="{ width: progress * 100 + '%', backgroundColor: getColorBar }"
      ></div>
    </div>
    <div class="pt-2">{{ $text.SignUpTipAdvice }}</div>
  </v-card>
</template>

<style lang="scss">
.popup {
  position: absolute;
  max-width: 260px;
  font-size: 0.9rem;
  padding: 0.8rem;
  opacity: 0;
  z-index: 1;
  color: black !important;
  transition: opacity 0.3s;
  pointer-events: none;
}

.v-input--is-focused + .popup {
  opacity: 1;
}

.mdi-check-circle-outline::before {
  font-size: 1.1rem !important;
  margin-right: 0.5rem;
}

.progress-bar-wrapper {
  background-color: rgb(180, 180, 180);
  height: 0.3rem;
  border-radius: 0.2rem;
  overflow: hidden;
}

.progress {
  background-color: white;
  height: 0.3rem;
  transition: width 0.3s, background-color 0.3s;
}
</style>
