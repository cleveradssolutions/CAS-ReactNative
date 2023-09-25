import { MediationManager } from '../modules/mediation-manager.module';
import type { StyleProp, ViewStyle } from 'react-native';

export type ConsentFlowParams = {
  enabled?: boolean;
  privacyPolicy?: string;
  requestGDPR?: boolean;
  requestATT?: boolean;
};

export type MediationExtraParams = {
  key: string;
  value: string;
};

export enum AdType {
  Banner = 0,
  Interstitial,
  Rewarded,
  Native,
  None,
  AppOpen,
}

export enum Gender {
  Unknown = 0,
  Male,
  Female,
}

export enum Audience {
  Undefined = 0,
  Children,
  NotChildren,
}

export enum CCPAStatus {
  Undefined = 0,
  OptOutSale,
  OptInSale,
}

export enum LoadingManagerMode {
  FastestRequests = 0,
  FastRequests,
  Optimal,
  HighPerformance,
  HighestPerformance,
  Manual,
}

export enum ConsentStatus {
  Undefined = 0,
  Accepted,
  Denied,
}

export enum MediationManagerEvent {
  AdFailedToLoad = 'adFailedToLoad',
  AdLoaded = 'adLoaded',
}

export type Location = {
  accuracy: number;
  altitude: number;
  bearing: number;
  latitude: number;
  longitude: number;
};

export type BuildManagerParams = {
  casId?: string;
  consentFlow?: ConsentFlowParams;
  managerId?: string;
  userId?: string;
  testMode?: boolean;
  adTypes?: Array<AdType>;
  mediationExtra?: MediationExtraParams;
};

export type TargetingOptions = {
  age: number;
  gender: Gender;
  location?: Location;
};

export type AudienceNetworkDataProcessingOptions = {
  country?: number;
  state?: number;
  options: Array<string>;
};

export type CASSettings = {
  taggedAudience: Audience;
  ccpaStatus: CCPAStatus;
  debugMode: boolean;
  allowInterstitialAdsWhenVideoCostAreLower: boolean;
  bannerRefreshInterval: number;
  interstitialInterval: number;
  loadingMode: LoadingManagerMode;
  mutedAdSounds: boolean;
  userConsent: ConsentStatus;
  deprecated_analyticsCollectionEnabled: boolean;
  trackLocation?: boolean; // iOS Only
  testDeviceIDs: Array<string>;
};

export type DismissConsentFlowEvent = {
  status: number;
  settings: CASSettings;
};

export type onDismissConsentFlowListener = (
  params: DismissConsentFlowEvent
) => void;

export type BuildManagerResultNative = {
  error?: string;
  countryCode?: string;
  isConsentRequired: boolean;
};

export type BuildManagerResult = {
  result: BuildManagerResultNative;
  manager: MediationManager;
};

export type LastPageAdContent = {
  headline: string;
  adText: string;
  destinationURL: string;
  imageURL?: string;
  iconURL?: string;
};

export enum BannerAdSize {
  Banner = 'BANNER',
  Leaderboard = 'LEADERBOARD',
  MediumRectangle = 'MEDIUM_RECTANGLE',
  Adaptive = 'ADAPTIVE',
  Smart = 'SMART',
}

export type BannerAdProps = {
  style?: StyleProp<ViewStyle>;
  size: BannerAdSize;
  maxWidthDpi?: number;
  onAdViewLoaded?: () => void;
  onAdViewFailed?: (e: AdViewFailedEvent) => void;
  onAdViewClicked?: () => void;
  onAdViewPresented?: (e: AdViewPresentedEvent) => void;
  isAutoloadEnabled?: boolean;
  refreshInterval?: number;
};

export type AdViewFailedEvent = {
  message: string;
  code: number;
};

export type AdImpression = {
  adType: AdType;
  cpm: number;
  error?: string;
  identifier: string;
  impressionDepth: number;
  lifetimeRevenue: number;
  network: string;
  priceAccuracy: number;
  status: string;
  versionInfo: string;
  creativeIdentifier?: string;
};

export type AdViewPresentedEvent = {
  impression: AdImpression;
};

export type BannerAdRef = {
  loadNextAd: () => Promise<void>;
  isAdReady: () => Promise<boolean>;
};

export type ShowAdCallbacks = {
  onImpression?: (ad: AdImpression) => void;
  onShown?: () => void;
  onShowFailed?: (message: string) => void;
  onClicked?: () => void;
  onComplete?: () => void;
  onClosed?: () => void;
};

type InternalListener = {
  type: AdType;
  error?: string;
};

export type MediationManagerEventListener = (data: InternalListener) => void;
