import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface DropInOptions {
  clientToken: string;
  darkTheme?: boolean;
  fontFamily?: string;
  boldFontFamily?: string;
  vaultManager?: boolean;
  cardDisabled?: boolean;
  applePay?: boolean;
  merchantIdentifier?: string;
  countryCode?: string;
  currencyCode?: string;
  merchantName?: string;
  orderTotal?: number;
  venmo?: boolean;
  payPal?: boolean;
  googlePay?: boolean;
  googlePayMerchantId?: string;
  threeDSecure?: {
    amount: number;
  };
}

export interface CardInfo {
  number?: string;
  expirationMonth?: string;
  expirationYear?: string;
  cvv: string;
  postalCode?: string;
  onlyCVV?: boolean;
}

export interface PaymentResult {
  nonce: string;
  type: string;
  description: string;
  isDefault: boolean;
  deviceData: string;
}

export interface Spec extends TurboModule {
  show(options: DropInOptions): Promise<PaymentResult>;
  fetchMostRecentPaymentMethod(clientToken: string): Promise<PaymentResult | null>;
  tokenizeCard(clientToken: string, cardInfo: CardInfo): Promise<PaymentResult>;
  collectDeviceData(clientToken: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNBraintreeDropIn');
