import Foundation
import UIKit
import PassKit
import BraintreeCore
import BraintreeDropIn
import BraintreeCard
import BraintreeDataCollector
import BraintreeApplePay
import BraintreeVenmo

@objc(RNBraintreeDropIn)
class RNBraintreeDropIn: NSObject {
    
    private var dataCollector: BTDataCollector?
    private var braintreeClient: BTAPIClient?
    private var paymentRequest: PKPaymentRequest?
    private var viewController: PKPaymentAuthorizationViewController?
    private var deviceDataCollector: String = ""
    private var currentResolve: RCTPromiseResolveBlock?
    private var currentReject: RCTPromiseRejectBlock?
    private var applePayAuthorized: Bool = false
    
    override init() {
        super.init()
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    func show(_ options: NSDictionary,
              resolve: @escaping RCTPromiseResolveBlock,
              reject: @escaping RCTPromiseRejectBlock) {
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.currentResolve = resolve
            self.currentReject = reject
            self.applePayAuthorized = false
            
            guard let clientToken = options["clientToken"] as? String else {
                reject("NO_CLIENT_TOKEN", "You must provide a client token", nil)
                return
            }
            
            // Setup color scheme
            var colorScheme: BTDropInUICustomization.ColorScheme = .light
            if let darkTheme = options["darkTheme"] as? Bool, darkTheme {
                if #available(iOS 13.0, *) {
                    colorScheme = .dynamic
                } else {
                    colorScheme = .dark
                }
            }
            
            let uiCustomization = BTDropInUICustomization(colorScheme: colorScheme)
            
            if let fontFamily = options["fontFamily"] as? String {
                uiCustomization.fontFamily = fontFamily
            }
            if let boldFontFamily = options["boldFontFamily"] as? String {
                uiCustomization.boldFontFamily = boldFontFamily
            }
            
            let request = BTDropInRequest()
            request.uiCustomization = uiCustomization
            
            // 3D Secure setup
            if let threeDSecureOptions = options["threeDSecure"] as? NSDictionary {
                guard let amount = threeDSecureOptions["amount"] as? NSNumber else {
                    reject("NO_3DS_AMOUNT", "You must provide an amount for 3D Secure", nil)
                    return
                }
                
                let threeDSecureRequest = BTThreeDSecureRequest()
                threeDSecureRequest.amount = NSDecimalNumber(value: amount.doubleValue)
                request.threeDSecureRequest = threeDSecureRequest
            }
            
            // Initialize API client and data collector
            let apiClient = BTAPIClient(authorization: clientToken)!
            self.dataCollector = BTDataCollector(apiClient: apiClient)
            self.dataCollector?.collectDeviceData { [weak self] deviceData in
                self?.deviceDataCollector = deviceData
            }
            
            // Vault manager
            if let vaultManager = options["vaultManager"] as? Bool, vaultManager {
                request.vaultManager = true
            }
            
            // Card disabled
            if let cardDisabled = options["cardDisabled"] as? Bool, cardDisabled {
                request.cardDisabled = true
            }
            
            // Apple Pay setup
            if let applePay = options["applePay"] as? Bool, applePay {
                self.setupApplePay(options: options, clientToken: clientToken, reject: reject)
                // Don't disable Apple Pay in request
            } else {
                request.applePayDisabled = true
            }
            
            // Venmo setup
            if let venmo = options["venmo"] as? Bool, venmo {
                request.venmoDisabled = false
            } else {
                request.venmoDisabled = true
            }
            
            // PayPal setup
            if let payPal = options["payPal"] as? Bool, !payPal {
                request.paypalDisabled = true
            }
            
            // Initialize Drop-In controller
            let dropIn = BTDropInController(authorization: clientToken, request: request) { [weak self] (controller, result, error) in
                guard let self = self else { return }
                
                controller.dismiss(animated: true) {
                    if let error = error {
                        self.currentReject?("DROP_IN_ERROR", error.localizedDescription, error)
                    } else if result?.isCanceled == true {
                        self.currentReject?("USER_CANCELLATION", "The user cancelled", nil)
                    } else if let result = result {
                        self.handleDropInResult(result, threeDSecureOptions: options["threeDSecure"] as? NSDictionary)
                    }
                }
            }
            
            if let dropIn = dropIn {
                guard let rootViewController = self.getRootViewController() else {
                    reject("NO_ROOT_VC", "Could not find root view controller", nil)
                    return
                }
                rootViewController.present(dropIn, animated: true, completion: nil)
            } else {
                reject("INVALID_CLIENT_TOKEN", "The client token seems invalid", nil)
            }
        }
    }
    
    private func setupApplePay(options: NSDictionary, clientToken: String, reject: @escaping RCTPromiseRejectBlock) {
        guard let merchantIdentifier = options["merchantIdentifier"] as? String,
              let countryCode = options["countryCode"] as? String,
              let currencyCode = options["currencyCode"] as? String,
              let merchantName = options["merchantName"] as? String,
              let orderTotal = options["orderTotal"] as? NSNumber else {
            reject("MISSING_OPTIONS", "Not all required Apple Pay options were provided", nil)
            return
        }
        
        self.braintreeClient = BTAPIClient(authorization: clientToken)
        
        let paymentRequest = PKPaymentRequest()
        paymentRequest.merchantIdentifier = merchantIdentifier
        paymentRequest.merchantCapabilities = .capability3DS
        paymentRequest.countryCode = countryCode
        paymentRequest.currencyCode = currencyCode
        paymentRequest.supportedNetworks = [.amex, .visa, .masterCard, .discover, .chinaUnionPay]
        
        let paymentSummaryItem = PKPaymentSummaryItem(
            label: merchantName,
            amount: NSDecimalNumber(value: orderTotal.doubleValue)
        )
        paymentRequest.paymentSummaryItems = [paymentSummaryItem]
        
        self.paymentRequest = paymentRequest
        
        if let vc = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) {
            vc.delegate = self
            self.viewController = vc
        }
    }
    
    private func handleDropInResult(_ result: BTDropInResult, threeDSecureOptions: NSDictionary?) {
        // Check for 3D Secure
        if let threeDSecureOptions = threeDSecureOptions,
           let cardNonce = result.paymentMethod as? BTCardNonce {
            
            if let threeDSecureInfo = cardNonce.threeDSecureInfo {
                if !threeDSecureInfo.liabilityShiftPossible && threeDSecureInfo.wasVerified {
                    self.currentReject?("3DSECURE_NOT_ABLE_TO_SHIFT_LIABILITY", "3D Secure liability cannot be shifted", nil)
                    return
                } else if !threeDSecureInfo.liabilityShifted && threeDSecureInfo.wasVerified {
                    self.currentReject?("3DSECURE_LIABILITY_NOT_SHIFTED", "3D Secure liability was not shifted", nil)
                    return
                }
            }
        }
        
        // Check for Apple Pay
        if result.paymentMethod == nil,
           let paymentMethodType = result.paymentMethodType?.rawValue,
           (16...18).contains(paymentMethodType) {
            // Apple Pay flow
            if let viewController = self.viewController,
               let rootViewController = self.getRootViewController() {
                rootViewController.present(viewController, animated: true, completion: nil)
            }
            return
        }
        
        // Check for Venmo
        if let venmoNonce = result.paymentMethod as? BTVenmoAccountNonce {
            let resultDict: [String: Any] = [
                "nonce": venmoNonce.nonce,
                "type": "Venmo",
                "description": "Venmo \(venmoNonce.username)",
                "isDefault": false,
                "deviceData": self.deviceDataCollector
            ]
            self.currentResolve?(resultDict)
            return
        }
        
        // Default payment method handling
        self.resolvePayment(result: result)
    }
    
    @objc
    func fetchMostRecentPaymentMethod(_ clientToken: String,
                                      resolve: @escaping RCTPromiseResolveBlock,
                                      reject: @escaping RCTPromiseRejectBlock) {
        
        BTDropInResult.mostRecentPaymentMethod(forClientToken: clientToken) { [weak self] (result, error) in
            if let error = error {
                reject("FETCH_ERROR", error.localizedDescription, error)
            } else if result?.isCanceled == true {
                reject("USER_CANCELLATION", "The user cancelled", nil)
            } else if let result = result {
                self?.resolvePayment(result: result)
                resolve(self?.buildResultDictionary(from: result))
            } else {
                resolve(nil)
            }
        }
    }
    
    @objc
    func tokenizeCard(_ clientToken: String,
                     cardInfo: NSDictionary,
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
        
        let cvv = cardInfo["cvv"] as? String
        let onlyCVV = cardInfo["onlyCVV"] as? Bool ?? false
        
        if onlyCVV {
            guard cvv != nil else {
                reject("INVALID_CARD_INFO", "Please enter cvv", nil)
                return
            }
        } else {
            guard let _ = cardInfo["number"] as? String,
                  let _ = cardInfo["expirationMonth"] as? String,
                  let _ = cardInfo["expirationYear"] as? String,
                  cvv != nil,
                  let _ = cardInfo["postalCode"] as? String else {
                reject("INVALID_CARD_INFO", "Invalid card info", nil)
                return
            }
        }
        
        let braintreeClient = BTAPIClient(authorization: clientToken)!
        let cardClient = BTCardClient(apiClient: braintreeClient)
        let card = BTCard()
        
        if !onlyCVV {
            card.number = cardInfo["number"] as? String
            card.expirationMonth = cardInfo["expirationMonth"] as? String
            card.expirationYear = cardInfo["expirationYear"] as? String
            card.postalCode = cardInfo["postalCode"] as? String
        }
        card.cvv = cvv
        
        cardClient.tokenize(card) { [weak self] (tokenizedCard, error) in
            if let error = error {
                reject("TOKENIZE_ERROR", "Error tokenizing card", error)
            } else if let tokenizedCard = tokenizedCard {
                var jsResult: [String: Any] = [
                    "nonce": tokenizedCard.nonce,
                    "type": "card"
                ]
                
                let dataCollector = BTDataCollector(apiClient: braintreeClient)
                dataCollector.collectDeviceData { deviceData in
                    if !deviceData.isEmpty {
                        jsResult["deviceData"] = deviceData
                        resolve(jsResult)
                    } else {
                        reject("DEVICE_DATA_ERROR", "Failed to collect device data", nil)
                    }
                }
            }
        }
    }
    
    @objc
    func collectDeviceData(_ clientToken: String,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
        
        let apiClient = BTAPIClient(authorization: clientToken)!
        let dataCollector = BTDataCollector(apiClient: apiClient)
        
        dataCollector.collectDeviceData { deviceData in
            if !deviceData.isEmpty {
                resolve(deviceData)
            } else {
                reject("DEVICE_DATA_ERROR", "Failed to collect device data", nil)
            }
        }
    }
    
    private func resolvePayment(result: BTDropInResult) {
        guard let resolve = self.currentResolve else { return }
        let resultDict = buildResultDictionary(from: result)
        resolve(resultDict)
    }
    
    private func buildResultDictionary(from result: BTDropInResult) -> [String: Any]? {
        guard let paymentMethod = result.paymentMethod else {
            return nil
        }
        
        return [
            "nonce": paymentMethod.nonce,
            "type": paymentMethod.type,
            "description": result.paymentDescription ?? "",
            "isDefault": paymentMethod.isDefault,
            "deviceData": self.deviceDataCollector
        ]
    }
    
    private func getRootViewController() -> UIViewController? {
        guard let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) else {
            return nil
        }
        
        var rootViewController = window.rootViewController
        if let presented = rootViewController?.presentedViewController {
            rootViewController = presented
        }
        
        return rootViewController
    }
}

// MARK: - PKPaymentAuthorizationViewControllerDelegate
extension RNBraintreeDropIn: PKPaymentAuthorizationViewControllerDelegate {
    
    func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController,
                                           didAuthorizePayment payment: PKPayment,
                                           handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
        
        guard let braintreeClient = self.braintreeClient else {
            completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
            return
        }
        
        let applePayClient = BTApplePayClient(apiClient: braintreeClient)
        applePayClient.tokenize(payment) { [weak self] (tokenizedPayment, error) in
            if let tokenizedPayment = tokenizedPayment {
                completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
                self?.applePayAuthorized = true
                
                let result: [String: Any] = [
                    "nonce": tokenizedPayment.nonce,
                    "type": "Apple Pay",
                    "description": "Apple Pay \(tokenizedPayment.type ?? "")",
                    "isDefault": false,
                    "deviceData": self?.deviceDataCollector ?? ""
                ]
                
                self?.currentResolve?(result)
            } else {
                completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
            }
        }
    }
    
    func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
        controller.dismiss(animated: true) { [weak self] in
            if self?.applePayAuthorized == false {
                self?.currentReject?("USER_CANCELLATION", "The user cancelled", nil)
            }
        }
    }
}
