import os
import re
import json

_PLUGIN_VERSION = "4.3.1"
_CAS_VERSION = "4.3.0"

def update_package_json():
    path = os.path.join("package.json")

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    old_version = data.get("version")
    data["version"] = _PLUGIN_VERSION

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    print(f"Updated {path}: {old_version} to {data['version']}")


def update_podspec():    
    path = os.path.join("react-native-cas.podspec")

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = re.sub(
        r"s\.dependency\s+'CleverAdsSolutions-Base',\s*'~>\s*[\d\.]+'",
        f"s.dependency 'CleverAdsSolutions-Base', '~> {_CAS_VERSION}'",
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Updated {path} dependency to {_CAS_VERSION}")


def update_android_gradle_sdk():    
    path = os.path.join("android", "build.gradle")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = re.sub(
        r'implementation\s+"com\.cleveradssolutions:cas-sdk:[\d\.]+"',
        f'implementation "com.cleveradssolutions:cas-sdk:{_CAS_VERSION}"',
        content
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Updated {path} CAS SDK version to {_CAS_VERSION}")


def update_android_gradle_example():    
    path = os.path.join("example", "android", "app", "build.gradle")

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = re.sub(
        r"id\s+'com\.cleveradssolutions\.gradle-plugin'\s+version\s+'[\d\.]+'",
        f"id 'com.cleveradssolutions.gradle-plugin' version '{_CAS_VERSION}'",
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Updated {path} plugin version to { _CAS_VERSION }")

if __name__ == "__main__":
    update_package_json()
    update_podspec()
    update_android_gradle_sdk()
    update_android_gradle_example()