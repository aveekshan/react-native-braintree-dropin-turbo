# Migration Guide

## Migrating from Old Braintree Drop-In Implementation

This guide helps you migrate from the legacy Braintree implementation to the new Turbo Module version.

## Key Differences

### Architecture
- **Old**: Bridge-based module
- **New**: Turbo Module with full New Architecture support

### SDK Versions
- **iOS**: Upgraded to Braintree 6.0, BraintreeDropIn 9.0
- **Android**: Upgraded to Drop-In 6.16.0, Card 4.45.0

### Language
- **iOS**: Migrated from Objective-C to Swift
- **Android**: Migrated from Java to Kotlin

## Breaking Changes

### 1. Import Statement

**Old:**
```javascript
import RNBraintreeDropIn from 'react-native-braintree-dropin';
```

**New:**
```typescript
import BraintreeDropIn from 'react-native-braintree-dropin-turbo';
```

### 2. Method Calls

**Old:**
```javascript
RNBraintreeDropIn.show(options)
  .then(result => {
    console.log(result.nonce);
  })
  .catch(error => {
    console.error(error);
  });
```

**New:**
```typescript
try {
  const result = await BraintreeDropIn.show(options);
  console.log(result.nonce);
} catch (error) {
  console.error(error);
}
```

### 3. Options Structure

Most options remain the same, but there are some changes:

**Old:**
```javascript
{
  clientToken: 'token',
  darkTheme: true,
  merchantIdentifier: 'merchant.id', // iOS
  // ...
}
```

**New (unchanged, but TypeScript-typed):**
```typescript
{
  clientToken: 'token',
  darkTheme: true,
  merchantIdentifier: 'merchant.id',
  // ...
}: DropInOptions
```

### 4. Android Setup Changes

**Old:**
```java
// No special initialization needed
```

**New:**
```kotlin
import com.braintreedroptinturbo.RNBraintreeDropInModule

class MainActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RNBraintreeDropInModule.initDropInClient(this)
    }
}
```

**Important:** MainActivity must now extend `FragmentActivity` instead of `ReactActivity`.

### 5. Package Name Changes

**Old (AndroidManifest.xml):**
```xml
<!-- Old package name -->
```

**New:**
```kotlin
package com.braintreedroptinturbo
```

### 6. iOS Podspec

**Old:**
```ruby
pod 'RNBraintreeDropIn', :path => '../node_modules/react-native-braintree-dropin'
```

**New (auto-linked):**
```ruby
# No manual podspec needed - auto-linked
# Or if manual:
pod 'react-native-braintree-dropin-turbo', :path => '../node_modules/react-native-braintree-dropin-turbo'
```

## Step-by-Step Migration

### Step 1: Uninstall Old Package

```bash
npm uninstall react-native-braintree-dropin
# or
yarn remove react-native-braintree-dropin
```

### Step 2: Clean iOS Pods

```bash
cd ios
rm -rf Pods Podfile.lock
cd ..
```

### Step 3: Install New Package

```bash
npm install react-native-braintree-dropin-turbo
# or
yarn add react-native-braintree-dropin-turbo
```

### Step 4: Update iOS

```bash
cd ios
pod install
cd ..
```

### Step 5: Update Android MainActivity

Update your `MainActivity.kt` (or convert from .java to .kt):

```kotlin
import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.braintreedroptinturbo.RNBraintreeDropInModule

class MainActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RNBraintreeDropInModule.initDropInClient(this)
    }
    
    // If you have other ReactActivity methods, you may need to adjust them
}
```

### Step 6: Update Import Statements

Find and replace in your codebase:

```bash
# Find
import RNBraintreeDropIn from 'react-native-braintree-dropin';

# Replace with
import BraintreeDropIn from 'react-native-braintree-dropin-turbo';
```

### Step 7: Update Method Calls

Convert from promise chains to async/await (recommended):

**Before:**
```javascript
RNBraintreeDropIn.show(options)
  .then(result => {
    // handle result
  })
  .catch(error => {
    // handle error
  });
```

**After:**
```typescript
try {
  const result = await BraintreeDropIn.show(options);
  // handle result
} catch (error) {
  // handle error
}
```

### Step 8: Add TypeScript Types (Optional but Recommended)

If using TypeScript, add proper typing:

```typescript
import BraintreeDropIn, { 
  type DropInOptions, 
  type PaymentResult 
} from 'react-native-braintree-dropin-turbo';

const options: DropInOptions = {
  clientToken: 'your-token',
  orderTotal: 10.00,
  // ...
};

const result: PaymentResult = await BraintreeDropIn.show(options);
```

### Step 9: Test Thoroughly

Test all payment flows:
- Credit/Debit cards
- Apple Pay (iOS)
- Google Pay (Android)
- Venmo
- PayPal
- 3D Secure

## API Changes

### Unchanged Methods

These methods work the same way:
- `show(options)` - Display Drop-In UI
- `fetchMostRecentPaymentMethod(clientToken)` - Get last payment method
- `tokenizeCard(clientToken, cardInfo)` - Tokenize a card

### New Methods

- `collectDeviceData(clientToken)` - Now available as a standalone method

### Return Types

The return types are now properly typed with TypeScript:

```typescript
interface PaymentResult {
  nonce: string;
  type: string;
  description: string;
  isDefault: boolean;
  deviceData: string;
}
```

## Compatibility

### React Native Version Support

- **Old**: React Native 0.60+
- **New**: React Native 0.68+ (Turbo Modules support)

If you're on an older React Native version, you'll need to upgrade first.

### New Architecture

The new package supports both:
- Old Architecture (Bridge)
- New Architecture (Turbo Modules)

Enable New Architecture by setting:
- iOS: `ENV['RCT_NEW_ARCH_ENABLED'] = '1'` in Podfile
- Android: `newArchEnabled=true` in gradle.properties

## Common Migration Issues

### Issue 1: MainActivity Compilation Error

**Error:** "MainActivity must extend FragmentActivity"

**Solution:**
```kotlin
// Change from
class MainActivity : ReactActivity()

// To
class MainActivity : FragmentActivity()
```

### Issue 2: Swift Bridging Header

**Error:** "No such module 'BraintreeDropIn'"

**Solution:** 
1. Clean and rebuild
2. Check Swift version is 5.0+
3. Run `pod install` again

### Issue 3: Android Build Failures

**Error:** Various Gradle errors

**Solution:**
```bash
cd android
./gradlew clean
cd ..
# Rebuild
```

### Issue 4: Type Errors

**Error:** TypeScript type mismatches

**Solution:** Make sure you're importing types:
```typescript
import type { DropInOptions, PaymentResult } from 'react-native-braintree-dropin-turbo';
```

## Testing After Migration

Create a test checklist:

- [ ] Drop-In UI displays correctly
- [ ] Card payment works
- [ ] Apple Pay works (iOS)
- [ ] Google Pay works (Android)
- [ ] Venmo works
- [ ] PayPal works
- [ ] 3D Secure verification works
- [ ] Error handling works
- [ ] Device data collection works
- [ ] Vault manager works (if used)

## Rollback Plan

If you need to rollback:

```bash
# Uninstall new package
npm uninstall react-native-braintree-dropin-turbo

# Reinstall old package
npm install react-native-braintree-dropin@[old-version]

# Clean iOS
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Revert MainActivity changes
# Rebuild
```

## Benefits of Migration

1. ✅ **Performance**: Turbo Modules are faster than the old bridge
2. ✅ **Latest SDKs**: Access to latest Braintree features and security updates
3. ✅ **Type Safety**: Full TypeScript support
4. ✅ **Future-proof**: Compatible with React Native's New Architecture
5. ✅ **Better Maintenance**: Modern codebase with Swift and Kotlin
6. ✅ **Improved Error Handling**: Better error messages and handling

## Getting Help

If you encounter issues during migration:

1. Check this migration guide
2. Review the [Installation Guide](./INSTALLATION.md)
3. Check closed issues on GitHub
4. Open a new issue with:
   - Old package version
   - New package version
   - React Native version
   - Complete error messages
   - Migration steps attempted

## Timeline Recommendation

- **Testing Phase**: 1-2 days
- **Migration**: 2-3 hours
- **QA Testing**: 1-2 days
- **Monitoring**: 1 week post-release

Good luck with your migration! 🚀
