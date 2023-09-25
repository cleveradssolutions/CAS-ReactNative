//
//  CASSettings+NSDictionary.swift
//  react-native-cas
//
//  Created by Lonely Astronaut on 20.09.23.
//

import Foundation
import CleverAdsSolutions

extension CASSettings {
    func toDictionary() -> NSDictionary {
        return [
            "taggedAudience": self.taggedAudience.rawValue,
            "ccpaStatus": self.userCCPAStatus.rawValue,
            "debugMode": self.debugMode,
            "allowInterstitialAdsWhenVideoCostAreLower": self.isInterstitialAdsWhenVideoCostAreLowerAllowed(),
            "bannerRefreshInterval": self.bannerRefreshInterval,
            "interstitialInterval": self.interstitialInterval,
            "loadingMode": self.getLoadingMode().rawValue,
            "mutedAdSounds": self.mutedAdSounds,
            "userConsent": self.userConsent.rawValue,
            "trackLocation": self.isTrackLocationEnabled(),
            "deprecated_analyticsCollectionEnabled": self.isAnalyticsCollectionEnabled()
        ]
    }
    
    func fromDictionary(jsMap: NSDictionary) {
        if let testDeviceIDs = jsMap["testDeviceIDs"] as? [String] {
            setTestDevice(ids: testDeviceIDs)
        }
        
        if let _taggedAudience = jsMap["taggedAudience"] as? Double {
            taggedAudience = CASAudience(rawValue: Int(_taggedAudience))!
        }
        
        if let _ccpaStatus = jsMap["taggedAudience"] as? Double {
            userCCPAStatus = CASCCPAStatus(rawValue: Int(_ccpaStatus))!
        }
        
        if let _debugMode = jsMap["debugMode"] as? Bool {
            debugMode = _debugMode
        }
        
        if let _allowInterstitialAdsWhenVideoCostAreLower = jsMap["allowInterstitialAdsWhenVideoCostAreLower"] as? Bool {
            setInterstitialAdsWhenVideoCostAreLower(allow: _allowInterstitialAdsWhenVideoCostAreLower)
        }
        
        if let _bannerRefreshInterval = jsMap["bannerRefreshInterval"] as? Double {
            bannerRefreshInterval = Int(_bannerRefreshInterval)
        }
        
        if let _interstitialInterval = jsMap["interstitialInterval"] as? Double {
            interstitialInterval = Int(_interstitialInterval)
        }
        
        if let _loadingMode = jsMap["loadingMode"] as? Double {
            setLoading(mode: CASLoadingManagerMode(rawValue: Int(_loadingMode))!)
        }
        
        if let _mutedAdSounds = jsMap["mutedAdSounds"] as? Bool {
            mutedAdSounds = _mutedAdSounds
        }
        
        if let _trackLocation = jsMap["trackLocation"] as? Bool {
            setTrackLocation(enabled: _trackLocation)
        }
        
        if let _userConsent = jsMap["userConsent"] as? Double {
            userConsent = CASConsentStatus(rawValue: Int(_userConsent))!
        }
        
        if let _deprecated_analyticsCollectionEnabled = jsMap["deprecated_analyticsCollectionEnabled"] as? Bool {
            setAnalyticsCollection(enabled: _deprecated_analyticsCollectionEnabled)
        }
    }
}
