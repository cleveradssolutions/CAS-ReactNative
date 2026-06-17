import os
import shutil

_PLUGIN_VERSION = "4.7.4"
_CAS_VERSION = "4.7.4"

# Plugin publishing flow (from the project root):
# python3 updater.py
# yarn clean
# yarn format
# yarn lint
# yarn codegen
# yarn prepare
# yarn bundle:android
# yarn test:android
# yarn test:ios
# yarn release
# https://github.com/cleveradssolutions/CAS-ReactNative/releases


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

def update_android_old_arch(source, destination):
    shutil.rmtree(destination, ignore_errors=True)
    os.makedirs(destination)

    for filename in os.listdir(source):
        filepath = os.path.join(source, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        content = content.replace('import com.facebook.react.uimanager.ViewManagerWithGeneratedInterface;', '')
        content = content.replace(' extends ViewManagerWithGeneratedInterface', '')
        content = content.replace('import com.facebook.react.turbomodule.core.interfaces.TurboModule;', '')
        content = content.replace(' implements TurboModule', '')

        filepath = os.path.join(destination, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Copy to old android arch:" + filename)

update_version_in_file(
    file_path=os.path.join("package.json"),
    prefix='  "version": "',
    suffix=_PLUGIN_VERSION + '",'
)
update_version_in_file(
    file_path=os.path.join("react-native-cas.podspec"),
    prefix="  s.dependency 'CleverAdsSolutions-Base', '",
    suffix=f"~> {_CAS_VERSION}'"
)
update_version_in_file(
    file_path=os.path.join("android", "build.gradle"),
    prefix='  implementation "com.cleveradssolutions:cas-sdk:',
    suffix=_CAS_VERSION + '"'
)
update_version_in_file(
    file_path=os.path.join("example", "android", "app", "build.gradle"),
    prefix="  id 'com.cleveradssolutions.gradle-plugin' version '",
    suffix=_CAS_VERSION + "'"
)
update_version_in_file(
    file_path=os.path.join("plugin", "src", "index.ts"),
    prefix="export const CAS_VERSION: string = '",
    suffix=_CAS_VERSION + "';"
)
shutil.copy2(
    src=os.path.join('..', 'CAS-Swift', 'PublicSamplesRepo',
                     'Script XCodeConfig', 'casconfig.rb'),
    dst=os.path.join("plugin", "casconfig.rb")
)

androidRNGeneratedSource = os.path.join("android", "build", "generated", "source", "codegen", "java", "com", "facebook", "react", "viewmanagers")
androidRNGeneratedDest = os.path.join("android", "src", "oldarch", "com", "facebook", "react", "viewmanagers")
update_android_old_arch(androidRNGeneratedSource, androidRNGeneratedDest)

androidRNGeneratedSource = os.path.join("android", "build", "generated", "source", "codegen", "java", "com", "cleveradssolutions", "plugin", "reactnative")
androidRNGeneratedDest = os.path.join("android", "src", "oldarch", "com", "cleveradssolutions", "plugin", "reactnative")
update_android_old_arch(androidRNGeneratedSource, androidRNGeneratedDest)