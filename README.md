# react-native-braintree-dropin-turbo

Modern Braintree Drop-In UI for React Native with Turbo Modules support.

## Features

- ✅ Turbo Modules support (React Native 0.68+)
- ✅ Latest Braintree SDK versions
- ✅ iOS (Swift) and Android (Kotlin)
- ✅ Apple Pay support (iOS)
- ✅ Google Pay support (Android)
- ✅ Venmo support
- ✅ PayPal support
- ✅ 3D Secure support
- ✅ Card tokenization
- ✅ Device data collection

## Installation

```bash
npm install react-native-braintree-dropin-turbo
# or
yarn add react-native-braintree-dropin-turbo
```

### iOS Setup

1. Install pods:
```bash
cd ios && pod install
```

2. Add to your `Info.plist` for Apple Pay:
```xml
<key>com.apple.developer.in-app-payments</key>
<array>
    <string>merchant.your.merchant.identifier</string>
</array>
```

### Android Setup

1. Initialize DropIn client in your `MainActivity.kt`:

```kotlin
import com.braintreedroptinturbo.RNBraintreeDropInModule

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RNBraintreeDropInModule.initDropInClient(this)
    }
}
```

2. Make sure your MainActivity extends `FragmentActivity`:

```kotlin
import androidx.fragment.app.FragmentActivity

class MainActivity : FragmentActivity() {
    // ...
}
```

## Usage

### Basic Usage

```typescript
import BraintreeDropIn from 'react-native-braintree-dropin-turbo';

try {
  const result = await BraintreeDropIn.show({
    clientToken: 'YOUR_CLIENT_TOKEN',
    orderTotal: 10.00,
    currencyCode: 'USD',
  });
  
  console.log('Payment nonce:', result.nonce);
  console.log('Device data:', result.deviceData);
  // Send result.nonce to your server
} catch (error) {
  if (error.message === 'USER_CANCELLATION') {
    console.log('User cancelled payment');
  } else {
    console.error('Payment error:', error);
  }
}
```

### With Apple Pay (iOS)

```typescript
const result = await BraintreeDropIn.show({
  clientToken: 'YOUR_CLIENT_TOKEN',
  applePay: true,
  merchantIdentifier: 'merchant.your.identifier',
  countryCode: 'US',
  currencyCode: 'USD',
  merchantName: 'Your Store',
  orderTotal: 10.00,
});
```

### With Google Pay (Android)

```typescript
const result = await BraintreeDropIn.show({
  clientToken: 'YOUR_CLIENT_TOKEN',
  googlePay: true,
  googlePayMerchantId: 'YOUR_MERCHANT_ID',
  orderTotal: 10.00,
  currencyCode: 'USD',
});
```

### With 3D Secure

```typescript
const result = await BraintreeDropIn.show({
  clientToken: 'YOUR_CLIENT_TOKEN',
  threeDSecure: {
    amount: 10.00,
  },
});
```

### Tokenize Card Directly

```typescript
const result = await BraintreeDropIn.tokenizeCard(
  'YOUR_CLIENT_TOKEN',
  {
    number: '4111111111111111',
    expirationMonth: '12',
    expirationYear: '2025',
    cvv: '123',
    postalCode: '12345',
  }
);
```

### Collect Device Data

```typescript
const deviceData = await BraintreeDropIn.collectDeviceData('YOUR_CLIENT_TOKEN');
// Send to your server for fraud detection
```

### Fetch Most Recent Payment Method

```typescript
const paymentMethod = await BraintreeDropIn.fetchMostRecentPaymentMethod(
  'YOUR_CLIENT_TOKEN'
);

if (paymentMethod) {
  console.log('Last payment:', paymentMethod.description);
}
```

## API Reference

### `show(options: DropInOptions): Promise<PaymentResult>`

Display the Braintree Drop-In UI.

#### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `clientToken` | string | ✅ | Braintree client token |
| `orderTotal` | number | ❌ | Total amount for the transaction |
| `currencyCode` | string | ❌ | Currency code (default: 'USD') |
| `darkTheme` | boolean | ❌ | Use dark theme (iOS only) |
| `fontFamily` | string | ❌ | Custom font family (iOS only) |
| `boldFontFamily` | string | ❌ | Custom bold font family (iOS only) |
| `vaultManager` | boolean | ❌ | Enable vault manager |
| `cardDisabled` | boolean | ❌ | Disable card payments |
| `applePay` | boolean | ❌ | Enable Apple Pay (iOS only) |
| `merchantIdentifier` | string | ❌ | Apple Pay merchant ID (required if applePay is true) |
| `countryCode` | string | ❌ | Country code for Apple Pay |
| `merchantName` | string | ❌ | Merchant name for Apple Pay |
| `venmo` | boolean | ❌ | Enable Venmo |
| `payPal` | boolean | ❌ | Enable PayPal |
| `googlePay` | boolean | ❌ | Enable Google Pay (Android only) |
| `googlePayMerchantId` | string | ❌ | Google Pay merchant ID |
| `threeDSecure` | object | ❌ | 3D Secure configuration |
| `threeDSecure.amount` | number | ❌ | Amount for 3D Secure verification |

#### Returns

```typescript
interface PaymentResult {
  nonce: string;          // Payment method nonce
  type: string;           // Payment method type
  description: string;    // Payment method description
  isDefault: boolean;     // Is default payment method
  deviceData: string;     // Device data for fraud detection
}
```

### `tokenizeCard(clientToken: string, cardInfo: CardInfo): Promise<PaymentResult>`

Tokenize a card without showing the UI.

```typescript
interface CardInfo {
  number?: string;
  expirationMonth?: string;
  expirationYear?: string;
  cvv: string;
  postalCode?: string;
  onlyCVV?: boolean;  // If true, only CVV is required
}
```

### `collectDeviceData(clientToken: string): Promise<string>`

Collect device data for fraud detection.

### `fetchMostRecentPaymentMethod(clientToken: string): Promise<PaymentResult | null>`

Fetch the most recently used payment method.

## Error Handling

```typescript
try {
  const result = await BraintreeDropIn.show(options);
} catch (error) {
  switch (error.message) {
    case 'USER_CANCELLATION':
      // User cancelled the payment flow
      break;
    case 'NO_CLIENT_TOKEN':
      // Client token was not provided
      break;
    case '3DSECURE_NOT_ABLE_TO_SHIFT_LIABILITY':
      // 3D Secure verification failed
      break;
    default:
      // Other errors
      console.error(error);
  }
}
```

## Braintree SDK Versions

- **iOS**: Braintree ~> 6.0, BraintreeDropIn ~> 9.0
- **Android**: Drop-In 6.16.0, Card 4.45.0, Data Collector 4.45.0

## Requirements

- React Native >= 0.68
- iOS >= 13.0
- Android minSdkVersion >= 21

## New Architecture (Turbo Modules)

This library supports the New Architecture out of the box. No additional configuration needed.

## License

MIT

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/yourusername/react-native-braintree-dropin-turbo).
