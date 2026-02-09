package com.braintreedroptinturbo

import androidx.fragment.app.FragmentActivity
import com.braintreepayments.api.BraintreeClient
import com.braintreepayments.api.Card
import com.braintreepayments.api.CardClient
import com.braintreepayments.api.CardNonce
import com.braintreepayments.api.ClientTokenCallback
import com.braintreepayments.api.DataCollector
import com.braintreepayments.api.DropInClient
import com.braintreepayments.api.DropInListener
import com.braintreepayments.api.DropInRequest
import com.braintreepayments.api.DropInResult
import com.braintreepayments.api.GooglePayRequest
import com.braintreepayments.api.ThreeDSecureRequest
import com.braintreepayments.api.UserCanceledException
import com.braintreepayments.api.VenmoPaymentMethodUsage
import com.braintreepayments.api.VenmoRequest
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.google.android.gms.wallet.TransactionInfo
import com.google.android.gms.wallet.WalletConstants

@ReactModule(name = RNBraintreeDropInModule.NAME)
class RNBraintreeDropInModule(reactContext: ReactApplicationContext) :
    NativeRNBraintreeDropInSpec(reactContext) {

    private var isVerifyingThreeDSecure = false

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    override fun show(options: ReadableMap, promise: Promise) {
        isVerifyingThreeDSecure = false

        if (!options.hasKey("clientToken")) {
            promise.reject("NO_CLIENT_TOKEN", "You must provide a client token")
            return
        }

        val currentActivity = currentActivity as? FragmentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "There is no current activity")
            return
        }

        val dropInRequest = DropInRequest()

        // Vault Manager
        if (options.hasKey("vaultManager")) {
            dropInRequest.isVaultManagerEnabled = options.getBoolean("vaultManager")
        }

        // Google Pay
        if (options.hasKey("googlePay") && options.getBoolean("googlePay")) {
            val googlePayRequest = GooglePayRequest().apply {
                setTransactionInfo(
                    TransactionInfo.newBuilder()
                        .setTotalPrice(options.getString("orderTotal") ?: "0.00")
                        .setTotalPriceStatus(WalletConstants.TOTAL_PRICE_STATUS_FINAL)
                        .setCurrencyCode(options.getString("currencyCode") ?: "USD")
                        .build()
                )
                isBillingAddressRequired = true
                googleMerchantId = options.getString("googlePayMerchantId")
            }

            dropInRequest.isGooglePayDisabled = false
            dropInRequest.googlePayRequest = googlePayRequest
        } else {
            dropInRequest.isGooglePayDisabled = true
        }

        // Card Disabled
        if (options.hasKey("cardDisabled")) {
            dropInRequest.isCardDisabled = options.getBoolean("cardDisabled")
        }

        // Venmo
        if (options.hasKey("venmo") && options.getBoolean("venmo")) {
            val venmoRequest = VenmoRequest(VenmoPaymentMethodUsage.MULTI_USE)
            dropInRequest.venmoRequest = venmoRequest
            dropInRequest.isVenmoDisabled = false
        } else {
            dropInRequest.isVenmoDisabled = true
        }

        // 3D Secure
        if (options.hasKey("threeDSecure")) {
            val threeDSecureOptions = options.getMap("threeDSecure")
            if (threeDSecureOptions == null || !threeDSecureOptions.hasKey("amount")) {
                promise.reject("NO_3DS_AMOUNT", "You must provide an amount for 3D Secure")
                return
            }

            isVerifyingThreeDSecure = true

            val threeDSecureRequest = ThreeDSecureRequest().apply {
                amount = threeDSecureOptions.getString("amount")
            }

            dropInRequest.threeDSecureRequest = threeDSecureRequest
        }

        // PayPal
        dropInRequest.isPayPalDisabled = !options.hasKey("payPal") || !options.getBoolean("payPal")

        clientToken = options.getString("clientToken")

        if (dropInClient == null) {
            promise.reject(
                "DROP_IN_CLIENT_UNINITIALIZED",
                "Did you forget to call RNBraintreeDropInModule.initDropInClient(this) in MainActivity.onCreate?"
            )
            return
        }

        dropInClient!!.setListener(object : DropInListener {
            override fun onDropInSuccess(dropInResult: DropInResult) {
                val paymentMethodNonce = dropInResult.paymentMethodNonce

                if (isVerifyingThreeDSecure && paymentMethodNonce is CardNonce) {
                    val threeDSecureInfo = paymentMethodNonce.threeDSecureInfo
                    if (!threeDSecureInfo.isLiabilityShiftPossible) {
                        promise.reject(
                            "3DSECURE_NOT_ABLE_TO_SHIFT_LIABILITY",
                            "3D Secure liability cannot be shifted"
                        )
                    } else if (!threeDSecureInfo.isLiabilityShifted) {
                        promise.reject(
                            "3DSECURE_LIABILITY_NOT_SHIFTED",
                            "3D Secure liability was not shifted"
                        )
                    } else {
                        resolvePayment(dropInResult, promise)
                    }
                } else {
                    resolvePayment(dropInResult, promise)
                }
            }

            override fun onDropInFailure(exception: Exception) {
                if (exception is UserCanceledException) {
                    promise.reject("USER_CANCELLATION", "The user cancelled")
                } else {
                    promise.reject(exception.message, exception.message)
                }
            }
        })

        dropInClient!!.launchDropIn(dropInRequest)
    }

    @ReactMethod
    override fun fetchMostRecentPaymentMethod(clientToken: String, promise: Promise) {
        val currentActivity = currentActivity as? FragmentActivity

        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "There is no current activity")
            return
        }

        if (dropInClient == null) {
            promise.reject(
                "DROP_IN_CLIENT_UNINITIALIZED",
                "Did you forget to call RNBraintreeDropInModule.initDropInClient(this) in MainActivity.onCreate?"
            )
            return
        }

        Companion.clientToken = clientToken

        dropInClient!!.fetchMostRecentPaymentMethod(
            currentActivity
        ) { dropInResult: DropInResult?, error: Exception? ->
            if (error != null) {
                promise.reject(error.message, error.message)
            } else if (dropInResult == null) {
                promise.resolve(null)
            } else {
                resolvePayment(dropInResult, promise)
            }
        }
    }

    @ReactMethod
    override fun tokenizeCard(clientToken: String, cardInfo: ReadableMap, promise: Promise) {
        if (!cardInfo.hasKey("cvv")) {
            promise.reject("INVALID_CARD_INFO", "CVV is required")
            return
        }

        val onlyCVV = cardInfo.hasKey("onlyCVV") && cardInfo.getBoolean("onlyCVV")

        if (!onlyCVV) {
            if (!cardInfo.hasKey("number") ||
                !cardInfo.hasKey("expirationMonth") ||
                !cardInfo.hasKey("expirationYear") ||
                !cardInfo.hasKey("postalCode")
            ) {
                promise.reject("INVALID_CARD_INFO", "Invalid card info")
                return
            }
        }

        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "There is no current activity")
            return
        }

        val braintreeClient = BraintreeClient(currentActivity, clientToken)
        val cardClient = CardClient(braintreeClient)

        val card = Card().apply {
            if (!onlyCVV) {
                number = cardInfo.getString("number")
                expirationMonth = cardInfo.getString("expirationMonth")
                expirationYear = cardInfo.getString("expirationYear")
                postalCode = cardInfo.getString("postalCode")
            }
            cvv = cardInfo.getString("cvv")
        }

        cardClient.tokenize(card) { cardNonce: CardNonce?, error: Exception? ->
            if (error != null) {
                promise.reject("TOKENIZE_ERROR", error.message, error)
            } else if (cardNonce == null) {
                promise.reject("NO_CARD_NONCE", "Card nonce is null")
            } else {
                val jsResult = Arguments.createMap().apply {
                    putString("type", "card")
                    putString("nonce", cardNonce.string)
                }

                val dataCollector = DataCollector(braintreeClient)
                dataCollector.collectDeviceData(currentActivity) { deviceData: String?, err: Exception? ->
                    if (deviceData != null) {
                        jsResult.putString("deviceData", deviceData)
                        promise.resolve(jsResult)
                    } else {
                        promise.reject("DEVICE_DATA_ERROR", "Failed to collect device data", err)
                    }
                }
            }
        }
    }

    @ReactMethod
    override fun collectDeviceData(clientToken: String, promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "There is no current activity")
            return
        }

        val braintreeClient = BraintreeClient(currentActivity, clientToken)
        val dataCollector = DataCollector(braintreeClient)

        dataCollector.collectDeviceData(currentActivity) { deviceData: String?, error: Exception? ->
            if (deviceData != null) {
                promise.resolve(deviceData)
            } else {
                promise.reject("DEVICE_DATA_ERROR", "Failed to collect device data", error)
            }
        }
    }

    private fun resolvePayment(dropInResult: DropInResult, promise: Promise) {
        val deviceData = dropInResult.deviceData
        val paymentMethodNonce = dropInResult.paymentMethodNonce

        if (paymentMethodNonce == null) {
            promise.resolve(null)
            return
        }

        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "There is no current activity")
            return
        }

        val dropInPaymentMethod = dropInResult.paymentMethodType
        if (dropInPaymentMethod == null) {
            promise.reject("NO_PAYMENT_METHOD", "There is no payment method")
            return
        }

        val jsResult = Arguments.createMap().apply {
            putString("nonce", paymentMethodNonce.string)
            putString("type", currentActivity.getString(dropInPaymentMethod.localizedName))
            putString("description", dropInResult.paymentDescription)
            putBoolean("isDefault", paymentMethodNonce.isDefault)
            putString("deviceData", deviceData)
        }

        promise.resolve(jsResult)
    }

    companion object {
        const val NAME = "RNBraintreeDropIn"
        
        private var dropInClient: DropInClient? = null
        private var clientToken: String? = null

        @JvmStatic
        fun initDropInClient(activity: FragmentActivity) {
            dropInClient = DropInClient(activity) { callback: ClientTokenCallback ->
                if (clientToken != null) {
                    callback.onSuccess(clientToken!!)
                } else {
                    callback.onFailure(Exception("Client token is null"))
                }
            }
        }
    }
}
