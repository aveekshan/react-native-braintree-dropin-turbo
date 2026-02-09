package com.braintreedroptinturbo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap

abstract class NativeRNBraintreeDropInSpec(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    abstract fun show(options: ReadableMap, promise: Promise)
    abstract fun fetchMostRecentPaymentMethod(clientToken: String, promise: Promise)
    abstract fun tokenizeCard(clientToken: String, cardInfo: ReadableMap, promise: Promise)
    abstract fun collectDeviceData(clientToken: String, promise: Promise)
}
