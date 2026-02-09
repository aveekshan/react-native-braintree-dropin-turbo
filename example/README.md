# Braintree Drop-In Example App

This is a complete example React Native application demonstrating all features of the `react-native-braintree-dropin-turbo` library.

## 🚀 Features Demonstrated

### Basic Features
- ✅ Show Drop-In UI with all payment methods
- ✅ Tokenize card directly (without UI)
- ✅ Collect device data for fraud detection
- ✅ Fetch most recent payment method

### Platform-Specific Features
- ✅ Apple Pay (iOS only)
- ✅ Google Pay (Android only)
- ✅ Dark theme support (iOS only)

### Advanced Features
- ✅ 3D Secure authentication
- ✅ Vault Manager for saved payment methods

## 📋 Prerequisites

- Node.js >= 14
- React Native CLI
- For iOS:
  - Xcode 14+
  - CocoaPods
  - iOS 13+ device or simulator
- For Android:
  - Android Studio
  - Android SDK
  - Android device or emulator (API 21+)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd example
npm install
# or
yarn install
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

**Configure Apple Pay (Optional):**

1. Open `ios/BraintreeDropInExample.xcworkspace` in Xcode
2. Select your project → Signing & Capabilities
3. Add "Apple Pay" capability
4. Configure your Merchant ID

### 3. Android Setup

No additional setup needed! The `MainActivity.kt` is already configured to initialize the Braintree Drop-In client.

### 4. Configure Braintree Token

⚠️ **IMPORTANT**: Replace the demo token in `App.tsx`:

```typescript
// Replace this line:
const BRAINTREE_CLIENT_TOKEN = 'sandbox_g42y39zw_348pk9cgf3bgyw2b';

// With your actual client token from your server:
const BRAINTREE_CLIENT_TOKEN = 'your_actual_client_token_here';
```

**How to get a client token:**
1. Set up a Braintree sandbox account at https://sandbox.braintreegateway.com
2. Create a server endpoint that generates client tokens
3. Fetch the token in your app

Example server code (Node.js):
```javascript
const braintree = require('braintree');

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'your_merchant_id',
  publicKey: 'your_public_key',
  privateKey: 'your_private_key'
});

app.get('/client_token', async (req, res) => {
  const response = await gateway.clientToken.generate({});
  res.send(response.clientToken);
});
```

## 🏃 Running the App

### iOS

```bash
npm run ios
# or
yarn ios

# For specific device
npx react-native run-ios --device "iPhone 15 Pro"
```

### Android

```bash
npm run android
# or
yarn android

# For specific device
npx react-native run-android --deviceId=DEVICE_ID
```

## 🧪 Testing Payment Methods

### Test Card Numbers (Sandbox)

Use these test cards in the Braintree sandbox:

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | 123 | Any future date |
| Mastercard | 5555 5555 5555 4444 | 123 | Any future date |
| Amex | 3782 822463 10005 | 1234 | Any future date |
| Discover | 6011 1111 1111 1117 | 123 | Any future date |

### 3D Secure Test Cards

| Card Number | Result |
|-------------|--------|
| 4000 0000 0000 0002 | 3DS authentication successful |
| 4000 0000 0000 0010 | 3DS authentication failed |

### Apple Pay Testing (iOS)

1. Add a test card to Wallet app on simulator/device
2. In sandbox, Apple Pay transactions won't actually charge
3. Use test cards provided by Braintree

### Google Pay Testing (Android)

1. Add a test card to Google Pay
2. Enable Google Pay in your Braintree sandbox
3. Use the configured merchant ID

### Venmo Testing

1. Install Venmo app on your device
2. Log in with a sandbox Venmo account
3. Test the Venmo flow

## 📱 App Features Guide

### 1. Show Drop-In UI
Displays the full Braintree Drop-In interface with:
- Credit/Debit card input
- Saved payment methods
- Venmo option
- PayPal option

### 2. Tokenize Test Card
Directly tokenizes a test card without showing any UI. Useful for:
- CVV-only verification
- Quick testing
- Backend integration testing

### 3. Collect Device Data
Collects device fingerprint data for fraud detection. This should be sent to your server along with the payment nonce.

### 4. Fetch Last Payment
Retrieves the most recently used payment method. Useful for:
- Quick checkout
- Subscription renewals
- Showing saved payment info

### 5. Apple Pay (iOS Only)
Tests Apple Pay integration:
- Native Apple Pay sheet
- Biometric authentication
- Seamless checkout

### 6. Google Pay (Android Only)
Tests Google Pay integration:
- Google Pay sheet
- One-tap payment
- Saved Google Pay cards

### 7. Dark Theme (iOS Only)
Shows the Drop-In UI with dark theme styling.

### 8. 3D Secure Authentication
Demonstrates 3D Secure flow:
- Additional verification step
- Enhanced security
- Liability shift

### 9. Vault Manager
Shows saved payment methods and allows:
- Managing saved cards
- Deleting payment methods
- Adding new methods

## 🔧 Customization

### Change Payment Amount

Edit in `App.tsx`:
```typescript
const options: DropInOptions = {
  clientToken: BRAINTREE_CLIENT_TOKEN,
  orderTotal: 99.99, // Change this
  currencyCode: 'USD',
  // ...
};
```

### Enable/Disable Payment Methods

```typescript
const options: DropInOptions = {
  clientToken: BRAINTREE_CLIENT_TOKEN,
  venmo: true,        // Enable Venmo
  payPal: false,      // Disable PayPal
  cardDisabled: false, // Enable cards
  // ...
};
```

### Custom Styling (iOS)

```typescript
const options: DropInOptions = {
  clientToken: BRAINTREE_CLIENT_TOKEN,
  darkTheme: true,
  fontFamily: 'YourCustomFont-Regular',
  boldFontFamily: 'YourCustomFont-Bold',
  // ...
};
```

## 🐛 Troubleshooting

### iOS Issues

**"No such module 'BraintreeDropIn'"**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Apple Pay not working**
- Ensure you have a valid Merchant ID
- Check that Apple Pay capability is enabled
- Verify your device supports Apple Pay

### Android Issues

**"Drop-In client not initialized"**
- Make sure `RNBraintreeDropInModule.initDropInClient(this)` is called in `MainActivity.onCreate()`
- Verify MainActivity extends `FragmentActivity`

**Google Pay not appearing**
- Check that Google Pay meta-data is in AndroidManifest.xml
- Verify your Google Merchant ID is correct
- Ensure Google Pay is enabled in Braintree dashboard

### Common Issues

**"No Client Token" Error**
- Make sure you've replaced the demo token with your actual token
- Verify your server is generating valid tokens

**"User Cancellation" Error**
- This is normal when user closes the UI
- Not an actual error, just handle it gracefully

**Network Errors**
- Check your internet connection
- Verify Braintree API is accessible
- Check server logs for token generation issues

## 📖 Code Structure

```
example/
├── App.tsx              # Main app with all test buttons
├── package.json         # Dependencies
├── index.js            # Entry point
├── app.json            # App configuration
├── ios/                # iOS-specific files
│   ├── Podfile
│   └── ...
└── android/            # Android-specific files
    ├── app/
    │   ├── build.gradle
    │   └── src/main/
    │       ├── AndroidManifest.xml
    │       └── java/com/braintreedroptinexample/
    │           ├── MainActivity.kt
    │           └── MainApplication.kt
    └── build.gradle
```

## 🎯 Next Steps

1. ✅ Get your Braintree client token
2. ✅ Replace the demo token in App.tsx
3. ✅ Test all payment methods
4. ✅ Configure Apple Pay (iOS) or Google Pay (Android)
5. ✅ Set up your server to process payments
6. ✅ Handle payment results and send to server
7. ✅ Implement error handling
8. ✅ Test in production environment

## 📚 Additional Resources

- [Braintree Documentation](https://developers.braintreepayments.com/)
- [Drop-In UI Guide](https://developers.braintreepayments.com/guides/drop-in/overview)
- [3D Secure Guide](https://developers.braintreepayments.com/guides/3d-secure/overview)
- [Apple Pay Guide](https://developers.braintreepayments.com/guides/apple-pay/overview)
- [Google Pay Guide](https://developers.braintreepayments.com/guides/google-pay/overview)

## 💡 Tips

- Always test in sandbox before production
- Implement proper error handling
- Send device data with payment nonce
- Never hardcode sensitive credentials
- Use environment variables for tokens
- Test on real devices, not just emulators

## 🆘 Getting Help

If you encounter issues:
1. Check this README
2. Review the parent library documentation
3. Check Braintree documentation
4. Open an issue on GitHub

---

Happy Testing! 🎉
