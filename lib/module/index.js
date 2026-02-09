import NativeRNBraintreeDropIn from './NativeRNBraintreeDropIn';
export default class BraintreeDropIn {
  /**
   * Show the Braintree Drop-In UI
   * @param options Configuration options for Drop-In
   * @returns Promise resolving to payment result
   */
  static show(options) {
    return NativeRNBraintreeDropIn.show(options);
  }

  /**
   * Fetch the most recent payment method for a client token
   * @param clientToken Braintree client token
   * @returns Promise resolving to payment result or null
   */
  static fetchMostRecentPaymentMethod(clientToken) {
    return NativeRNBraintreeDropIn.fetchMostRecentPaymentMethod(clientToken);
  }

  /**
   * Tokenize a card
   * @param clientToken Braintree client token
   * @param cardInfo Card information
   * @returns Promise resolving to payment result
   */
  static tokenizeCard(clientToken, cardInfo) {
    return NativeRNBraintreeDropIn.tokenizeCard(clientToken, cardInfo);
  }

  /**
   * Collect device data for fraud detection
   * @param clientToken Braintree client token
   * @returns Promise resolving to device data string
   */
  static collectDeviceData(clientToken) {
    return NativeRNBraintreeDropIn.collectDeviceData(clientToken);
  }
}
//# sourceMappingURL=index.js.map