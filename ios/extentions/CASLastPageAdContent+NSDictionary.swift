//
//  CASLastPageAdContent+NSDictionary.swift
//  react-native-cas
//
//  Created by Lonely Astronaut on 21.09.23.
//

import Foundation
import CleverAdsSolutions

extension CASLastPageAdContent {
    static func fromDictionary(jsMap: NSDictionary) -> CASLastPageAdContent {
        return CASLastPageAdContent(
            headline: jsMap["headline"] as? String ?? "",
            adText: jsMap["adText"] as? String ?? "",
            destinationURL: jsMap["destinationURL"] as? String ?? "",
            imageURL: jsMap["imageURL"] as? String ?? "",
            iconURL: jsMap["iconURL"] as? String ?? ""
        )
    }
}
