import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import BraintreeDropIn, {
  type PaymentResult,
  type DropInOptions,
} from 'react-native-braintree-dropin-turbo';

// IMPORTANT: Replace with your actual Braintree client token from your server
const BRAINTREE_CLIENT_TOKEN = 'sandbox_g42y39zw_348pk9cgf3bgyw2b';

const App = () => {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [deviceData, setDeviceData] = useState<string>('');

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  // Test 1: Basic Drop-In UI with all payment methods
  const handleBasicDropIn = async () => {
    setLoading(true);
    try {
      const options: DropInOptions = {
        clientToken: BRAINTREE_CLIENT_TOKEN,
        orderTotal: 29.99,
        currencyCode: 'USD',
        venmo: true,
        payPal: true,
      };

      const result = await BraintreeDropIn.show(options);
      setPaymentResult(result);
      showAlert(
        'Success!',
        `Payment nonce received: ${result.nonce.substring(0, 20)}...`
      );
      console.log('Payment Result:', result);
    } catch (error: any) {
      if (error.message === 'USER_CANCELLATION') {
        console.log('User cancelled payment');
      } else {
        showAlert('Error', error.message);
        console.error('Payment Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Apple Pay (iOS only)
  const handleApplePay = async () => {
    if (Platform.OS !== 'ios') {
      showAlert('iOS Only', 'Apple Pay is only available on iOS devices');
      return;
    }

    setLoading(true);
    try {
      const options: DropInOptions = {
        clientToken: BRAINTREE_CLIENT_TOKEN,
        orderTotal: 49.99,
        currencyCode: 'USD',
        countryCode: 'US',
        applePay: true,
        merchantIdentifier: 'merchant.com.yourcompany.app', // Replace with your merchant ID
        merchantName: 'Your Store Name',
        venmo: true,
        payPal: true,
      };

      const result = await BraintreeDropIn.show(options);
      setPaymentResult(result);
      showAlert('Success!', `Apple Pay payment received!`);
      console.log('Apple Pay Result:', result);
    } catch (error: any) {
      if (error.message === 'USER_CANCELLATION') {
        console.log('User cancelled Apple Pay');
      } else {
        showAlert('Error', error.message);
        console.error('Apple Pay Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Google Pay (Android only)
  const handleGooglePay = async () => {
    if (Platform.OS !== 'android') {
      showAlert(
        'Android Only',
        'Google Pay is only available on Android devices'
      );
      return;
    }

    setLoading(true);
    try {
      const options: DropInOptions = {
        clientToken: BRAINTREE_CLIENT_TOKEN,
        orderTotal: 39.99,
        currencyCode: 'USD',
        googlePay: true,
        googlePayMerchantId: 'BCR2DN4T6Z3WWIJJ', // Replace with your Google merchant ID
        venmo: true,
        payPal: true,
      };

      const result = await BraintreeDropIn.show(options);
      setPaymentResult(result);
      showAlert('Success!', `Google Pay payment received!`);
      console.log('Google Pay Result:', result);
    } catch (error: any) {
      if (error.message === 'USER_CANCELLATION') {
        console.log('User cancelled Google Pay');
      } else {
        showAlert('Error', error.message);
        console.error('Google Pay Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test 4: 3D Secure
  const handle3DSecure = async () => {
    setLoading(true);
    try {
      const options: DropInOptions = {
        clientToken: BRAINTREE_CLIENT_TOKEN,
        orderTotal: 100.0,
        currencyCode: 'USD',
        threeDSecure: {
          amount: 100.0,
        },
        venmo: true,
        payPal: true,
      };

      const result = await BraintreeDropIn.show(options);
      setPaymentResult(result);
      showAlert('Success!', '3D Secure verification completed!');
      console.log('3D Secure Result:', result);
    } catch (error: any) {
      if (error.message === 'USER_CANCELLATION') {
        console.log('User cancelled 3D Secure');
      } else if (error.message.includes('3DSECURE')) {
        showAlert('3D Secure Failed', error.message);
      } else {
        showAlert('Error', error.message);
      }
      console.error('3D Secure Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Tokenize Card Directly
  const handleTokenizeCard = async () => {
    setLoading(true);
    try {
      // Test card number - DO NOT use in production
      const result = await BraintreeDropIn.tokenizeCard(
        BRAINTREE_CLIENT_TOKEN,
        {
          number: '4111111111111111',
          expirationMonth: '12',
          expirationYear: '2025',
          cvv: '123',
          postalCode: '12345',
        }
      );

      setPaymentResult(result);
      showAlert('Success!', 'Card tokenized successfully!');
      console.log('Tokenized Card Result:', result);
    } catch (error: any) {
      showAlert('Error', error.message);
      console.error('Tokenization Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test 6: Collect Device Data
  const handleCollectDeviceData = async () => {
    setLoading(true);
    try {
      const data = await BraintreeDropIn.collectDeviceData(
        BRAINTREE_CLIENT_TOKEN
      );
      setDeviceData(data);
      showAlert('Device Data Collected', `Length: ${data.length} characters`);
      console.log('Device Data:', data.substring(0, 100) + '...');
    } catch (error: any) {
      showAlert('Error', error.message);
      console.error('Device Data Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test 7: Fetch Most Recent Payment Method
  const handleFetchLastPayment = async () => {
    setLoading(true);
    try {
      const result = await BraintreeDropIn.fetchMostRecentPaymentMethod(
        BRAINTREE_CLIENT_TOKEN
      );

      if (result) {
        setPaymentResult(result);
        showAlert('Last Payment Method', result.description);
        console.log('Last Payment:', result);
      } else {
        showAlert('No Payment Found', 'No previous payment method available');
      }
    } catch (error: any) {
      showAlert('Error', error.message);
      console.error('Fetch Payment Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test 8: Vault Manager
  const handleVaultManager = async () => {
    setLoading(true);
    try {
      const options: DropInOptions = {
        clientToken: BRAINTREE_CLIENT_TOKEN,
        vaultManager: true,
        orderTotal: 25.0,
        currencyCode: 'USD',
      };

      const result = await BraintreeDropIn.show(options);
      setPaymentResult(result);
      showAlert('Success!', 'Payment method saved to vault!');
      console.log('Vault Manager Result:', result);
    } catch (error: any) {
      if (error.message === 'USER_CANCELLATION') {
        console.log('User cancelled vault manager');
      } else {
        showAlert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test 9: Dark Theme (iOS)
  const handleDarkTheme = async () => {
    if (Platform.OS !== 'ios') {
      showAlert('iOS Only', 'Dark theme is only available on iOS');
      return;
    }

    setLoading(true);
    try {
      const options: DropInOptions = {
        clientToken: BRAINTREE_CLIENT_TOKEN,
        darkTheme: true,
        orderTotal: 19.99,
        currencyCode: 'USD',
      };

      const result = await BraintreeDropIn.show(options);
      setPaymentResult(result);
      showAlert('Success!', 'Payment processed with dark theme!');
      console.log('Dark Theme Result:', result);
    } catch (error: any) {
      if (error.message === 'USER_CANCELLATION') {
        console.log('User cancelled dark theme');
      } else {
        showAlert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const TestButton = ({ title, onPress, color = '#007AFF' }: any) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      disabled={loading}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Braintree Drop-In</Text>
          <Text style={styles.subtitle}>React Native Turbo Module Example</Text>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Tests</Text>

          <TestButton
            title="1. Show Drop-In UI"
            onPress={handleBasicDropIn}
            color="#007AFF"
          />

          <TestButton
            title="2. Tokenize Test Card"
            onPress={handleTokenizeCard}
            color="#34C759"
          />

          <TestButton
            title="3. Collect Device Data"
            onPress={handleCollectDeviceData}
            color="#5856D6"
          />

          <TestButton
            title="4. Fetch Last Payment"
            onPress={handleFetchLastPayment}
            color="#AF52DE"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform-Specific</Text>

          <TestButton
            title={`5. Apple Pay (iOS Only)`}
            onPress={handleApplePay}
            color="#000000"
          />

          <TestButton
            title={`6. Google Pay (Android Only)`}
            onPress={handleGooglePay}
            color="#4285F4"
          />

          <TestButton
            title={`7. Dark Theme (iOS Only)`}
            onPress={handleDarkTheme}
            color="#1C1C1E"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Features</Text>

          <TestButton
            title="8. 3D Secure Authentication"
            onPress={handle3DSecure}
            color="#FF9500"
          />

          <TestButton
            title="9. Vault Manager"
            onPress={handleVaultManager}
            color="#FF2D55"
          />
        </View>

        {paymentResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Last Payment Result:</Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Type:</Text>
              <Text style={styles.resultValue}>{paymentResult.type}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Description:</Text>
              <Text style={styles.resultValue}>
                {paymentResult.description}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Nonce:</Text>
              <Text style={styles.resultValue} numberOfLines={1}>
                {paymentResult.nonce.substring(0, 30)}...
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Is Default:</Text>
              <Text style={styles.resultValue}>
                {paymentResult.isDefault ? 'Yes' : 'No'}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Device Data:</Text>
              <Text style={styles.resultValue} numberOfLines={1}>
                {paymentResult.deviceData.substring(0, 30)}...
              </Text>
            </View>
          </View>
        )}

        {deviceData && (
          <View style={styles.deviceDataContainer}>
            <Text style={styles.resultTitle}>Device Data:</Text>
            <Text style={styles.deviceDataText} numberOfLines={3}>
              {deviceData}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Platform: {Platform.OS === 'ios' ? 'iOS' : 'Android'}
          </Text>
          <Text style={styles.footerText}>
            ⚠️ Remember to replace BRAINTREE_CLIENT_TOKEN with your actual token
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 110,
  },
  resultValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  deviceDataContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  deviceDataText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginVertical: 4,
  },
});

export default App;
