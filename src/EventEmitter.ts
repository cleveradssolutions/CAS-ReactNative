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

import { NativeEventEmitter } from 'react-native';
import CASMobileAdsNative from './modules/NativeCASMobileAdsModule';

type Unsubscribe = () => void;

const counts = new Map<string, number>();

const emitter = new NativeEventEmitter(CASMobileAdsNative);

export function addAdEventListener<T = void>(
  event: string,
  listener: (payload: T) => void,
): Unsubscribe {
  if (typeof listener !== 'function') {
    throw new Error(`addAdEventListener(_, *) 'listener' expected a function.`);
  }
  CASMobileAdsNative.addListener(event);
  counts.set(event, (counts.get(event) ?? 0) + 1);

  const sub = emitter.addListener(event, listener);

  return () => {
    sub.remove();
    CASMobileAdsNative.removeListeners(1);
    const next = (counts.get(event) ?? 1) - 1;
    next <= 0 ? counts.delete(event) : counts.set(event, next);
  };
}

export function removeAllAdEventListeners(event: string): void {
  const n = counts.get(event) ?? 0;
  if (n > 0) {
    CASMobileAdsNative.removeListeners(n);
    counts.delete(event);
  }
  emitter.removeAllListeners(event);
}
