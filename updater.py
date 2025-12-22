import os

_PLUGIN_VERSION = "4.5.4"
_CAS_VERSION = "4.5.4"

# Plugin publishing flow (from the project root):
# python3 updater.py
# yarn clean
# yarn format
# yarn lint
# yarn codegen
# yarn prepare
# yarn test:android
# yarn test:ios
# yarn release

def update_version_in_file(file_path, prefix, suffix):
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    success = False
    with open(file_path, 'w', encoding='utf-8') as file:
        for line in lines:
            if line.startswith(prefix):
                file.write(prefix + suffix + '\n')
                success = True
            else:
                file.write(line)
    
    if success:
        print("Updated " + file_path)
    else:
        raise RuntimeError(f"Prefix {prefix} not found in file: {file_path}")

        
def update_package_json():
    update_version_in_file(
        file_path=os.path.join("package.json"),
        prefix='  "version": "',
        suffix=_PLUGIN_VERSION + '",'
    )
    

def update_podspec():   
    update_version_in_file(
        file_path=os.path.join("react-native-cas.podspec"),
        prefix="  s.dependency 'CleverAdsSolutions-Base', '",
        suffix=f"~> {_CAS_VERSION}'"
    )

def update_android_gradle_sdk():  
    update_version_in_file(
        file_path=os.path.join("android", "build.gradle"),
        prefix='  implementation "com.cleveradssolutions:cas-sdk:',
        suffix=_CAS_VERSION + '"'
    )

def update_android_gradle_example():  
    update_version_in_file(
        file_path=os.path.join("example", "android", "app", "build.gradle"),
        prefix="  id 'com.cleveradssolutions.gradle-plugin' version '",
        suffix=_CAS_VERSION + "'"
    )
      
if __name__ == "__main__":
    update_package_json()
    update_podspec()
    update_android_gradle_sdk()
    update_android_gradle_example()