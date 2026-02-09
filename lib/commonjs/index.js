"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _NativeRNBraintreeDropIn = _interopRequireDefault(require("./NativeRNBraintreeDropIn"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class BraintreeDropIn {
  /**
   * Show the Braintree Drop-In UI
   * @param options Configuration options for Drop-In
   * @returns Promise resolving to payment result
   */
  static show(options) {
    return _NativeRNBraintreeDropIn.default.show(options);
  }

  /**
   * Fetch the most recent payment method for a client token
   * @param clientToken Braintree client token
   * @returns Promise resolving to payment result or null
   */
  static fetchMostRecentPaymentMethod(clientToken) {
    return _NativeRNBraintreeDropIn.default.fetchMostRecentPaymentMethod(clientToken);
  }

  /**
   * Tokenize a card
   * @param clientToken Braintree client token
   * @param cardInfo Card information
   * @returns Promise resolving to payment result
   */
  static tokenizeCard(clientToken, cardInfo) {
    return _NativeRNBraintreeDropIn.default.tokenizeCard(clientToken, cardInfo);
  }

  /**
   * Collect device data for fraud detection
   * @param clientToken Braintree client token
   * @returns Promise resolving to device data string
   */
  static collectDeviceData(clientToken) {
    return _NativeRNBraintreeDropIn.default.collectDeviceData(clientToken);
  }
}
exports.default = BraintreeDropIn;
//# sourceMappingURL=index.js.map