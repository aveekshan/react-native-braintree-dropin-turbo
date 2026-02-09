#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNBraintreeDropIn, NSObject)

RCT_EXTERN_METHOD(show:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(fetchMostRecentPaymentMethod:(NSString *)clientToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(tokenizeCard:(NSString *)clientToken
                  cardInfo:(NSDictionary *)cardInfo
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(collectDeviceData:(NSString *)clientToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end
