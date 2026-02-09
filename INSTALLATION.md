# Installation Guide

## Prerequisites

- React Native >= 0.68
- iOS >= 13.0
- Android minSdkVersion >= 21
- Node.js >= 14
- CocoaPods (for iOS)

## Step-by-Step Installation

### 1. Install the Package

```bash
npm install react-native-braintree-dropin-turbo
# or
yarn add react-native-braintree-dropin-turbo
```

### 2. iOS Setup

#### 2.1 Install Pods

```bash
cd ios && pod install && cd ..
```

#### 2.2 Configure Apple Pay (Optional)

If you want to use Apple Pay, add the following to your `Info.plist`:

```xml
<key>com.apple.developer.in-app-payments</key>
<array>
    <string>merchant.your.merchant.identifier</string>
</array>
```

You also need to enable Apple Pay in your Apple Developer account:
1. Go to Certificates, Identifiers & Profiles
2. Select your App ID
3. Enable "Apple Pay"
4. Create a Merchant ID

#### 2.3 Swift Bridging (if needed)

If you don't have a Swift bridging header yet, Xcode will create one automatically when you build the project.

### 3. Android Setup

#### 3.1 Update MainActivity

Open `android/app/src/main/java/[your-package]/MainActivity.kt` (or `.java`) and add:

**For Kotlin:**

```kotlin
import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.braintreedroptinturbo.RNBraintreeDropInModule

class MainActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RNBraintreeDropInModule.initDropInClient(this)
    }
}
```

**For Java:**

```java
import android.os.Bundle;
import androidx.fragment.app.FragmentActivity;
import com.braintreedroptinturbo.RNBraintreeDropInModule;

public class MainActivity extends FragmentActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        RNBraintreeDropInModule.initDropInClient(this);
    }
}
```

#### 3.2 Update build.gradle (if needed)

Make sure your `android/build.gradle` has:

```gradle
buildscript {
    ext {
        minSdkVersion = 21
        compileSdkVersion = 33
        targetSdkVersion = 33
    }
}
```

#### 3.3 Configure Google Pay (Optional)

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
    ...
    <meta-data
        android:name="com.google.android.gms.wallet.api.enabled"
        android:value="true" />
</application>
```

### 4. New Architecture (Optional)

This library supports the New Architecture out of the box. To enable it:

#### 4.1 iOS

In `ios/Podfile`:

```ruby
ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```

Then run:
```bash
cd ios && pod install && cd ..
```

#### 4.2 Android

In `android/gradle.properties`:

```properties
newArchEnabled=true
```

### 5. Rebuild Your App

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## Troubleshooting

### iOS Issues

**Pod Install Fails:**
```bash
cd ios
pod repo update
pod install --repo-update
```

**Swift Version Mismatch:**
Make sure your project is using Swift 5.0+. Check in Xcode:
Project Settings → Build Settings → Swift Language Version

**Apple Pay Not Working:**
- Verify your Merchant ID in Apple Developer Console
- Check that the Merchant ID matches in your Info.plist
- Ensure Apple Pay is enabled for your App ID

### Android Issues

**FragmentActivity Error:**
Make sure your MainActivity extends `FragmentActivity` instead of `ReactActivity`.

**Gradle Build Fails:**
Try:
```bash
cd android
./gradlew clean
cd ..
```

**Drop-In Client Not Initialized:**
Ensure you called `RNBraintreeDropInModule.initDropInClient(this)` in `MainActivity.onCreate()`.

**Google Pay Not Working:**
- Add the Google Pay meta-data to AndroidManifest.xml
- Verify your Google Pay Merchant ID
- Test with a test card in sandbox mode first

### Common Issues

**"No Client Token" Error:**
Make sure you're passing a valid client token from your server.

**"User Cancellation" on Android:**
This is normal when the user closes the Drop-In UI. Handle it gracefully in your error handling.

**TypeScript Errors:**
Make sure you're using TypeScript 4.0+ and have proper type definitions installed.

## Verification

To verify the installation, create a simple test:

```typescript
import BraintreeDropIn from 'react-native-braintree-dropin-turbo';

// Test device data collection (doesn't require UI)
const testInstallation = async () => {
  try {
    const deviceData = await BraintreeDropIn.collectDeviceData('sandbox_test_token');
    console.log('✅ Installation successful!', deviceData);
  } catch (error) {
    console.error('❌ Installation issue:', error);
  }
};

testInstallation();
```

## Next Steps

- Get your Braintree client token from your server
- Review the [API Reference](./README.md#api-reference)
- Check out the [Example App](./example/App.tsx)
- Test in sandbox mode before production

## Support

For issues:
1. Check this guide
2. Review closed issues on GitHub
3. Open a new issue with:
   - React Native version
   - OS and version
   - Error messages
   - Steps to reproduce
