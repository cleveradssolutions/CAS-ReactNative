/*
 * Copyright 2025 CleverAdsSolutions LTD, CAS.AI
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

import type { AdError, AdContentInfo } from '../../types/AdContent';

/**
 * Represents a loaded and managed Native Ad instance.
 * 
 * Provides lifecycle management (load, destroy), event handling,
 * and additional configuration parameters for muting, AdChoices, etc.
 */
export type NativeAdType = {
    /**
     * Manually retries loading the native ad.
     * 
     * The ad view will try to fetch a new ad and will trigger:
     * - `addAdLoadedEventListener` on success
     * - `addAdFailedToLoadEventListener` on failure
     */
    loadAd: () => void;

    /**
     * Enables or disables native ad muting (UI and audio behavior).
     * 
     * @param enabled - If true, the ad will start muted (if supported).
     */
    setNativeMutedEnabled(enabled: boolean): void;

    /**
     * Sets the placement of the AdChoices icon.
     *
     * Typical values:
     * - 0 — top-left
     * - 1 — top-right
     * - 2 — bottom-left
     * - 3 — bottom-right
     *
     * Implementation may vary depending on the underlying SDK.
     *
     * @param adChoicesPlacement - numeric placement enum
     */
    setNativeAdChoisesPlacement(adChoicesPlacement: number): void;

    /**
     * Frees all underlying native ad resources.
     * Must be called when the ad is no longer displayed.
     */
    destroyAd: () => void;

    /**
     * Fired when an ad successfully loads.
     *
     * @returns a disposer function to remove the listener.
     */
    addAdLoadedEventListener(l: () => void): () => void;

    /**
     * Fired when loading a native ad fails.
     *
     * @param error - detailed error object.
     * @returns a disposer function to remove the listener.
     */
    addAdFailedToLoadEventListener(l: (error: AdError) => void): () => void;

    /**
     * Fired when the user clicks the native ad.
     *
     * @returns a disposer function to remove the listener.
     */
    addAdClickedEventListener(l: () => void): () => void;

    /**
     * Fired when an impression occurs for this native ad.
     *
     * The callback receives a full `AdContentInfo` data object from the SDK.
     *
     * @returns a disposer function to remove the listener.
     */
    addAdImpressionEventListener(l: (info: AdContentInfo) => void): () => void;
};
