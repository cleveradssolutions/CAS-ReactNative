//
//  MediationManagerWrapper.swift
//  react-native-cas
//
//  Created by Lonely Astronaut on 20.09.23.
//

import Foundation
import CleverAdsSolutions

typealias MediationManagerListener = (_ manager: CASMediationManager) -> Void

class MediationManagerWrapper: CASLoadDelegate {
    private init() {}
    static let shared = MediationManagerWrapper()

    private var managerChangeListeners: Dictionary<String, MediationManagerListener> = [:]
    private var adLoadListeners: Dictionary<String, CASLoadDelegate> = [:]
    
    var manager: CASMediationManager? = nil {
        didSet {
            if manager != nil {
                managerChangeListeners.values.forEach { $0(manager!) }
                manager!.adLoadDelegate = self
            }
        }
    }
    
    func addChangeListener(_ listener: @escaping MediationManagerListener) -> String {
        let key = UUID().uuidString
        managerChangeListeners[key] = listener
        return key
    }
    
    func removeChangeListener(_ key: String) {
        managerChangeListeners.removeValue(forKey: key)
    }
    
    func addLoadListener(_ listener: CASLoadDelegate) -> String {
        let key = UUID().uuidString
        adLoadListeners[key] = listener
        return key
    }
    
    func removeLoadListener(_ key: String) {
        adLoadListeners.removeValue(forKey: key)
    }
    
    func onAdLoaded(_ adType: CleverAdsSolutions.CASType) {
        adLoadListeners.values.forEach{ $0.onAdLoaded(adType) }
    }
    
    func onAdFailedToLoad(_ adType: CleverAdsSolutions.CASType, withError error: String?) {
        adLoadListeners.values.forEach{ $0.onAdFailedToLoad(adType, withError: error) }
    }
}
