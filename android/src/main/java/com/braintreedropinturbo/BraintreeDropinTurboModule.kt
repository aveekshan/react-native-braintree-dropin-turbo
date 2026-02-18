package com.braintreedropinturbo

import com.facebook.react.bridge.ReactApplicationContext

class BraintreeDropinTurboModule(reactContext: ReactApplicationContext) :
  NativeBraintreeDropinTurboSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeBraintreeDropinTurboSpec.NAME
  }
}
