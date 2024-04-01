//
//  CASTargetingOptions+NSDictionary.swift
//  react-native-cas
//
//  Created by Lonely Astronaut on 20.09.23.
//

import Foundation
import CleverAdsSolutions

extension CASTargetingOptions {
    func toDictionary() -> NSDictionary {
        return [
            "age": self.getAge(),
            "gender": self.getGender().rawValue,
            "location": [
                "latitude": self.getLatitude(),
                "longitude": self.getLongitude()
            ]
        ]
    }
    
    func fromDictionary(jsMap: NSDictionary) {
        if let gender = jsMap["gender"] as? Double {
            self.setGender(Gender(rawValue: Int(gender))!)
        }
        
        if let age = jsMap["age"] as? Double {
            self.setAge(Int(age))
        }
        
        if let location = jsMap["location"] as? NSDictionary {
            if let latitude = location["latitude"] as? Double, let longitude = location["longitude"] as? Double {
                self.setLocation(latitude: latitude, longitude: longitude)
            }
        }
        
        if let contentUrl = jsMap["contentUrl"] as? String {
            self.setContentUrl(contentUrl)
        }
        
        if let keywords = jsMap["keywords"] as? [String] {
            self.setKeywords(keywords)
        }
    }
}
