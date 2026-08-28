/*
 * Copyright 2026 CleverAdsSolutions LTD, CAS.AI
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import CASMobileAdsNative from './modules/NativeCASMobileAdsModule';
import {
  type InitializationStatus,
  type InitializationParams,
  ConsentFlowStatus,
} from './types/Initialization';
import { version as reactNativeVersion } from 'react-native/Libraries/Core/ReactNativeVersion';
import { Gender, MobileAds as MobileAdsModule } from './types/MobileAds';
import type { PurchaseInfo } from './types/PurchaseInfo';


class MobileAds implements MobileAdsModule {
  initialize(casId: string, options: InitializationParams = {}): Promise<InitializationStatus> {
    if (typeof casId !== 'string') {
      return Promise.reject(new Error('initialize(casId, options?): casId must be a string'));
    }

    return CASMobileAdsNative.initialize(casId, {
      reactNativeVersion: `${reactNativeVersion.major}.${reactNativeVersion.minor}.${reactNativeVersion.patch}`,
      targetAudience:
        options.targetAudience !== undefined ? Number(options.targetAudience) : undefined,
      showConsentFormIfRequired: options.showConsentFormIfRequired ?? true,
      forceTestAds: options.forceTestAds ?? false,
      testDeviceIds: options.testDeviceIds,
      debugGeography:
        options.debugGeography !== undefined ? Number(options.debugGeography) : undefined,
      mediationExtras: options.mediationExtras,
    });
  }

  isInitialized(): Promise<boolean> {
    return CASMobileAdsNative.isInitialized();
  }

  showConsentFlow(): Promise<ConsentFlowStatus> {
    return CASMobileAdsNative.showConsentFlow();
  }

  getSDKVersion(): Promise<string> {
    return CASMobileAdsNative.getSDKVersion();
  }

  setDebugLoggingEnabled(enabled: boolean): void {
    CASMobileAdsNative.setDebugLoggingEnabled(enabled);
  }

  setAdSoundsMuted(muted: boolean): void {
    CASMobileAdsNative.setAdSoundsMuted(muted);
  }

  setUserId(id: string | null): void {
    CASMobileAdsNative.setUserId(id);
  }

  setUserAge(age: number): void {
    CASMobileAdsNative.setUserAge(age);
  }

  setUserGender(gender: Gender): void {
    CASMobileAdsNative.setUserGender(Number(gender));
  }

  setAppContentUrl(contentUrl: string | null): void {
    CASMobileAdsNative.setAppContentUrl(contentUrl);
  }

  setAppKeywords(keywords: string[]): void {
    CASMobileAdsNative.setAppKeywords(keywords);
  }

  setLocationCollectionEnabled(enabled: boolean): void {
    CASMobileAdsNative.setLocationCollectionEnabled(enabled);
  }

  setTrialAdFreeInterval(interval: number): void {
    CASMobileAdsNative.setTrialAdFreeInterval(interval);
  }

  reportPurchase(purchase: PurchaseInfo): void {
  if (!purchase || typeof purchase !== 'object') {
    throw new Error('reportPurchase(purchase): purchase must be an object');
  }

  if (typeof purchase.productId !== 'string' || purchase.productId.length === 0
  ) {
    throw new Error('reportPurchase(purchase): productId must not be empty');
  }

  if (!Number.isFinite(purchase.price) || purchase.price < 0
  ) {
    throw new Error('reportPurchase(purchase): price must be a finite non-negative number');
  }

  if (typeof purchase.currency !== 'string' || !/^[A-Za-z]{3}$/.test(purchase.currency)
  ) {
    throw new Error('reportPurchase(purchase): currency must be an ISO 4217 currency code');
  }

  const quantity = purchase.quantity ?? 1;

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error('reportPurchase(purchase): quantity must be greater than 0');
  }

CASMobileAdsNative.reportPurchase({
  productId: purchase.productId,
  price: purchase.price,
  currency: purchase.currency,
  quantity,
  isSubscription: purchase.isSubscription ?? false,

  googlePurchaseData: purchase.googlePurchaseData ?? null,
  googleDataSignature: purchase.googleDataSignature ?? null,
  googlePurchaseToken: purchase.googlePurchaseToken ?? null,
  googlePurchaseTime: purchase.googlePurchaseTime ?? 0,

  appleTransactionId: purchase.appleTransactionId ?? null,
  appleJwsRepresentation: purchase.appleJwsRepresentation ?? null,
  appleReceiptData: purchase.appleReceiptData ?? null,

  amazonReceipt: purchase.amazonReceipt ?? null,
  amazonReceiptId: purchase.amazonReceiptId ?? null,
  amazonUserId: purchase.amazonUserId ?? null,

  xsollaOrderId: purchase.xsollaOrderId ?? null,
  xsollaUserId: purchase.xsollaUserId ?? null,
});

}

}

export const CASMobileAds = new MobileAds();

export default CASMobileAds;
