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

/**
 * Information about an in-app purchase.
 *
 * Platform-specific validation fields are optional.
 * Provide the fields available from the IAP implementation used by the application.
 */
export interface PurchaseInfo {
  /** Product identifier from the IAP provider. */
  productId: string;

  /** Price of one purchased item in the selected currency. */
  price: number;

  /** ISO 4217 currency code, for example USD or EUR. */
  currency: string;

  /** Number of purchased items. Default: 1. */
  quantity?: number;

  /** Whether the purchased product is a subscription. */
  isSubscription?: boolean;

  // Google Play

  /** Original Google Play purchase JSON. */
  googlePurchaseData?: string | null;

  /** Google Play purchase signature. */
  googleDataSignature?: string | null;

  /** Google Play purchase token. */
  googlePurchaseToken?: string | null;

  /** Google Play purchase time in milliseconds since Unix epoch. */
  googlePurchaseTime?: number;

  // Apple App Store

  /** StoreKit transaction identifier. */
  appleTransactionId?: string | null;

  /** StoreKit 2 signed JWS representation. */
  appleJwsRepresentation?: string | null;

  /** Base64 encoded legacy App Store receipt. */
  appleReceiptData?: string | null;

  // Amazon Appstore

  /** JSON representation of the Amazon receipt. */
  amazonReceipt?: string | null;

  /** Amazon receipt identifier. */
  amazonReceiptId?: string | null;

  /** Amazon IAP user identifier. */
  amazonUserId?: string | null;

  // Xsolla

  /** Xsolla order identifier. */
  xsollaOrderId?: string | null;

  /** Xsolla user identifier. */
  xsollaUserId?: string | null;
}