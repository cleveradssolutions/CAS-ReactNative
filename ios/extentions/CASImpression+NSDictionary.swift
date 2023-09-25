//
//  CASImpression+NSDictionary.swift
//  react-native-cas
//
//  Created by Lonely Astronaut on 21.09.23.
//

import Foundation
import CleverAdsSolutions

extension CASImpression {
    func toDictionary() -> [AnyHashable: Any] {
        return [
            "adType": adType.rawValue,
            "cpm": cpm,
            "error": error,
            "identifier": identifier,
            "impressionDepth": impressionDepth,
            "lifetimeRevenue": lifetimeRevenue,
            "network": network,
            "priceAccuracy": priceAccuracy,
            "status": status,
            "versionInfo": versionInfo,
            "creativeIdentifier": creativeIdentifier ?? ""
        ]
    }
}
