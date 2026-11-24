#!/usr/bin/env bash
set -e

echo "Checking mise tools..."
mise current

echo "Checking ANDROID_HOME..."
if [ -z "${ANDROID_HOME:-}" ]; then
  if [ -d "$HOME/Library/Android/sdk" ]; then
    ANDROID_HOME="$HOME/Library/Android/sdk"
  elif [ -d "$HOME/Android/Sdk" ]; then
    ANDROID_HOME="$HOME/Android/Sdk"
  fi
fi
echo "ANDROID_HOME=${ANDROID_HOME:-<unset>}"
if [ -n "${ANDROID_HOME:-}" ] && [ -d "$ANDROID_HOME/platform-tools" ]; then
  echo "OK: Android SDK platform-tools found"
else
  echo "WARNING: Android SDK platform-tools not found"
fi

echo "Checking for stray ' 2.' files in node_modules..."
find node_modules -name "* 2.*" 2>/dev/null || true

echo "Checking Android Google Services config..."
if grep -q '"googleServicesFile"' app.json 2>/dev/null && [ ! -f "google-services.json" ]; then
  echo "WARN: app.json references ./google-services.json, but it is not present in the repo root."
  echo "      npx expo run:android will fail during prebuild unless google-services.json is placed here."
else
  echo "OK: google-services.json check passed"
fi
