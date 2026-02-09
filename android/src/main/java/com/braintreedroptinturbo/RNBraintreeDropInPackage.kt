package com.braintreedroptinturbo

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class RNBraintreeDropInPackage : TurboReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == RNBraintreeDropInModule.NAME) {
            RNBraintreeDropInModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
            val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            moduleInfos[RNBraintreeDropInModule.NAME] = ReactModuleInfo(
                RNBraintreeDropInModule.NAME,
                RNBraintreeDropInModule::class.java.name,
                false,  // canOverrideExistingModule
                false,  // needsEagerInit
                true,   // hasConstants
                false,  // isCxxModule
                isTurboModule // isTurboModule
            )
            moduleInfos
        }
    }
}
