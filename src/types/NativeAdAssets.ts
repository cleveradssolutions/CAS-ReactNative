import { StyleProp, TextStyle } from 'react-native';

export enum NativeAdAssetType {

  HEADLINE       = 101,
  MEDIA          = 102,
  CALL_TO_ACTION = 103,
  ICON           = 104,
  BODY           = 105,
  PRICE          = 106,
  ADVERTISER     = 107,
  STORE          = 108,
  STAR_RATING    = 109,
  REVIEW_COUNT   = 110,
  AD_LABEL       = 111,
  AD_CHOICES     = 112
};

export type NativeAdAssetRef = {
};

export interface NativeAdAssetProps {
  assetType: NativeAdAssetType;
  style?: StyleProp<TextStyle> | undefined;
};