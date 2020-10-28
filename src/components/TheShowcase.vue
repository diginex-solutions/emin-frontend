<script lang="ts">
// testip 193.202.297.188

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
const throttle = (func: (e: any) => void, wait: number, options: any = {}) => {
  let context: any
  let args: any
  let result: any
  let timeout: any = null
  let previous = 0

  if (!options) {
    options = {}
  }
  const later = () => {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) {
      context = args = null
    }
  }
  return function() {
    const now = Date.now()
    if (!previous && options.leading === false) {
      previous = now
    }
    const remaining = wait - (now - previous)

    // TODO: this is weird, fix required
    // eslint-disable-next-line
    // @ts-ignore
    context = this as any // eslint-disable-line
    args = arguments // eslint-disable-line

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) {
        context = args = null
      }
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

type RefCta = any
type RefShowcase = any

import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({})
export default class TheShowcase extends Vue {
  throttledHandle: any = null
  scImageNames: any = [1, 2, 3, 4, 5]

  // handleScroll: go through showcase images, if visible and within field of viewport - show; Handle cta
  handleScroll(event: any) {
    const screenHalfHeight = document.documentElement.clientHeight / 2

    // SHOWCASE: go through each item, if not visible - check if should display
    const showcaseItems = this.$refs.showcase__items as RefShowcase
    showcaseItems.forEach((scImage: any) => {
      if (scImage.classList.contains('visible')) {
        return
      }

      const elementDistance = scImage.getBoundingClientRect().top
      if (elementDistance < screenHalfHeight) {
        scImage.classList.add('visible')
      }
    })

    // CTA: sticky-fix
    // prepare variables
    const scCta = this.$refs.sc__cta as RefCta
    const ctaParent = scCta.parentElement

    const ctaParentHeight = ctaParent.offsetHeight
    let ctaParentPadding: any = window
      .getComputedStyle(ctaParent, null)
      .getPropertyValue('padding-top')
    ctaParentPadding = parseFloat(ctaParentPadding)
    const scCtaHeight = scCta.offsetHeight

    // reset classlist for cta and check if mobile - stop if so
    scCta.classList.remove('stick-bottom')
    scCta.classList.remove('fixed')
    if (ctaParentHeight <= scCtaHeight + ctaParentPadding * 2) {
      return
    }

    // figure out distanse to the whole block, plus cta to screen edge distance
    const ctaParentDistance = -1 * ctaParent.getBoundingClientRect().top // how much of div overflows to top in pixels
    const ctaToScreenDistance =
      screenHalfHeight - scCtaHeight / 2 - ctaParentPadding

    // now check if top and bottom distance relative to parent is valid (if inside the)
    const isTopValid = ctaParentDistance > -ctaToScreenDistance
    const isBottomValid =
      ctaParentDistance <
      ctaParentHeight - (screenHalfHeight * 2 - ctaToScreenDistance)
    if (isTopValid && isBottomValid) {
      scCta.classList.add('fixed')
    } else if (isTopValid && !isBottomValid) {
      scCta.classList.add('stick-bottom')
    }
  }

  // === === === === === === === === === ===
  // COMPUTED

  get isSmallScreen() {
    return (
      this.$vuetify.breakpoint.xs ||
      this.$vuetify.breakpoint.sm ||
      this.$vuetify.breakpoint.md
    )
  }

  mounted() {
    this.throttledHandle = throttle(this.handleScroll, 50, {})
    window.addEventListener('scroll', this.throttledHandle)
  }

  destroyed() {
    window.removeEventListener('scroll', this.throttledHandle)
  }
}
</script>

<template>
  <!-- // TODO: translations -->
  <div class="section" id="wb-showcase">
    <div class="container">
      <div class="showcase-wrapper" :class="{ 'go-mobile': isSmallScreen }">
        <div class="column is-4 sc__cta__wrapper">
          <div class="sc__cta" ref="sc__cta">
            <h2 class="sc__cta__header accent--text">Learning Trust is easy</h2>
            <span class="sc__cta__subtext">
              Intuitive interface makes using the application easy
            </span>
            <v-btn
              class="mt-12"
              color="primary"
              dark
              large
              href="https://appsource.microsoft.com/en-us/product/web-apps/diginex.diginex-trust-app"
            >
              View At AppSource
            </v-btn>
          </div>
        </div>
        <div class="column is-8">
          <div class="showcase">
            <div
              v-for="id in scImageNames"
              :id="'showcase__item__' + id"
              :key="id"
            >
              <img
                :src="`/img/landing-images/showcase/${id}.png`"
                ref="showcase__items"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.showcase-wrapper {
  display: flex;

  &.go-mobile {
    flex-direction: column;

    .sc__cta {
      margin-left: auto;
      margin-right: auto;
    }
  }
}

.sc__cta__wrapper {
  $ctaWrapperPadding: 45;
  $ctaWidth: 300;

  padding: 0;
  position: relative;
  min-width: #{$ctaWidth + $ctaWrapperPadding}px;

  .sc__cta {
    position: relative;
    width: #{$ctaWidth}px;
    height: #{$ctaWidth}px;

    display: flex;
    flex-direction: column;

    &.fixed {
      position: fixed;
      top: 50%;
      transform: translate(0, -50%);
    }

    &.stick-bottom {
      top: unset;
      position: absolute;
      bottom: 0px;
    }

    &__header {
      font-size: 40px;
      line-height: 45px;
      color: #0084bb;
      font-family: serif;
      margin-bottom: 20px;
    }

    &__subtext {
      font-size: 20px;
      color: #566465;
      margin-bottom: 20px;
    }
  }
}

// sc-position: calculate grid area for given row position, and alignment (left, right, center)
@mixin sc-position($posX, $align, $imgWidth: 8, $imgHeight: 5) {
  $posY: 1 !default;
  @if $align == center {
    $posY: 2;
  } @else if $align == right {
    $posY: 3;
  }

  $imgHeightSpan: span $imgHeight;
  $imgWidthSpan: span $imgWidth;
  grid-area: #{$posX} / #{$posY} / #{$imgHeightSpan} / #{$imgWidthSpan};
}

// next-position: update given position for next showcase element - add height plus offset
@function next-position($position, $offset) {
  $itemHeight: 5;
  @return $position + $itemHeight + $offset;
}

.showcase {
  display: grid;
  grid-template-columns: repeat(10, 1fr);

  img {
    box-shadow: 3px 2px 15px 2px rgba(0, 0, 0, 0.5);
    transition: all 1s ease;
    opacity: 0;

    &.visible {
      opacity: 1;
    }
  }

  #showcase__item {
    $posCurrent: 1 !default;
    &__1 {
      @include sc-position($posCurrent, left);

      /* img {
        box-shadow: none;
      } */
    }

    &__2 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, right);
    }

    &__3 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, left);
    }

    &__4 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, center);
    }

    &__5 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, left);
      img {
        width: 800px;
      }
    }

    &__6 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, center);
    }

    &__7 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, right);
    }

    &__8 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, left);
    }

    &__9 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, right);
    }

    &__10 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, center);
    }

    &__11 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, right);
    }

    &__12 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, left);
    }

    &__13 {
      $posCurrent: next-position($posCurrent, -1);
      @include sc-position($posCurrent, center);
    }
  }
}
</style>
