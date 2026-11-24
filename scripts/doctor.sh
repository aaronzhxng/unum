#!/usr/bin/env bash
set -e

echo "Checking mise tools..."
mise current

echo "Checking ANDROID_HOME..."
: "${ANDROID_HOME:=$HOME/Library/Android/sdk}"
echo "ANDROID_HOME=$ANDROID_HOME"
test -d "$ANDROID_HOME/platform-tools" || echo "WARNING: Android SDK platform-tools not found at $ANDROID_HOME"

echo "Checking for stray ' 2.' files in node_modules..."
find node_modules -name "* 2.*" 2>/dev/null || true
