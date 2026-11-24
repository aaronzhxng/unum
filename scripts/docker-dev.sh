#!/bin/bash

set -euo pipefail

if [[ -z "${ANDROID_SDK_ROOT:-}" ]]; then
  export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
fi

docker compose up --build app